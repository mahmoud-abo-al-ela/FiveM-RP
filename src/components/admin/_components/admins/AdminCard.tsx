import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  created_at: string;
  last_login: string | null;
  active: boolean;
}

interface AdminCardProps {
  admin: AdminUser;
  onChangePassword: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
}

export function AdminCard({ admin, onChangePassword, onDelete }: AdminCardProps) {
  const isProtected = admin.username === "admin";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold flex items-center gap-2">
            {admin.username}
            {isProtected && <Badge variant="default">Protected</Badge>}
          </div>
          {admin.email && (
            <div className="text-sm text-muted-foreground">{admin.email}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Created: {new Date(admin.created_at).toLocaleDateString()}
            {admin.last_login && (
              <> • Last login: {new Date(admin.last_login).toLocaleString()}</>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChangePassword(admin)}
          title="Change password"
        >
          <Key className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (confirm(`Are you sure you want to delete admin "${admin.username}"?`)) {
              onDelete(admin);
            }
          }}
          disabled={isProtected}
          title={isProtected ? "Cannot delete the admin account" : ""}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
