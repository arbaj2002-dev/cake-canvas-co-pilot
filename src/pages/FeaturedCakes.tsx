import { useState, useEffect } from "react";
import CakeCard from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import our generated images
import weddingCake from "@/assets/wedding-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";
import chocolateCake from "@/assets/chocolate-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  is_featured: boolean | null;
  categories?: {
    name: string;
  } | null;
}

const FeaturedCakes = () => {
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock featured cakes with our generated images
  const mockFeaturedCakes: Product[] = [
    {
      id: "1",
      name: "Chocolate Birthday Delight",
      description: "Rich chocolate cake perfect for birthday celebrations",
      base_price: 899,
      image_url: heroCake,
      is_featured: true,
      categories: { name: "Birthday" }
    },
    {
      id: "2", 
      name: "Elegant Wedding Cake",
      description: "Three-tier vanilla wedding cake with rose decorations",
      base_price: 2499,
      image_url: weddingCake,
      is_featured: true,
      categories: { name: "Wedding" }
    },
    {
      id: "3",
      name: "Rainbow Layer Cake",
      description: "Colorful rainbow layers that bring joy to any celebration",
      base_price: 1299,
      image_url: rainbowCake,
      is_featured: true,
      categories: { name: "Special" }
    }
  ];

  useEffect(() => {
    fetchFeaturedCakes();
  }, []);

  const fetchFeaturedCakes = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          is_featured,
          categories (
            name
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(3);

      if (error) {
        console.error('Error fetching featured cakes:', error);
        setFeaturedCakes(mockFeaturedCakes);
      } else if (data && data.length > 0) {
        setFeaturedCakes(data);
      } else {
        setFeaturedCakes(mockFeaturedCakes);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeaturedCakes(mockFeaturedCakes);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-card/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="hero-text text-3xl md:text-4xl mb-4">Featured Cakes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our most popular and delicious cakes, handpicked for their exceptional taste and beautiful presentation
          </p>
        </div>

        {/* Featured Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCakes.map((cake) => (
            <CakeCard
              key={cake.id}
              id={cake.id}
              name={cake.name}
              description={cake.description || undefined}
              basePrice={cake.base_price}
              imageUrl={cake.image_url || heroCake}
              category={cake.categories?.name}
              isFeature={true}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-button hover:scale-105 transition-bounce shadow-button"
          >
            <Link to="/cakes" className="flex items-center space-x-2">
              <span>View All Cakes</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCakes;