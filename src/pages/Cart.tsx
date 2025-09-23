import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, Tag, Gift } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeFromCart, updateCartItemQuantity, updateCartItemAddons } from "@/store/slices/cartSlice";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItemQuantity({ id: itemId, quantity: newQuantity }));
  };

  const removeItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart"
    });
  };

  const updateAddonQuantity = (itemId: string, addonId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    const updatedAddons = newQuantity === 0 
      ? item.addons.filter(addon => addon.id !== addonId)
      : item.addons.map(addon =>
          addon.id === addonId ? { ...addon, quantity: newQuantity } : addon
        );
    
    dispatch(updateCartItemAddons({ id: itemId, addons: updatedAddons }));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "MY_FIRST_CAKE20" && !appliedCoupon) {
      setAppliedCoupon("MY_FIRST_CAKE20");
      setDiscount(20);
      toast({
        title: "Coupon Applied!",
        description: "You got 20% off on your first order! 🎉"
      });
    } else if (appliedCoupon) {
      toast({
        title: "Coupon Already Applied",
        description: "You can only use one coupon per order"
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please check your coupon code",
        variant: "destructive"
      });
    }
    setCouponCode("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order"
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.basePrice * item.quantity;
      const addonsTotal = item.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
      return total + itemTotal + addonsTotal;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="hero-text text-4xl mb-4">Shopping Cart</h1>
            <p className="text-lg text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Base Item */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name} ({item.size})</p>
                          <p className="text-sm text-muted-foreground">
                            Base Price: ₹{item.basePrice}
                          </p>
                          {item.customMessage && (
                            <p className="text-sm text-muted-foreground">
                              Message: "{item.customMessage}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Addons */}
                      {item.addons.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Add-ons:</h4>
                          {item.addons.map((addon) => (
                            <div key={addon.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm">{addon.name}</p>
                                <p className="text-xs text-muted-foreground">₹{addon.price} each</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAddonQuantity(item.id, addon.id, addon.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">{addon.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAddonQuantity(item.id, addon.id, addon.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          Item Total: ₹{(item.basePrice * item.quantity) + 
                            item.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                {/* Coupon Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Coupon Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button onClick={applyCoupon} variant="outline">
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-red-500"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      <p>💡 First time customer? Use code <strong>MY_FIRST_CAKE20</strong> for 20% off!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{finalTotal}</span>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-button shadow-button"
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Empty Cart
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any cakes yet. Start exploring our delicious collection!
              </p>
              <Button onClick={() => navigate('/cakes')}>
                Browse Cakes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;