import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CreditCard, Truck, Calendar, Clock, Plus, CreditCard as Edit2 } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState("home");

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

  const savedAddresses = [
    {
      id: "home",
      label: "Home",
      address: "123 Sweet Street, Cake Town, Mumbai, 400001",
      isDefault: true
    },
    {
      id: "office",
      label: "Office",
      address: "456 Business Park, Corporate City, Mumbai, 400002",
      isDefault: false
    }
  ];

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
  }, [navigate]);

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

      // Check if customer already exists
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerDetails.phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update customer details
        await supabase
          .from('customers')
          .update({
            name: customerDetails.name,
            email: customerDetails.email || null,
            address: deliveryAddress
          })
          .eq('id', customerId);
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerDetails.name,
            phone: customerDetails.phone,
            email: customerDetails.email || null,
            address: deliveryAddress
          })
          .select('id')
          .single();

        if (customerError) {
          console.error('Error creating customer:', customerError);
          throw customerError;
        }
        customerId = newCustomer.id;
      }

      // Store customer phone for future coupon validation
      localStorage.setItem('customer_phone', customerDetails.phone);

      // Prepare order notes with delivery preferences
      const orderNotes = [
        deliveryInfo.instructions,
        deliveryInfo.time ? `Preferred time: ${deliveryInfo.time}` : '',
        deliveryInfo.date ? `Delivery date: ${deliveryInfo.date}` : ''
      ].filter(Boolean).join('\n');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          total_amount: orderSummary.total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
          delivery_name: customerDetails.name,
          delivery_phone: customerDetails.phone,
          delivery_address: deliveryAddress,
          order_notes: orderNotes,
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
            product_id: item.id,
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

      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Order #${order.id.slice(-8)} has been confirmed. You'll receive updates shortly.`
      });
      
      // Navigate to profile orders tab
      navigate('/profile?tab=orders');
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
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{item.basePrice * item.quantity}</span>
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
    </div>
  );
};

export default Checkout;