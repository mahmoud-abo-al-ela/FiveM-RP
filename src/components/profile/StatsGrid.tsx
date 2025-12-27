import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, Star, TrendingUp } from "lucide-react";

interface StatsGridProps {
  profile: any;
}

export function StatsGrid({ profile }: StatsGridProps) {
  const stats = [
    {
      label: "Level",
      value: profile?.level || 1,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Playtime",
      value: `${profile?.playtime_hours || 0}h`,
      icon: Clock,
      color: "text-green-400",
    },
    {
      label: "Reputation",
      value: profile?.reputation_score || 0,
      icon: Star,
      color: "text-yellow-400",
    },
    {
      label: "Experience",
      value: profile?.experience_points || 0,
      icon: Trophy,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all">
            <CardContent className="p-6 text-center">
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
