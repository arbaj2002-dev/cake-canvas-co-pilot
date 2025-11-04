import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Heart, ShoppingBag, RefreshCw, Lock } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useSearchParams } from "react-router-dom";
import CakeCard from "@/components/CakeCard";
import { setFavorites } from "@/store/slices/favoritesSlice";
import { setSession } from "@/store/slices/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user, isAuthenticated, session } = useAppSelector(state => state.auth);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  // Favorites state
  const [favoriteCakes, setFavoriteCakes] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Get tab from URL
  const activeTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchUserOrders();
      fetchFavoriteCakes();
    }
  }, [isAuthenticated, user]);

  // Refetch orders when navigating to my-orders tab
  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'my-orders') {
      fetchUserOrders();
    }
  }, [activeTab, isAuthenticated, user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    setProfileLoading(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile({
        name: data?.full_name || "",
        phone: data?.phone || "",
        email: authUser.user?.email || "",
        address: data?.address || ""
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchFavoriteCakes = async () => {
    setFavoritesLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            base_price,
            image_url,
            description,
            categories (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        const formattedFavorites = data?.map(fav => ({
          id: fav.products?.id || '',
          name: fav.products?.name || '',
          basePrice: fav.products?.base_price || 0,
          imageUrl: fav.products?.image_url || '',
          description: fav.products?.description || '',
          category: fav.products?.categories?.name || ''
        })) || [];
        setFavoriteCakes(formattedFavorites);
        
        // Sync with Redux
        dispatch(setFavorites(formattedFavorites));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    try {
      console.log('Fetching orders for user:', user.id);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          delivery_address,
          order_items (
            quantity,
            unit_price,
            products (
              name
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        return;
      }

      if (data && data.length > 0) {
        console.log('Orders found:', data.length);
        const formattedOrders = data.map((order: any) => ({
          id: order.id.slice(-8),
          date: new Date(order.created_at).toLocaleDateString(),
          total: order.total_amount,
          status: order.status,
          items: order.order_items?.map((item: any) =>
            `${item.products?.name} (${item.quantity})`
          ) || [],
          delivery_address: order.delivery_address
        }));
        setOrders(formattedOrders);
      } else {
        console.log('No orders found for this user');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Exception while fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userProfile.name,
          address: userProfile.address
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update authSlice with new user data
      dispatch(setSession({
        session,
        user: {
          ...user,
          name: userProfile.name,
        }
      }));

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Password Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
      setShowPasswordReset(false);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const refetchOrders = () => {
    fetchUserOrders();
  };

  const refetchFavorites = () => {
    fetchFavoriteCakes();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'ongoing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="hero-text text-4xl mb-4">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your account details and view your orders
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="favourites">Favorite Cakes</TabsTrigger>
              <TabsTrigger value="my-orders">My Orders</TabsTrigger>
            </TabsList>

            {/* Profile Details Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={userProfile.phone}
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email"
                            value={userProfile.email}
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            value={userProfile.address}
                            onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={isLoading}
                          className="bg-gradient-button shadow-button"
                        >
                          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
                          Update Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPasswordReset(true)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Reset Password
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorite Cakes Tab */}
            <TabsContent value="favourites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Favorite Cakes
                    </div>
                    <Button variant="outline" size="sm" onClick={refetchFavorites}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Your liked and saved cakes for future orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : favoriteCakes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteCakes.map((cake) => (
                        <CakeCard
                          key={cake.id}
                          id={cake.id}
                          name={cake.name}
                          basePrice={cake.basePrice}
                          imageUrl={cake.imageUrl}
                          description={cake.description}
                          category={cake.category}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No favorite cakes yet. Start exploring and save your favorites!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="my-orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order History
                    </div>
                    <Button variant="outline" size="sm" onClick={refetchOrders}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Track your orders and view order details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">Order #{order.id}</h3>
                                <Badge 
                                  className={`${getStatusColor(order.status)} text-white`}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {order.date} • ₹{order.total}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(order.items) ? order.items.join(", ") : "No items"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet. Start shopping for delicious cakes!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Password Reset Modal */}
        <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email address to receive password reset instructions.
              </p>
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input id="reset-email" type="email" value={userProfile.email} readOnly />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordReset} className="flex-1">
                  Send Reset Link
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Details Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Order Date</Label>
                    <p className="font-medium">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="font-medium">₹{selectedOrder.total}</p>
                  </div>
                  <div>
                    <Label>Items</Label>
                    <p className="font-medium">
                      {Array.isArray(selectedOrder.items) ? selectedOrder.items.join(", ") : "No items"}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Delivery Address</Label>
                  <p className="font-medium">{selectedOrder.delivery_address}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
