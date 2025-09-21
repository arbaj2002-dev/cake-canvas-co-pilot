import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List, X } from "lucide-react";
import Header from "@/components/Header";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import our cake images
import weddingCake from "@/assets/wedding-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";
import chocolateCake from "@/assets/chocolate-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    { id: 1, url: heroCake, title: "Chocolate Birthday Delight", category: "Birthday", description: "Rich chocolate cake perfect for birthday celebrations" },
    { id: 2, url: weddingCake, title: "Elegant Wedding Cake", category: "Wedding", description: "Three-tier vanilla wedding cake with rose decorations" },
    { id: 3, url: rainbowCake, title: "Rainbow Layer Cake", category: "Special", description: "Colorful rainbow layers that bring joy to any celebration" },
    { id: 4, url: chocolateCake, title: "Decadent Chocolate Fudge", category: "Chocolate", description: "Rich chocolate fudge cake with ganache and berries" },
    { id: 5, url: heroCake, title: "Classic Vanilla Dream", category: "Birthday", description: "Fluffy vanilla sponge with buttercream frosting" },
    { id: 6, url: weddingCake, title: "Rose Garden Wedding", category: "Wedding", description: "Elegant white cake with fresh roses" },
    { id: 7, url: rainbowCake, title: "Unicorn Fantasy", category: "Special", description: "Magical unicorn-themed cake with edible glitter" },
    { id: 8, url: chocolateCake, title: "Dark Chocolate Truffle", category: "Chocolate", description: "Intense dark chocolate with truffle filling" },
  ];

  const filteredImages = galleryImages
    .filter(image => 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(image => 
      selectedCategory === "all" || 
      image.category.toLowerCase() === selectedCategory.toLowerCase()
    );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="hero-text text-4xl mb-4">Cake Gallery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our collection of beautiful handcrafted cakes
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
                  placeholder="Search gallery..."
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
                </SelectContent>
              </Select>
            </div>

            <div></div>

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
              {filteredImages.length} images found
            </Badge>
            {selectedCategory !== "all" && (
              <Badge variant="outline">
                Category: {selectedCategory}
              </Badge>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid gap-4 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
            : "grid-cols-1 md:grid-cols-2"
        }`}>
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => setSelectedImage(image.url)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                  {image.category}
                </Badge>
              </div>
              
              {viewMode === "list" && (
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-foreground mb-2">{image.title}</h3>
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No images found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or browse all our gallery
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Image Preview Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Gallery preview"
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;