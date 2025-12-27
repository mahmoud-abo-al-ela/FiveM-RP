import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface User {
  id: string;
  display_name: string;
  in_game_name: string;
  role: string;
  activated: boolean;
  level: number;
  discord_avatar: string | null;
  is_protected?: boolean;
}

interface UserRowProps {
  user: User;
  currentUserId: string | null;
  onRoleChange: (userId: string, role: string) => void;
  isPending: boolean;
}

export function UserRow({ user, currentUserId, onRoleChange, isPending }: UserRowProps) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={user.discord_avatar || undefined} />
                    <AvatarFallback>
                        {user.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex gap-2">
                        <div className="font-semibold">{user.display_name}</div>
                        <Badge 
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={user.role === "admin" ? "bg-primary" : ""}
                        >
                            {user.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : null}
                            {user.role || "user"}
                        </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-1">
                        {user.role !== "admin" ? (
                            <div className="text-sm text-muted-foreground">
                                {user.in_game_name}
                            </div>
                        ) : null}
                        {user.role !== "admin" ? (
                            <Badge variant="outline">
                                Level {user.level}
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select
                    value={user.role || "user"}
                    onValueChange={(role) => onRoleChange(user.id, role)}
                    disabled={isPending || user.id === currentUserId}
                >
                    <SelectTrigger className="w-[130px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                {user.id === currentUserId && (
                    <span className="text-xs text-muted-foreground">
                        (You)
                    </span>
                )}
            </div>
        </div>
    );
}
