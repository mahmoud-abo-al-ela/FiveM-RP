import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, Lock } from "lucide-react";

export interface AdminUser {
  id: string;
  display_name: string;
  in_game_name: string;
  role: string;
  activated: boolean;
  level: number;
  discord_avatar: string | null;
  created_at: string;
  is_protected?: boolean;
}

interface AdminRowProps {
  admin: AdminUser;
  currentUserId: string | null;
  onRevoke: (admin: AdminUser) => void;
  isRevoking: boolean;
}

export function AdminRow({ admin, currentUserId, onRevoke, isRevoking }: AdminRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-4">
        <Avatar>
            <AvatarImage src={admin.discord_avatar || undefined} />
            <AvatarFallback>
            {admin.display_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div>
            <div className="font-semibold flex items-center gap-2">
            {admin.display_name}
            <Badge variant="default" className="bg-primary">
                <Shield className="h-3 w-3 mr-1" />
                Admin
            </Badge>
            {admin.is_protected && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/50">
                <Lock className="h-3 w-3 mr-1" />
                Protected
                </Badge>
            )}
            </div>
        </div>
        </div>
        <Button
        variant="destructive"
        size="sm"
        onClick={() => onRevoke(admin)}
        disabled={isRevoking || admin.id === currentUserId || admin.is_protected}
        title={admin.is_protected ? "Protected admins cannot be modified" : admin.id === currentUserId ? "You cannot revoke your own admin access" : "Revoke admin access"}
        >
        <UserX className="h-4 w-4 mr-2" />
        {admin.id === currentUserId ? "You" : admin.is_protected ? "Protected" : "Revoke Admin"}
        </Button>
    </div>
  );
}
