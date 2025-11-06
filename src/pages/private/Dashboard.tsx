import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Cake, 
  Users, 
  MessageSquare, 
  Image, 
  Tag, 
  Package,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      navigate('/admin-login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: "Manage Orders",
      description: "View and manage all customer orders",
      icon: ShoppingBag,
      path: "/private/orders",
      color: "text-blue-500"
    },
    {
      title: "Manage Cakes",
      description: "Add, edit, and manage cake products",
      icon: Cake,
      path: "/private/cakes",
      color: "text-pink-500"
    },
    {
      title: "Manage Add-ons",
      description: "Create and manage product add-ons",
      icon: Package,
      path: "/private/addons",
      color: "text-purple-500"
    },
    {
      title: "Manage Customers",
      description: "View and manage customer information",
      icon: Users,
      path: "/private/customers",
      color: "text-green-500"
    },
    {
      title: "Customer Queries",
      description: "Handle customer questions and feedback",
      icon: MessageSquare,
      path: "/private/queries",
      color: "text-yellow-500"
    },
    {
      title: "Manage Coupons",
      description: "Create and manage discount coupons",
      icon: Tag,
      path: "/private/coupons",
      color: "text-red-500"
    },
    {
      title: "Gallery Management",
      description: "Upload and manage gallery images",
      icon: Image,
      path: "/private/gallery",
      color: "text-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="hero-text text-4xl mb-2">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Manage your cake shop from here
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Card 
              key={module.path}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-button flex items-center justify-center ${module.color}`}>
                    <module.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{module.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
