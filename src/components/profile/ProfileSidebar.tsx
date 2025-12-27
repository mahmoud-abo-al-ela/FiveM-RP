import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface ProfileSidebarProps {
  user: any;
  profile: any;
}

export function ProfileSidebar({ user, profile }: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Achievements */}
      <Card className="bg-card/30 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No achievements yet
          </p>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-card/30 border-white/5">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <Badge variant="outline">{user.user_metadata?.role || "User"}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Member Since</p>
            <p className="font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
