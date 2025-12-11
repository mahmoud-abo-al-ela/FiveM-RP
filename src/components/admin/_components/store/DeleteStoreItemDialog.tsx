import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

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

interface DeleteStoreItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StoreItem | null;
  onConfirm: (item: StoreItem) => void;
  isDeleting: boolean;
}

export function DeleteStoreItemDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isDeleting,
}: DeleteStoreItemDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Store Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be undone and the item will be permanently removed from the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (item) onConfirm(item);
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
