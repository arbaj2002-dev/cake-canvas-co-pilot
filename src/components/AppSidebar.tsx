import { NavLink, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Cake,
  Package,
  Users,
  MessageSquare,
  Tag,
  Image,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/private/dashboard", icon: LayoutDashboard },
  { title: "Manage Orders", url: "/private/orders", icon: ShoppingBag },
  { title: "Manage Cakes", url: "/private/cakes", icon: Cake },
  { title: "Manage Add-ons", url: "/private/addons", icon: Package },
  { title: "Manage Customers", url: "/private/customers", icon: Users },
  { title: "Customer Queries", url: "/private/queries", icon: MessageSquare },
  { title: "Manage Coupons", url: "/private/coupons", icon: Tag },
  { title: "Gallery Management", url: "/private/gallery", icon: Image },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
