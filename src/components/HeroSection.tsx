import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroCake from "@/assets/hero-cake.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Premium Handcrafted Cakes</span>
            </div>

            {/* Main heading */}
            <h1 className="hero-text">
              Sweet Moments
              <br />
              <span className="text-primary">Made Perfect</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Discover our collection of handcrafted cakes, made with love and the finest ingredients. 
              From birthdays to weddings, we make every celebration sweeter.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-button hover:scale-105 transition-bounce shadow-button text-lg px-8 py-6"
              >
                <Link to="/cakes" className="flex items-center space-x-2">
                  <span>Order Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 transition-smooth text-lg px-8 py-6"
              >
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Cake Varieties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24hr</div>
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card hover:shadow-button transition-smooth">
              <img 
                src={heroCake} 
                alt="Delicious birthday cake with colorful decorations" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-soft">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl">⭐</span>
                  <span className="font-bold text-foreground">4.9</span>
                  <span className="text-muted-foreground text-sm">(200+ reviews)</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-soft text-white">
                <div className="text-sm font-medium">Fresh Daily</div>
                <div className="text-xs opacity-90">Made with love ❤️</div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;