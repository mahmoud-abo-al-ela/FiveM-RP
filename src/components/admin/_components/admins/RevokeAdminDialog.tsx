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
import { AdminUser } from "./AdminRow";

interface RevokeAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin: AdminUser | null;
    onConfirm: () => void;
}

export function RevokeAdminDialog({ open, onOpenChange, admin, onConfirm }: RevokeAdminDialogProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke admin access for{" "}
              <span className="font-semibold">{admin?.display_name}</span>? 
              They will be demoted to a regular user and lose all admin privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revoke Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
}
