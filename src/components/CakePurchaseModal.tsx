import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, CartAddon } from "@/store/slices/cartSlice";
import { useToast } from "@/hooks/use-toast";

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

const mockAddons = [
  { id: "1", name: "Birthday Candles Set", price: 25 },
  { id: "2", name: "Chocolate Chips", price: 50 },
  { id: "3", name: "Fresh Berries", price: 75 },
  { id: "4", name: "Custom Message Card", price: 30 },
  { id: "5", name: "Gift Wrapping", price: 40 },
  { id: "6", name: "Party Balloons", price: 35 },
];

export const CakePurchaseModal = ({ isOpen, onClose, cake }: CakePurchaseModalProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);
  const [size, setSize] = useState("1 kg");

  const handleAddonChange = (addon: { id: string; name: string; price: number }, change: number) => {
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
        return [...current, { ...addon, quantity: 1 }];
      }
      return current;
    });
  };

  const getAddonQuantity = (addonId: string) => {
    return selectedAddons.find(item => item.id === addonId)?.quantity || 0;
  };

  const calculateTotal = () => {
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    return cake.basePrice + addonsTotal;
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: `${cake.id}-${Date.now()}`,
      name: cake.name,
      basePrice: cake.basePrice,
      imageUrl: cake.imageUrl,
      size,
      addons: selectedAddons,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    toast({
      title: "Added to Cart!",
      description: `${cake.name} has been added to your cart.`
    });
    onClose();
  };

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
              <div>
                <label className="text-sm font-medium">Size</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="0.5 kg">0.5 kg</option>
                  <option value="1 kg">1 kg</option>
                  <option value="1.5 kg">1.5 kg</option>
                  <option value="2 kg">2 kg</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Add-ons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockAddons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{addon.name}</p>
                    <p className="text-sm text-muted-foreground">₹{addon.price}</p>
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

          {/* Total and Add to Cart */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">₹{calculateTotal()}</span>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-button shadow-button"
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