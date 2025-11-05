import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Calendar, TrendingUp, Package, Users, ShoppingCart } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a78bfa'];

const LineChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const maxSales = Math.max(...data.map(d => d.sales));
  const minSales = 0;
  const range = maxSales - minSales;
  const padding = 40;
  const chartWidth = 100 - (padding * 2) / (100);
  const width = 100;
  const height = 100;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.sales - minSales) / range || 0) * (height - padding * 2);
    return { x, y, sales: d.sales };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[300px]">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD} stroke="#3b82f6" strokeWidth="2" fill="none" />
      <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#lineGradient)" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#3b82f6" />
      ))}
    </svg>
  );
};

const PieChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    currentAngle = endAngle;

    return { pathData, color: COLORS[index % COLORS.length], percentage: ((item.value / total) * 100).toFixed(0), name: item.name };
  });

  return (
    <div className="flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-[200px] h-[200px]">
        {slices.map((slice, i) => (
          <path key={i} d={slice.pathData} fill={slice.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="ml-4 space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="text-sm flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span>{slice.name}: {slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const maxQuantity = Math.max(...data.map(d => d.quantity));
  const padding = 40;
  const width = 100;
  const height = 100;
  const barWidth = (width - padding * 2) / data.length * 0.8;
  const barGap = (width - padding * 2) / data.length * 0.2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[300px]">
      {data.map((item, i) => {
        const x = padding + i * (barWidth + barGap);
        const barHeight = (item.quantity / maxQuantity) * (height - padding * 2);
        const y = height - padding - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#10b981" rx="2" />
          </g>
        );
      })}
    </svg>
  );
};

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
            <LineChart data={stats?.salesTrendData || []} />
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={stats?.orderStatusData || []} />
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
          <BarChart data={topProducts || []} />
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
};
