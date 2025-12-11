"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Crown, DollarSign, Car } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { StoreEmptyState } from "./empty-states";
import { StoreItemDialog, DeleteStoreItemDialog, useStoreMutations } from "./_components/store";
import { StoreTabContent, StoreItem } from "./_components/store-tabs";

const ITEMS_PER_PAGE = 10;

export function StoreManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StoreItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("vip");
  const [vipFeatures, setVipFeatures] = useState<string[]>([""]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [allPage, setAllPage] = useState(1);
  const [vipPage, setVipPage] = useState(1);
  const [moneyPage, setMoneyPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-store-items"],
    queryFn: async () => {
      const res = await fetch("/api/admin/store");
      if (!res.ok) throw new Error("Failed to fetch store items");
      return res.json();
    },
  });

  const vipItems = items.filter((item: StoreItem) => item.category === "vip");
  const moneyItems = items.filter((item: StoreItem) => item.category === "money");
  const vehicleItems = items.filter((item: StoreItem) => item.category === "vehicle");

  // Pagination calculations
  const allTotalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const vipTotalPages = Math.ceil(vipItems.length / ITEMS_PER_PAGE);
  const moneyTotalPages = Math.ceil(moneyItems.length / ITEMS_PER_PAGE);
  const vehicleTotalPages = Math.ceil(vehicleItems.length / ITEMS_PER_PAGE);

  const handleDeleteItem = (item: StoreItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const { createMutation, updateMutation, deleteMutation } = useStoreMutations();

  // Clear updatingItemId when update completes
  useEffect(() => {
    if (!updateMutation.isPending) {
      setUpdatingItemId(null);
    }
  }, [updateMutation.isPending]);

  // Clear deletingItemId when delete completes
  useEffect(() => {
    if (!deleteMutation.isPending) {
      setDeletingItemId(null);
    }
  }, [deleteMutation.isPending]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category") as string;
    
    let metadata: any = {};
    
    // Build metadata based on category
    if (category === "vip") {
      const features = vipFeatures.filter(f => f.trim() !== "");
      metadata = {
        features,
        period: formData.get("period") as string,
      };
    } else if (category === "money") {
      metadata = {
        amount: formData.get("amount") as string,
        bonus: formData.get("bonus") as string,
      };
    } else if (category === "vehicle") {
      metadata = {
        type: formData.get("type") as string,
      };
    }

    const item = {
      id: editingItem?.id,
      category,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      metadata: JSON.stringify(metadata),
      image_url: uploadedImage || null,
      available: formData.get("available") === "on",
      popular: formData.get("popular") === "on",
      featured: formData.get("featured") === "on",
      stock: parseInt(formData.get("stock") as string) || -1,
    };

    setIsDialogOpen(false);
    setEditingItem(null);

    if (editingItem) {
      setUpdatingItemId(editingItem.id);
      updateMutation.mutate(item as StoreItem);
    } else {
      createMutation.mutate(item);
    }
  };

  const handleDeleteConfirm = (item: StoreItem) => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setDeletingItemId(item.id);
    deleteMutation.mutate(item.id);
  };

  const handleEditItem = (item: StoreItem) => {
    setEditingItem(item);
    setSelectedCategory(item.category);
    setUploadedImage(item.image_url);
    
    // Parse metadata for editing
    if (item.metadata) {
      try {
        const meta = JSON.parse(item.metadata);
        if (item.category === "vip" && meta.features) {
          setVipFeatures(meta.features.length > 0 ? meta.features : [""]);
        } else {
          setVipFeatures([""]);
        }
      } catch (e) {
        console.error("Failed to parse metadata", e);
        setVipFeatures([""]);
      }
    } else {
      setVipFeatures([""]);
    }
    
    setIsDialogOpen(true);
  };

  const handleAddFeature = () => {
    setVipFeatures([...vipFeatures, ""]);
  };

  const handleRemoveFeature = (index: number) => {
    setVipFeatures(vipFeatures.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...vipFeatures];
    newFeatures[index] = value;
    setVipFeatures(newFeatures);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Store Management</CardTitle>
            <CardDescription>Manage VIP packages, in-game money, and vehicles</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingItem(null);
              setVipFeatures([""]);
              setSelectedCategory("vip");
              setUploadedImage(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <StoreEmptyState onCreateClick={() => {
            setEditingItem(null);
            setVipFeatures([""]);
            setSelectedCategory("vip");
            setUploadedImage(null);
            setIsDialogOpen(true);
          }} />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="vip">
                <Crown className="h-4 w-4 mr-2" />
                VIP ({vipItems.length})
              </TabsTrigger>
              <TabsTrigger value="money">
                <DollarSign className="h-4 w-4 mr-2" />
                Money ({moneyItems.length})
              </TabsTrigger>
              <TabsTrigger value="vehicles">
                <Car className="h-4 w-4 mr-2" />
                Vehicles ({vehicleItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <StoreTabContent
                items={items}
                currentPage={allPage}
                totalPages={allTotalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setAllPage}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                updatingItemId={updatingItemId}
                deletingItemId={deletingItemId}
                emptyMessage="No items yet"
              />
            </TabsContent>

            <TabsContent value="vip">
              <StoreTabContent
                items={vipItems}
                currentPage={vipPage}
                totalPages={vipTotalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setVipPage}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                updatingItemId={updatingItemId}
                deletingItemId={deletingItemId}
                emptyMessage="No VIP items yet"
              />
            </TabsContent>

            <TabsContent value="money">
              <StoreTabContent
                items={moneyItems}
                currentPage={moneyPage}
                totalPages={moneyTotalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setMoneyPage}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                updatingItemId={updatingItemId}
                deletingItemId={deletingItemId}
                emptyMessage="No money packages yet"
              />
            </TabsContent>

            <TabsContent value="vehicles">
              <StoreTabContent
                items={vehicleItems}
                currentPage={vehiclePage}
                totalPages={vehicleTotalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setVehiclePage}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                updatingItemId={updatingItemId}
                deletingItemId={deletingItemId}
                emptyMessage="No vehicles yet"
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <StoreItemDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setVipFeatures([""]);
            setSelectedCategory("vip");
            setUploadedImage(null);
          }
        }}
        editingItem={editingItem}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        vipFeatures={vipFeatures}
        onAddFeature={handleAddFeature}
        onRemoveFeature={handleRemoveFeature}
        onFeatureChange={handleFeatureChange}
        uploadedImage={uploadedImage}
        isUploading={isUploading}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteStoreItemDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setItemToDelete(null);
        }}
        item={itemToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </Card>
  );
}
