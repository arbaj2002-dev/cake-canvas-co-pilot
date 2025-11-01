import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const ITEMS_PER_PAGE = 10;

interface CakeFormData {
  name: string;
  description: string;
  base_price: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  image_file: File | null;
}

interface ProductSize {
  id?: string;
  size_name: string;
  weight: string;
  price: string;
  isNew?: boolean;
}

const ManageCakes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);

  const [formData, setFormData] = useState<CakeFormData>({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    is_active: true,
    is_featured: false,
    image_file: null,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-products", currentPage, searchQuery, categoryFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      if (statusFilter === "active") {
        query = query.eq("is_active", true);
      } else if (statusFilter === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    },
  });

  const totalPages = Math.ceil((data?.count || 0) / ITEMS_PER_PAGE);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cakes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('cakes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteOldImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      const urlParts = imageUrl.split('/cakes/');
      if (urlParts.length !== 2) return;
      
      const filePath = urlParts[1];
      await supabase.storage.from('cakes').remove([filePath]);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: CakeFormData) => {
      let imageUrl = editingCake?.image_url || "";

      if (data.image_file) {
        if (editingCake?.image_url) {
          await deleteOldImage(editingCake.image_url);
        }
        imageUrl = await uploadImage(data.image_file);
      }

      const productData = {
        name: data.name,
        description: data.description,
        base_price: parseFloat(data.base_price),
        category_id: data.category_id || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        image_url: imageUrl,
      };

      let productId = editingCake?.id;

      if (editingCake) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingCake.id);
        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData])
          .select();
        if (error) throw error;
        productId = newProduct[0].id;
      }

      if (productId && productSizes.length > 0) {
        const newSizes = productSizes.filter(s => s.isNew);
        if (newSizes.length > 0) {
          const sizesToInsert = newSizes.map(s => ({
            product_id: productId,
            size_name: s.size_name,
            weight: s.weight,
            price: parseFloat(s.price),
          }));

          const { error } = await supabase
            .from("product_sizes")
            .insert(sizesToInsert);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Cake ${editingCake ? "updated" : "created"} successfully`,
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingCake ? "update" : "create"} cake`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: any) => {
      // Delete image from storage
      if (product.image_url) {
        await deleteOldImage(product.image_url);
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cake deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cake",
        variant: "destructive",
      });
    },
  });

  const handleEdit = async (product: any) => {
    setEditingCake(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      base_price: product.base_price.toString(),
      category_id: product.category_id || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
      image_file: null,
    });
    setImagePreview(product.image_url || "");

    const { data: sizes } = await supabase
      .from("product_sizes")
      .select("*")
      .eq("product_id", product.id);

    setProductSizes(
      sizes?.map(s => ({
        id: s.id,
        size_name: s.size_name,
        weight: s.weight,
        price: s.price.toString(),
      })) || []
    );
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image_file: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      base_price: "",
      category_id: "",
      is_active: true,
      is_featured: false,
      image_file: null,
    });
    setImagePreview("");
    setEditingCake(null);
    setProductSizes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/private/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="hero-text text-3xl">Manage Cakes</h1>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cake
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        data?.products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs">
                                  No Image
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              {product.categories?.name || "Uncategorized"}
                            </TableCell>
                            <TableCell>₹{product.base_price}</TableCell>
                            <TableCell>
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.is_featured ? "default" : "outline"}>
                                {product.is_featured ? "Featured" : "Regular"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this cake?")) {
                                      deleteMutation.mutate(product);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(i + 1)}
                              isActive={currentPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCake ? "Edit Cake" : "Add New Cake"}</DialogTitle>
            <DialogDescription>
              {editingCake ? "Update cake information" : "Create a new cake product"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="base_price">Base Price (₹) *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>

              <div className="grid gap-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Product Sizes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProductSizes([
                        ...productSizes,
                        { size_name: "", weight: "", price: "", isNew: true }
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {productSizes.map((size, idx) => (
                    <div key={idx} className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <Label className="text-xs">Size Name</Label>
                        <Input
                          placeholder="e.g., Small (500g)"
                          value={size.size_name}
                          onChange={(e) => {
                            const updated = [...productSizes];
                            updated[idx].size_name = e.target.value;
                            setProductSizes(updated);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Weight</Label>
                        <Input
                          placeholder="e.g., 500g, 1kg"
                          value={size.weight}
                          onChange={(e) => {
                            const updated = [...productSizes];
                            updated[idx].weight = e.target.value;
                            setProductSizes(updated);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="899"
                          value={size.price}
                          onChange={(e) => {
                            const updated = [...productSizes];
                            updated[idx].price = e.target.value;
                            setProductSizes(updated);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProductSizes(productSizes.filter((_, i) => i !== idx));
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingCake ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCakes;
