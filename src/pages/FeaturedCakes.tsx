import { useState, useEffect } from "react";
import CakeCard from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppSelector } from "@/store/hooks";
import { resolveImageUrl } from "@/utils/imageMapper";

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
        setFeaturedCakes([]);
      } else {
        setFeaturedCakes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeaturedCakes([]);
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

  if (featuredCakes.length === 0) {
    return (
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="hero-text text-3xl md:text-4xl mb-4">Featured Cakes</h2>
            <p className="text-lg text-muted-foreground">
              No featured cakes available at the moment. Check back soon!
            </p>
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
          {featuredCakes.map((cake, index) => (
            <CakeCard
              key={cake.id}
              id={cake.id}
              name={cake.name}
              description={cake.description || undefined}
              basePrice={cake.base_price}
              imageUrl={resolveImageUrl(cake.image_url, index)}
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
