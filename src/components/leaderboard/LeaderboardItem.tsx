"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardItemProps {
  entry: any;
  index: number;
  category: string;
}

export function LeaderboardItem({ entry, index, category }: LeaderboardItemProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return "bg-card/50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`${getRankBadgeColor(
          entry.rank
        )} border-white/5 hover:border-primary/30 transition-all group`}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12">
              {getRankIcon(entry.rank)}
            </div>

            <Avatar className="h-12 w-12 ring-2 ring-primary/50">
              <AvatarImage
                src={
                  entry.user?.discord_avatar
                    ? `https://cdn.discordapp.com/avatars/${entry.user.discord_id}/${entry.user.discord_avatar}.png`
                    : undefined
                }
                alt={entry.profile?.display_name || entry.user?.discord_username}
              />
              <AvatarFallback className="bg-primary text-white">
                {(entry.profile?.display_name || entry.user?.discord_username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {entry.profile?.display_name ||
                  entry.user?.discord_username ||
                  "Unknown Player"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {entry.profile?.level && `Level ${entry.profile.level}`}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {entry.score.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {category === "playtime" && "Hours"}
                {category === "wealth" && "Credits"}
                {category === "reputation" && "Points"}
                {category === "level" && "XP"}
              </p>
            </div>

            {entry.rank <= 3 && (
              <Badge className={getRankBadgeColor(entry.rank)}>
                Top {entry.rank}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
