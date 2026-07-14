import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CakeCard from "@/components/CakeCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
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

const BestsellersSection = () => {
  const [cakes, setCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
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
          .eq("is_featured", true)
          .eq("is_active", true)
          .limit(8);

        if (error) {
          console.error("Error fetching bestsellers:", error);
        } else {
          setCakes(data || []);
        }
      } catch (err) {
        console.error("Error fetching bestsellers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  if (!loading && cakes.length === 0) return null;

  return (
    <section className="relative py-14 sm:py-20 bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Bestsellers"
          title="Order in"
          accent="two taps."
          description="Our most-loved cakes, ready to order. Pick a size, add to cart, done."
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <Skeleton className="h-48 w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cakes.map((cake, index) => (
              <Reveal key={cake.id} delay={(index % 4) * 100}>
                <CakeCard
                  id={cake.id}
                  name={cake.name}
                  description={cake.description || undefined}
                  basePrice={cake.base_price}
                  imageUrl={resolveImageUrl(cake.image_url, index)}
                  category={cake.categories?.name}
                  isFeature={true}
                />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-gradient-button px-8 shadow-button transition-bounce hover:scale-105"
          >
            <Link to="/cakes" className="flex items-center gap-2">
              <span>View All Cakes</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BestsellersSection;
