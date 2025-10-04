import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid2x2 as Grid, List } from "lucide-react";
import CakeCard from "@/components/CakeCard";
import Header from "@/components/Header";
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

interface Category {
  id: string;
  name: string;
}

const Cakes = () => {
  const [cakes, setCakes] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get auth state to trigger refetch when user logs in
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    fetchCakes();
    fetchCategories();
  }, [isAuthenticated]); // Refetch when authentication state changes

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCakes = async () => {
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
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching cakes:', error);
      } else {
        setCakes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCakes = cakes.filter(cake => {
    const matchesSearch = cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cake.description && cake.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           cake.categories?.name.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesPrice = priceRange === "all" || 
                        (priceRange === "under-1000" && cake.base_price < 1000) ||
                        (priceRange === "1000-2000" && cake.base_price >= 1000 && cake.base_price <= 2000) ||
                        (priceRange === "above-2000" && cake.base_price > 2000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedCakes = [...filteredCakes].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.base_price - b.base_price;
      case "price-high":
        return b.base_price - a.base_price;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="hero-text text-4xl mb-4">Our Delicious Cakes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our wide collection of handcrafted cakes, perfect for every celebration
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cakes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                <SelectItem value="above-2000">Above ₹2,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Results Count */}
            <p className="text-muted-foreground text-sm">
              Showing {sortedCakes.length} of {cakes.length} cakes
            </p>
          </div>
        </div>

        {/* Cakes Display */}
        {sortedCakes.length > 0 ? (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            {sortedCakes.map((cake, index) => (
              <div key={cake.id} className={viewMode === "list" ? "w-full" : ""}>
                <CakeCard
                  id={cake.id}
                  name={cake.name}
                  description={cake.description || undefined}
                  basePrice={cake.base_price}
                  imageUrl={resolveImageUrl(cake.image_url, index)}
                  category={cake.categories?.name}
                  isFeature={cake.is_featured || false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No cakes found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cakes;