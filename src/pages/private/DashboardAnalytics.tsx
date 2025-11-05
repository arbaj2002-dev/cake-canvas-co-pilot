import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, TrendingUp, Package, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a78bfa'];

export const DashboardAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const dateFilter = days === 0 
        ? undefined 
        : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Total orders
      let ordersQuery = supabase
        .from("orders")
        .select("id, total_amount, status, created_at", { count: "exact" });
      
      if (dateFilter) {
        ordersQuery = ordersQuery.gte("created_at", dateFilter);
      }

      const { data: orders, count: ordersCount } = await ordersQuery;

      // Total sales
      const totalSales = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;

      // Active products
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      // Total customers
      const { count: customersCount } = await supabase
        .from("customers")
        .select("*", { count: "exact" });

      // Order status distribution
      const statusCounts = orders?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const orderStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count as number
      }));

      // Sales trend (daily)
      const salesByDay = orders?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseFloat(order.total_amount.toString());
        return acc;
      }, {}) || {};

      const salesTrendData = Object.entries(salesByDay)
        .map(([date, amount]) => ({
          date,
          sales: amount as number
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

      return {
        totalOrders: ordersCount || 0,
        totalSales,
        activeProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        orderStatusData,
        salesTrendData
      };
    },
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["top-products", timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const dateFilter = days === 0 
        ? undefined 
        : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      let ordersQuery = supabase
        .from("order_items")
        .select("quantity, product_id, products(name)");
      
      if (dateFilter) {
        ordersQuery = ordersQuery.gte("created_at", dateFilter);
      }

      const { data: orderItems } = await ordersQuery;

      const productCounts = orderItems?.reduce((acc: any, item) => {
        const productName = (item.products as any)?.name || "Unknown";
        if (!acc[productName]) {
          acc[productName] = 0;
        }
        acc[productName] += item.quantity;
        return acc;
      }, {}) || {};

      return Object.entries(productCounts)
        .map(([name, quantity]) => ({
          name,
          quantity: quantity as number
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
  });

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange} disabled={statsLoading || productsLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="0">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {statsLoading || productsLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
      <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ opacity: statsLoading ? 0.5 : 1, pointerEvents: statsLoading ? 'none' : 'auto' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Customer orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalSales.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue generated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Available cakes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ opacity: productsLoading ? 0.5 : 1, pointerEvents: productsLoading ? 'none' : 'auto' }}>
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily sales over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.salesTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.orderStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card style={{ opacity: productsLoading ? 0.5 : 1, pointerEvents: productsLoading ? 'none' : 'auto' }}>
        <CardHeader>
          <CardTitle>Top 5 Products</CardTitle>
          <CardDescription>Most ordered products in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
};
