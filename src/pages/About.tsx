import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Users, Award, Clock, Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Head Baker & Founder",
      experience: "15+ years",
      specialty: "Wedding Cakes",
      image: "👩‍🍳"
    },
    {
      name: "Michael Chen",
      role: "Pastry Chef",
      experience: "12+ years",
      specialty: "Chocolate Creations",
      image: "👨‍🍳"
    },
    {
      name: "Emily Davis",
      role: "Cake Designer",
      experience: "8+ years",
      specialty: "Custom Decorations",
      image: "🎨"
    },
    {
      name: "David Wilson",
      role: "Quality Manager",
      experience: "10+ years",
      specialty: "Ingredient Sourcing",
      image: "👨‍💼"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Made with Love",
      description: "Every cake is crafted with passion and attention to detail, ensuring each bite is memorable."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Premium Quality",
      description: "We use only the finest ingredients sourced from trusted suppliers to deliver exceptional taste."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Customer First",
      description: "Your satisfaction is our priority. We go above and beyond to make your celebrations special."
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Fresh & Natural",
      description: "All our cakes are made fresh daily with natural ingredients and no artificial preservatives."
    }
  ];

  const achievements = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "15+", label: "Years of Excellence" },
    { number: "500+", label: "Custom Designs" },
    { number: "4.9", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="hero-text text-5xl mb-6">About Sweet Cakes</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              For over 15 years, we've been creating moments of joy through our handcrafted cakes. 
              Every celebration deserves something special, and we're here to make it happen.
            </p>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Sweet Cakes began in 2009 as a small family bakery with a simple dream: to bring joy 
                  to every celebration through exceptional cakes. What started in a modest kitchen has 
                  grown into one of the city's most trusted bakeries.
                </p>
                <p>
                  Our founder, Sarah Johnson, started baking as a hobby, creating cakes for friends and 
                  family. The overwhelming positive response and word-of-mouth recommendations encouraged 
                  her to turn her passion into a business.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers, creating everything from intimate 
                  birthday cakes to grand wedding masterpieces. Our commitment to quality and customer 
                  satisfaction remains unchanged.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/contact')} 
                className="bg-gradient-button shadow-button"
              >
                Get in Touch
              </Button>
            </div>
            
            {/* Achievement Stats */}
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">{achievement.number}</div>
                    <div className="text-sm text-muted-foreground">{achievement.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-primary mx-auto flex justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="text-6xl mb-4">{member.image}</div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    <p className="text-sm text-muted-foreground">{member.experience}</p>
                    <p className="text-sm font-medium text-primary">{member.specialty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                "To create exceptional cakes that bring people together and make every celebration 
                memorable. We believe that great cakes are not just about taste, but about the 
                emotions and memories they create."
              </p>
              <div className="flex items-center justify-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Committed to Excellence Since 2009</span>
              </div>
            </CardContent>
          </Card>

          {/* Quality Promise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Our Quality Promise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <Clock className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Fresh Daily</h3>
                  <p className="text-sm text-muted-foreground">
                    All cakes are baked fresh daily using traditional methods and recipes.
                  </p>
                </div>
                <div className="space-y-3">
                  <Leaf className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Natural Ingredients</h3>
                  <p className="text-sm text-muted-foreground">
                    We use only natural, high-quality ingredients with no artificial additives.
                  </p>
                </div>
                <div className="space-y-3">
                  <Heart className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Made with Care</h3>
                  <p className="text-sm text-muted-foreground">
                    Every cake is handcrafted with attention to detail and love.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-16 p-8 bg-card/50 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Order?</h2>
            <p className="text-muted-foreground mb-6">
              Let us make your next celebration extra special with our delicious cakes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/cakes')} className="bg-gradient-button shadow-button">
                Browse Cakes
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Custom Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;