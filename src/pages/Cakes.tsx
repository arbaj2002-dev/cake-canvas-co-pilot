import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import CakeCard from "@/components/CakeCard";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  category_id: string | null;
  categories?: {
    name: string;
  } | null;
}

const Cakes = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  // Mock data fallback with our generated images
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Chocolate Birthday Delight",
      description: "Rich chocolate cake perfect for birthday celebrations",
      base_price: 899,
      image_url: heroCake,
      is_featured: true,
      category_id: "birthday",
      categories: { name: "Birthday" }
    },
    {
      id: "2", 
      name: "Elegant Wedding Cake",
      description: "Three-tier vanilla wedding cake with rose decorations",
      base_price: 2499,
      image_url: weddingCake,
      is_featured: true,
      category_id: "wedding",
      categories: { name: "Wedding" }
    },
    {
      id: "3",
      name: "Rainbow Layer Cake",
      description: "Colorful rainbow layers that bring joy to any celebration",
      base_price: 1299,
      image_url: rainbowCake,
      is_featured: false,
      category_id: "special",
      categories: { name: "Special" }
    },
    {
      id: "4",
      name: "Decadent Chocolate Fudge",
      description: "Rich chocolate fudge cake with ganache and berries",
      base_price: 1099,
      image_url: chocolateCake,
      is_featured: false,
      category_id: "chocolate",
      categories: { name: "Chocolate" }
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
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
          category_id,
          categories (
            name
          )
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching products:', error);
        // Use mock data on error
        setProducts(mockProducts);
      } else if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Use mock data if no products found
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(product => 
      selectedCategory === "all" || 
      product.category_id === selectedCategory ||
      product.categories?.name.toLowerCase() === selectedCategory.toLowerCase()
    )
    .sort((a, b) => {
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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="hero-text text-4xl mb-4">Our Delicious Cakes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide variety of handcrafted cakes, perfect for every occasion
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search cakes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                  <SelectItem value="chocolate">Chocolate</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-foreground">
              {filteredProducts.length} cakes found
            </Badge>
            {selectedCategory !== "all" && (
              <Badge variant="outline">
                Category: {selectedCategory}
              </Badge>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {filteredProducts.map((product) => (
            <CakeCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description || undefined}
              basePrice={product.base_price}
              imageUrl={product.image_url || heroCake}
              category={product.categories?.name}
              isFeature={product.is_featured || false}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍰</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No cakes found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or browse all our delicious cakes
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cakes;