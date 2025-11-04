import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ShoppingCart, Package } from "lucide-react";
import { CakePurchaseModal } from "./CakePurchaseModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToFavorites, removeFromFavorites } from "@/store/slices/favoritesSlice";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface CakeCardProps {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl: string;
  category?: string;
  isFeature?: boolean;
}

interface ProductSize {
  id: string;
  size_name: string;
  weight: string | null;
  price_multiplier: number;
}

const CakeCard = ({ id, name, description, basePrice, imageUrl, category, isFeature }: CakeCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  
  const favorites = useAppSelector(state => state.favorites.items);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const isFavorited = favorites.some(fav => fav.id === id);

  useEffect(() => {
    fetchSizes();
  }, [id]);

  const fetchSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('id, size_name, weight, price_multiplier')
        .eq('product_id', id)
        .order('price_multiplier');

      if (!error && data) {
        setSizes(data);
        if (data.length > 0) {
          setMinPrice(data[0].price_multiplier);
        }
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      toast({
        title: "Login Required",
        description: "Please login to add favorites.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorited) {
        // Remove from database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('product_id', id);

        if (error) throw error;

        dispatch(removeFromFavorites(id));
        toast({
          title: "Removed from favorites",
          description: `${name} has been removed from your favorites.`
        });
      } else {
        // Add to database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('favorites')
          .insert({ 
            user_id: user.id,
            product_id: id 
          });

        if (error) throw error;

        dispatch(addToFavorites({ id, name, basePrice, imageUrl, category }));
        toast({
          title: "Added to favorites",
          description: `${name} has been added to your favorites.`
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const cakeData = {
    id,
    name,
    imageUrl,
    description,
    category
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isFeature && (
              <Badge className="absolute top-2 left-2 bg-gradient-button">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 h-8 w-8 rounded-full ${
                isFavorited ? "text-red-500" : "text-white hover:text-red-500"
              }`}
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">{name}</h3>
              {category && <Badge variant="secondary">{category}</Badge>}
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {description || "Delicious handcrafted cake made with premium ingredients"}
            </p>
            <div className="flex items-center justify-between mb-3">
              <div>
                {minPrice > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <p className="text-2xl font-bold text-primary">₹{minPrice}</p>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">Select size</p>
                )}
              </div>
              {sizes.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>{sizes.length} size{sizes.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => setIsPurchaseModalOpen(true)}
            className="w-full bg-gradient-button shadow-button"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase
          </Button>
        </CardFooter>
      </Card>

      <CakePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        cake={cakeData}
      />
    </>
  );
};

export default CakeCard;