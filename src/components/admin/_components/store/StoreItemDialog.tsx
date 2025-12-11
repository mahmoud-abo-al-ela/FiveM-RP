import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, DollarSign, Car, Loader2, Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface StoreItem {
  id: number;
  category: string;
  name: string;
  description: string | null;
  price: string;
  metadata: string | null;
  image_url: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  stock: number;
}

interface StoreItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: StoreItem | null;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  vipFeatures: string[];
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onFeatureChange: (index: number, value: string) => void;
  uploadedImage: string | null;
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function StoreItemDialog({
  open,
  onOpenChange,
  editingItem,
  selectedCategory,
  onCategoryChange,
  vipFeatures,
  onAddFeature,
  onRemoveFeature,
  onFeatureChange,
  uploadedImage,
  isUploading,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  isSubmitting,
}: StoreItemDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to safely parse metadata
  const getMetadata = () => {
    if (!editingItem?.metadata) return {};
    try {
      return JSON.parse(editingItem.metadata);
    } catch {
      return {};
    }
  };

  const metadata = getMetadata();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>{editingItem ? "Update store item details" : "Create a new store item"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Selection */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" /> VIP Status
                    </div>
                  </SelectItem>
                  <SelectItem value="money">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> In-Game Money
                    </div>
                  </SelectItem>
                  <SelectItem value="vehicle">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" /> Vehicle
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Fields */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editingItem?.name} required placeholder="e.g., Gold VIP, $1,000,000, Turbo Racer" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={editingItem?.description || ""} placeholder="Brief description of the item" />
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" defaultValue={editingItem?.price} required placeholder="e.g., $9.99, $19.99" />
            </div>

            {/* VIP Category Fields */}
            {selectedCategory === "vip" && (
              <>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input id="period" name="period" defaultValue={metadata.period || ""} placeholder="e.g., /month, /lifetime" />
                </div>
                <div>
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {vipFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={feature} onChange={(e) => onFeatureChange(index, e.target.value)} placeholder="Enter feature" />
                        {vipFeatures.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => onRemoveFeature(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={onAddFeature}>
                      <Plus className="h-4 w-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Money Category Fields */}
            {selectedCategory === "money" && (
              <>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" defaultValue={metadata.amount || ""} placeholder="e.g., $1,000,000" required />
                </div>
                <div>
                  <Label htmlFor="bonus">Bonus (optional)</Label>
                  <Input id="bonus" name="bonus" defaultValue={metadata.bonus || ""} placeholder="e.g., +10% Bonus" />
                </div>
              </>
            )}

            {/* Vehicle Category Fields */}
            {selectedCategory === "vehicle" && (
              <>
                <div>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Input id="type" name="type" defaultValue={metadata.type || ""} placeholder="e.g., Sports Car, SUV, Motorcycle" />
                </div>

                {/* Image Upload for Vehicle */}
                <div>
                  <Label>Vehicle Image</Label>
                  <div className="space-y-2">
                    {uploadedImage ? (
                      <div className="relative border rounded-lg p-4 bg-muted/30">
                        <img src={uploadedImage} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                        <Button type="button" variant="destructive" size="sm" onClick={onRemoveImage} className="w-full">
                          <X className="h-4 w-4 mr-2" /> Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" id="vehicle-image-upload" />
                        <label htmlFor="vehicle-image-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                            <div className="text-sm text-muted-foreground">{isUploading ? "Uploading..." : "Click to upload vehicle image"}</div>
                            <div className="text-xs text-muted-foreground">PNG, JPG up to 5MB</div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="stock">Stock (-1 for unlimited)</Label>
              <Input id="stock" name="stock" type="number" defaultValue={editingItem?.stock ?? -1} />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available for Purchase</Label>
                <Switch id="available" name="available" defaultChecked={editingItem?.available ?? true} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Mark as Popular</Label>
                <Switch id="popular" name="popular" defaultChecked={editingItem?.popular ?? false} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Mark as Featured</Label>
                <Switch id="featured" name="featured" defaultChecked={editingItem?.featured ?? false} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
