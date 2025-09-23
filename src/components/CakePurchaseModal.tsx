import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, CartAddon } from "@/store/slices/cartSlice";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CakePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cake: {
    id: string;
    name: string;
    basePrice: number;
    imageUrl: string;
    description?: string;
    category?: string;
  };
}

interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
}

interface ProductSize {
  id: string;
  size_name: string;
  weight: string | null;
  price_multiplier: number;
}

export const CakePurchaseModal = ({ isOpen, onClose, cake }: CakePurchaseModalProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAddons();
      fetchSizes();
    }
  }, [isOpen, cake.id]);

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select('id, name, description, price, type')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching addons:', error);
      } else {
        setAvailableAddons(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('id, size_name, weight, price_multiplier')
        .eq('product_id', cake.id)
        .order('price_multiplier');

      if (error) {
        console.error('Error fetching sizes:', error);
      } else {
        const sizes = data || [];
        setAvailableSizes(sizes);
        if (sizes.length > 0) {
          setSelectedSize(sizes[0]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddonChange = (addon: Addon, change: number) => {
    setSelectedAddons(current => {
      const existing = current.find(item => item.id === addon.id);
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          return current.filter(item => item.id !== addon.id);
        }
        return current.map(item =>
          item.id === addon.id ? { ...item, quantity: newQuantity } : item
        );
      } else if (change > 0) {
        return [...current, { 
          id: addon.id, 
          name: addon.name, 
          price: addon.price, 
          quantity: 1 
        }];
      }
      return current;
    });
  };

  const getAddonQuantity = (addonId: string) => {
    return selectedAddons.find(item => item.id === addonId)?.quantity || 0;
  };

  const calculateTotal = () => {
    const sizeMultiplier = selectedSize?.price_multiplier || 1;
    const basePrice = cake.basePrice * sizeMultiplier;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    return basePrice + addonsTotal;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart.",
        variant: "destructive"
      });
      return;
    }

    const cartItem = {
      id: `${cake.id}-${selectedSize.id}-${Date.now()}`,
      name: cake.name,
      basePrice: cake.basePrice * (selectedSize.price_multiplier || 1),
      imageUrl: cake.imageUrl,
      size: selectedSize.size_name,
      addons: selectedAddons,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    toast({
      title: "Added to Cart! 🎉",
      description: `${cake.name} (${selectedSize.size_name}) has been added to your cart.`
    });
    
    // Reset form
    setSelectedAddons([]);
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{cake.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cake Image and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={cake.imageUrl}
                alt={cake.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-primary">₹{cake.basePrice}</p>
                {cake.category && (
                  <Badge variant="secondary" className="mt-2">{cake.category}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {cake.description || "Delicious handcrafted cake made with premium ingredients"}
              </p>
              
              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Select 
                    value={selectedSize?.id || ""} 
                    onValueChange={(value) => {
                      const size = availableSizes.find(s => s.id === value);
                      setSelectedSize(size || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.size_name}
                          {size.price_multiplier !== 1 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (₹{Math.round(cake.basePrice * size.price_multiplier)})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons Section */}
          {availableAddons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add-ons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{addon.name}</p>
                      {addon.description && (
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                      )}
                      <p className="text-sm text-primary font-medium">₹{addon.price}</p>
                      <Badge variant="outline" className="text-xs mt-1">{addon.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAddonQuantity(addon.id) > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddonChange(addon, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                      {getAddonQuantity(addon.id) > 0 && (
                        <span className="w-6 text-center text-sm">{getAddonQuantity(addon.id)}</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddonChange(addon, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total and Add to Cart */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">₹{Math.round(calculateTotal())}</span>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-button shadow-button"
              disabled={!selectedSize}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};