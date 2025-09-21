import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Star } from "lucide-react";
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
  const { toast } = useToast();

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

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">₹{basePrice}</span>
            <span className="text-sm text-muted-foreground ml-1">onwards</span>
          </div>
          
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
  );
};

export default CakeCard;