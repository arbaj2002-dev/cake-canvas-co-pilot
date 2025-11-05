import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { DashboardKPIs } from "./DashboardKPIs";

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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="h-16 border-b bg-card flex items-center justify-between px-6">
        <div>
          <h1 className="hero-text text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your cake shop
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
      </header>

      <main className="p-6">
        <DashboardKPIs />
      </main>
    </div>
  );
};

export default Dashboard;
