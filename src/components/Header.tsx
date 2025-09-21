import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0); // Will be connected to cart state later
  const [isLoggedIn] = useState(false); // Will be connected to auth state later
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center shadow-button group-hover:scale-110 transition-bounce">
              <span className="text-white font-bold text-lg">🍰</span>
            </div>
            <span className="hero-text text-xl">CakeShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth font-medium">
              Home
            </Link>
            <Link to="/cakes" className="text-foreground hover:text-primary transition-smooth font-medium">
              Cakes
            </Link>
            <Link to="/gallery" className="text-foreground hover:text-primary transition-smooth font-medium">
              Gallery
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-smooth font-medium">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-smooth font-medium">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Favorites */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => toast({ title: "Coming soon!", description: "Favorites feature will be available soon." })}
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-muted-foreground hover:text-primary transition-smooth"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Profile/Login */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-smooth"
              onClick={handleProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className="block text-foreground hover:text-primary transition-smooth font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/cakes" 
              className="block text-foreground hover:text-primary transition-smooth font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cakes
            </Link>
            <Link 
              to="/gallery" 
              className="block text-foreground hover:text-primary transition-smooth font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              to="/about" 
              className="block text-foreground hover:text-primary transition-smooth font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block text-foreground hover:text-primary transition-smooth font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;