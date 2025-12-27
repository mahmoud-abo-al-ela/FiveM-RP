import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Clock, Gamepad2, Calendar } from "lucide-react";

export interface PendingUser {
  id: string;
  display_name: string;
  in_game_name: string;
  bio: string | null;
  created_at: string;
  discord_username: string | null;
  discord_avatar: string | null;
}

interface ActivationCardProps {
    user: PendingUser;
    rank: number;
}

export function ActivationCard({ user, rank }: ActivationCardProps) {
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    return (
        <Card 
            className="bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
        >
            <CardContent className="p-5">
            <div className="flex items-start gap-4">
                {/* Avatar with Badge */}
                <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={user.discord_avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {user.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <Badge 
                    variant="secondary" 
                    className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5"
                >
                    #{rank}
                </Badge>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        {user.display_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {user.discord_username && (
                        <div className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-[#5865F2]" />
                            <span>{user.discord_username}</span>
                        </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{getTimeAgo(user.created_at)}</span>
                        </div>
                    </div>
                    </div>
                </div>

                <Separator className="my-3" />

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">In-Game:</span>
                    <span className="font-medium">{user.in_game_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                        })}
                    </span>
                    </div>
                </div>

                {/* Bio */}
                {user.bio && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md border border-white/5">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {user.bio}
                    </p>
                    </div>
                )}
                </div>
            </div>
            </CardContent>
        </Card>
    );
}
