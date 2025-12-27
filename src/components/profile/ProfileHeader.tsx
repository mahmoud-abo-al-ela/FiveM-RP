import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";

interface ProfileHeaderProps {
  user: any;
  profile: any;
  isEditing: boolean;
  onToggleEdit: () => void;
  getDiscordAvatarUrl: () => string | null;
}

export function ProfileHeader({ 
  user, 
  profile, 
  isEditing, 
  onToggleEdit, 
  getDiscordAvatarUrl 
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/30 border-white/5 mb-8 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <CardContent className="relative px-8 pb-8">
          {/* Avatar */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
            <Avatar className="h-32 w-32 ring-4 ring-background">
              <AvatarImage src={getDiscordAvatarUrl() || undefined} alt={user.user_metadata?.full_name || user.email || "User"} />
              <AvatarFallback className="bg-primary text-white text-4xl">
                {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">
                  {profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                </h1>
                <Badge className="bg-[#5865F2] text-white">
                  Discord Verified
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">
                @{user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
              </p>
              {profile?.in_game_name && (
                <p className="text-sm text-muted-foreground">
                  In-Game: <span className="text-primary">{profile.in_game_name}</span>
                </p>
              )}
            </div>

            <Button
              onClick={onToggleEdit}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-primary hover:bg-primary/90"}
            >
              {isEditing ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {/* Bio */}
          {!isEditing && profile?.bio && (
            <p className="text-muted-foreground mb-6">{profile.bio}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
