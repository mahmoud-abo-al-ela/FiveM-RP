import { Button } from "@/components/ui/button";
import { Edit, Trash2, Crown, DollarSign, Car, Star, Package } from "lucide-react";

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

interface StoreItemCardProps {
  item: StoreItem;
  onEdit: (item: StoreItem) => void;
  onDelete: (item: StoreItem) => void;
  isPending?: boolean;
  isDeleting?: boolean;
}

export function StoreItemCard({ item, onEdit, onDelete, isPending, isDeleting }: StoreItemCardProps) {
  const metadata = item.metadata ? JSON.parse(item.metadata) : {};

  const getCategoryIcon = () => {
    switch (item.category) {
      case "vip":
        return <Crown className="h-4 w-4" />;
      case "money":
        return <DollarSign className="h-4 w-4" />;
      case "vehicle":
        return <Car className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 transition-opacity ${
        isPending || isDeleting ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex gap-4 flex-1">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
        ) : (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 h-fit">{getCategoryIcon()}</div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold text-lg">{item.name}</div>
            <div className="text-primary font-bold">{item.price}</div>
          </div>
          {item.description && <div className="text-sm text-muted-foreground mb-2">{item.description}</div>}

          {/* Category-specific metadata display */}
          {item.category === "vip" && metadata.features && (
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Features:</strong> {metadata.features.join(", ")}
            </div>
          )}
          {item.category === "money" && metadata.amount && (
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Amount:</strong> {metadata.amount}
              {metadata.bonus && <span className="text-green-500 ml-2">+{metadata.bonus}</span>}
            </div>
          )}
          {item.category === "vehicle" && metadata.type && (
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Type:</strong> {metadata.type}
            </div>
          )}

          <div className="flex gap-2 mt-2 flex-wrap">
            {item.available ? (
              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Available</span>
            ) : (
              <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Unavailable</span>
            )}
            {item.popular && (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
                <Star className="h-3 w-3" /> Popular
              </span>
            )}
            {item.featured && <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">Featured</span>}
            {item.stock !== -1 && (
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Stock: {item.stock}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(item)} disabled={isPending || isDeleting}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(item)} disabled={isPending || isDeleting}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
