import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Plus, Star, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CakeCardProps {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl: string;
  category?: string;
  isFeature?: boolean;
  rating?: number;
  reviewCount?: number;
}

const CakeCard = ({ 
  id, 
  name, 
  description, 
  basePrice, 
  imageUrl, 
  category,
  isFeature = false,
  rating = 4.8,
  reviewCount = 25 
}: CakeCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  // Mock addons data
  const mockAddons = [
    { id: '1', name: 'Extra Chocolate Chips', price: 50, type: 'topping' },
    { id: '2', name: 'Personalized Message', price: 100, type: 'message' },
    { id: '3', name: 'Gift Wrapping', price: 75, type: 'service' },
    { id: '4', name: 'Candles Set', price: 25, type: 'accessory' },
  ];

  const handleLike = async () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? `${name} removed from your favorites` : `${name} added to your favorites`,
    });
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Added to cart!",
        description: `${name} has been added to your cart`,
      });
    }, 500);
  };

  return (
    <div className="cake-card group cursor-pointer">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${name} cake`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
        />
        
        {/* Featured Badge */}
        {isFeature && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-soft">
            Featured
          </Badge>
        )}
        
        {/* Category Badge */}
        {category && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-white/90 text-foreground shadow-soft"
          >
            {category}
          </Badge>
        )}

        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:scale-110 transition-bounce ${
            isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
          }`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-soft">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-smooth">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">₹{basePrice}</span>
            <span className="text-sm text-muted-foreground ml-1">onwards</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="hover:scale-105 transition-bounce"
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            
            <Button 
              size="sm"
              disabled={isLoading}
              onClick={handleAddToCart}
              className="bg-gradient-button hover:scale-105 transition-bounce shadow-button"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">{name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-4">
              <img 
                src={imageUrl} 
                alt={`${name} cake`}
                className="w-full h-64 object-cover rounded-lg shadow-soft"
              />
              
              {/* Rating and Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating}</span>
                  <span className="text-muted-foreground">({reviewCount} reviews)</span>
                </div>
                {category && (
                  <Badge variant="secondary">{category}</Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">Description</h4>
                <p className="text-muted-foreground">
                  {description || "A delicious handcrafted cake made with the finest ingredients. Perfect for any celebration or special occasion."}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Base Price</h4>
                <div className="text-3xl font-bold text-primary">₹{basePrice}</div>
                <p className="text-sm text-muted-foreground">Starting price for 1 kg cake</p>
              </div>

              {/* Addons */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Available Add-ons</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockAddons.map((addon) => (
                    <div 
                      key={addon.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-smooth"
                    >
                      <div>
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{addon.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">₹{addon.price}</span>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button 
                  className="flex-1 bg-gradient-button shadow-button"
                  onClick={() => {
                    handleAddToCart();
                    setShowDetails(false);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CakeCard;