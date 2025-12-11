import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  created_at: string;
  last_login: string | null;
  active: boolean;
}

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isUpdating: boolean;
}

export function PasswordDialog({ open, onOpenChange, admin, onSubmit, isUpdating }: PasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>Change password for {admin?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
