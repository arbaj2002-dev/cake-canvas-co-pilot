import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Mail, Phone, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageCustomerQueries() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: queries, isLoading } = useQuery({
    queryKey: ["customer-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_queries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("customer_queries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-queries"] });
      toast.success("Query status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update query status");
      console.error(error);
    },
  });

  const filteredQueries = queries?.filter((query) =>
    query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "RESOLVED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Queries</h1>
          <p className="text-muted-foreground">View and manage customer inquiries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queries</CardTitle>
          <CardDescription>A list of all customer queries and contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredQueries && filteredQueries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">{query.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {query.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {query.email}
                            </div>
                          )}
                          {query.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {query.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">{query.message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(query.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(query.status)}
                            {query.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(query.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={query.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: query.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No queries found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Customer queries will appear here when submitted"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
