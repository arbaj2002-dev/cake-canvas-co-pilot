import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CreditCard, Truck, Calendar, Clock, Plus, CreditCard as Edit2, Minus, Package } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const Checkout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState("home");
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@example.com"
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    date: "",
    time: "",
    instructions: ""
  });

  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: "home",
      label: "Home",
      address: "",
      isDefault: true
    }
  ]);

  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    pincode: "",
    landmark: ""
  });

  // Get cart data from localStorage
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    discountAmount: 0,
    total: 0,
    appliedCoupon: null
  });

  useEffect(() => {
    // Load checkout data from localStorage
    const checkoutData = localStorage.getItem('checkout_data');
    if (checkoutData) {
      const data = JSON.parse(checkoutData);
      setOrderSummary({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        discountAmount: data.discountAmount || 0,
        total: data.total || 0,
        appliedCoupon: data.appliedCoupon || null
      });
    } else {
      // Redirect to cart if no data
      navigate('/cart');
    }
    
    // Fetch available addons
    fetchAddons();
    
    // Fetch user profile to pre-fill address
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('address, phone, full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && profile) {
          // Update customer details
          setCustomerDetails({
            name: profile.full_name || customerDetails.name,
            phone: profile.phone || customerDetails.phone,
            email: user.email || customerDetails.email
          });

          // Update home address if available
          if (profile.address) {
            setSavedAddresses([
              {
                id: "home",
                label: "Home",
                address: profile.address,
                isDefault: true
              }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select('id, name, description, price, type')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setAvailableAddons(data);
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
  };

  const handleAddonChange = (itemIndex: number, addon: any, change: number) => {
    setOrderSummary(prev => {
      const newItems = [...prev.items];
      const item = newItems[itemIndex];
      const existingAddon = item.addons?.find((a: any) => a.id === addon.id);
      
      if (existingAddon) {
        const newQuantity = existingAddon.quantity + change;
        if (newQuantity <= 0) {
          item.addons = item.addons.filter((a: any) => a.id !== addon.id);
        } else {
          item.addons = item.addons.map((a: any) =>
            a.id === addon.id ? { ...a, quantity: newQuantity } : a
          );
        }
      } else if (change > 0) {
        item.addons = [...(item.addons || []), {
          id: addon.id,
          name: addon.name,
          price: addon.price,
          quantity: 1
        }];
      }
      
      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => {
        const itemTotal = item.basePrice * item.quantity;
        const addonsTotal = (item.addons || []).reduce((addonSum: number, addon: any) => 
          addonSum + (addon.price * addon.quantity), 0);
        return sum + itemTotal + addonsTotal;
      }, 0);
      
      const discountAmount = prev.appliedCoupon ? Math.round(subtotal * prev.discount / 100) : 0;
      const total = subtotal - discountAmount;
      
      // Update localStorage
      const checkoutData = {
        items: newItems,
        subtotal,
        discount: prev.discount,
        discountAmount,
        total,
        appliedCoupon: prev.appliedCoupon
      };
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        discountAmount,
        total
      };
    });
  };

  const getAddonQuantity = (itemIndex: number, addonId: string) => {
    const item = orderSummary.items[itemIndex];
    return item?.addons?.find((a: any) => a.id === addonId)?.quantity || 0;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Validation
    if (!customerDetails.name || !customerDetails.phone || !deliveryInfo.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    if (selectedAddress === 'new' && (!newAddress.street || !newAddress.city || !newAddress.pincode)) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all address fields.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Prepare delivery address
      const deliveryAddress = selectedAddress === 'new'
        ? `${newAddress.street}, ${newAddress.city}, ${newAddress.pincode}${newAddress.landmark ? ', Near ' + newAddress.landmark : ''}`
        : savedAddresses.find(addr => addr.id === selectedAddress)?.address || '';

      // Store customer phone for future coupon validation
      localStorage.setItem('customer_phone', customerDetails.phone);

      // Get logged-in user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Create order using correct schema fields
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id || null,
          delivery_name: customerDetails.name,
          delivery_phone: customerDetails.phone,
          delivery_address: deliveryAddress,
          order_notes: `Delivery Date: ${deliveryInfo.date}${deliveryInfo.time ? ', Time: ' + deliveryInfo.time : ''}${deliveryInfo.instructions ? ', Instructions: ' + deliveryInfo.instructions : ''}`,
          total_amount: orderSummary.total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      for (const item of orderSummary.items) {
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.productId,
            product_size_id: item.sizeId,
            quantity: item.quantity,
            unit_price: item.basePrice,
            custom_message: item.customMessage || null
          })
          .select('id')
          .single();

        if (itemError) {
          console.error('Error creating order item:', itemError);
          continue;
        }

        // Create order addons if any
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            const { error: addonError } = await supabase
              .from('order_addons')
              .insert({
                order_item_id: orderItem.id,
                addon_id: addon.id,
                quantity: addon.quantity,
                unit_price: addon.price
              });

            if (addonError) {
              console.error('Error creating order addon:', addonError);
            }
          }
        }
      }

      // Clear cart data
      localStorage.removeItem('checkout_data');
      dispatch(clearCart());

      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Order #${order.id.slice(-8)} has been confirmed. You'll receive updates shortly.`
      });
      
      // Navigate to profile orders tab
      navigate('/profile?tab=my-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Something went wrong while placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="hero-text text-4xl mb-4">Checkout</h1>
            <p className="text-lg text-muted-foreground">
              Review your order and complete your purchase
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {savedAddresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-2">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={address.id} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.address}
                            </p>
                          </Label>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="new" id="new" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="new" className="cursor-pointer font-medium">
                          Add New Address
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {selectedAddress === "new" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address-label">Address Label</Label>
                          <Input
                            id="address-label"
                            placeholder="e.g., Home, Office"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pin Code</Label>
                          <Input
                            id="pincode"
                            placeholder="400001"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          placeholder="House no, Street name"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="Mumbai"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            placeholder="Near XYZ Mall"
                            value={newAddress.landmark}
                            onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Delivery Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="delivery-date">Delivery Date *</Label>
                      <Input
                        id="delivery-date"
                        type="date"
                        min={getMinDeliveryDate()}
                        value={deliveryInfo.date}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery-time">Preferred Time</Label>
                      <Select value={deliveryInfo.time} onValueChange={(value) => setDeliveryInfo({...deliveryInfo, time: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                          <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery-instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="delivery-instructions"
                      placeholder="Any special delivery instructions..."
                      value={deliveryInfo.instructions}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, instructions: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Cash on Delivery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Online Payment (UPI/Cards)
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-3 text-sm text-muted-foreground">
                    {paymentMethod === "cod" ? (
                      <p>💵 Pay with cash when your order is delivered to your doorstep.</p>
                    ) : (
                      <p>💳 Secure online payment using UPI, Credit/Debit cards, or Net Banking.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderSummary.items.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size} • Qty: {item.quantity}</p>
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Add-ons: {item.addons.map((a: any) => `${a.name} (${a.quantity})`).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.basePrice * item.quantity}</p>
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              +₹{item.addons.reduce((sum: number, a: any) => sum + (a.price * a.quantity), 0)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setEditingItemIndex(index);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Add More Add-ons
                      </Button>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal}</span>
                  </div>
                  
                  {orderSummary.appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({orderSummary.discount}%)</span>
                      <span>-₹{orderSummary.discountAmount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{orderSummary.total}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full bg-gradient-button shadow-button text-lg py-6"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Place Order - ₹{orderSummary.total}
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    <p>By placing this order, you agree to our terms and conditions.</p>
                    <p>🔒 Your payment information is secure and encrypted.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>📞 Call us: +91 89750 48440</p>
                  <p>📧 Email: support@sweetcakes.com</p>
                  <p>💬 Live chat available 9 AM - 9 PM</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add-ons Drawer for Mobile */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] w-full">
          <DrawerHeader>
            <DrawerTitle>Customize Add-ons</DrawerTitle>
            <DrawerDescription>
              {editingItemIndex !== null && orderSummary.items[editingItemIndex] && (
                <>Select add-ons for {orderSummary.items[editingItemIndex].name}</>
              )}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="overflow-y-auto px-4 pb-4 space-y-3">
            {editingItemIndex !== null && availableAddons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex-1">
                  <p className="font-medium text-sm">{addon.name}</p>
                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                  <p className="text-sm font-semibold mt-1 text-primary">₹{addon.price}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {editingItemIndex !== null && getAddonQuantity(editingItemIndex, addon.id) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAddonChange(editingItemIndex, addon, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {editingItemIndex !== null && getAddonQuantity(editingItemIndex, addon.id) > 0 && (
                    <span className="w-6 text-center font-medium">
                      {getAddonQuantity(editingItemIndex, addon.id)}
                    </span>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => editingItemIndex !== null && handleAddonChange(editingItemIndex, addon, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <DrawerFooter className="border-t">
            <Button 
              className="w-full bg-gradient-button"
              onClick={() => setIsDrawerOpen(false)}
            >
              Confirm Add-ons
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Checkout;