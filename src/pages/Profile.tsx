import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Heart, ShoppingBag, RefreshCw, Lock, Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector } from "@/store/hooks";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: ""
  });

  // Mock liked cakes (you can implement this with Supabase later)
  const likedCakes = [
    { id: 1, name: "Chocolate Birthday Delight", price: 899, image: "/placeholder.svg" },
    { id: 2, name: "Rainbow Layer Cake", price: 1299, image: "/placeholder.svg" },
    { id: 3, name: "Elegant Wedding Cake", price: 2499, image: "/placeholder.svg" },
  ];

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserProfile({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: ""
      });
      fetchUserOrders();
    }
  }, [isAuthenticated, user]);

  const fetchUserOrders = async () => {
    if (!user?.phone) return;
    
    setOrdersLoading(true);
    try {
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
            products (
              name
            )
          )
        `)
        .eq('delivery_phone', user.phone)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        const formattedOrders = data?.map(order => ({
          id: order.id.slice(-8), // Show last 8 characters
          date: new Date(order.created_at).toLocaleDateString(),
          total: order.total_amount,
          status: order.status,
          items: order.order_items?.map(item => 
            `${item.products?.name} (${item.quantity})`
          ) || [],
          delivery_address: order.delivery_address
        })) || [];
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }, 1000);
  };

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Link Sent",
      description: "Check your email for password reset instructions.",
    });
    setShowPasswordReset(false);
  };

  const refetchOrders = () => {
    fetchUserOrders();
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

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="favorites">Favorite Cakes</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
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
                      <div className="flex">
                        <Button variant="outline" size="sm" className="rounded-r-none px-3">
                          +91
                        </Button>
                        <Input 
                          id="phone" 
                          value={userProfile.phone.replace('+91 ', '')}
                          onChange={(e) => setUserProfile({...userProfile, phone: `+91 ${e.target.value}`})}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={userProfile.address}
                        onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorite Cakes Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favorite Cakes
                  </CardTitle>
                  <CardDescription>
                    Your liked and saved cakes for future orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {likedCakes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {likedCakes.map((cake) => (
                        <div key={cake.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-4xl">🍰</span>
                          </div>
                          <h3 className="font-semibold mb-1">{cake.name}</h3>
                          <p className="text-primary font-bold">₹{cake.price}</p>
                          <Button size="sm" className="w-full mt-2">
                            Order Again
                          </Button>
                        </div>
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
            <TabsContent value="orders" className="space-y-6">
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