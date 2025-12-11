"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, TrendingUp, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPagination } from "@/components/ui/data-pagination";

const ITEMS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const [category, setCategory] = useState("playtime");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["leaderboard", category],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?category=${category}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const filteredLeaderboard = leaderboard.filter((entry: any) => {
    const name =
      entry.profile?.display_name ||
      entry.user?.discord_username ||
      "Unknown Player";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeaderboard = filteredLeaderboard.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const categories = [
    { value: "playtime", label: "Playtime", icon: TrendingUp },
    { value: "wealth", label: "Wealth", icon: Trophy },
    { value: "reputation", label: "Reputation", icon: Award },
    { value: "level", label: "Level", icon: Medal },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return (
      <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    );
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return "bg-card/50";
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display font-bold uppercase mb-4">
            <span className="text-primary">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete with the best players on the server
          </p>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={handleCategoryChange} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-card/30 border border-white/5">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <cat.icon className="h-4 w-4 mr-2" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search player..."
            className="pl-9 bg-card/30 border-white/5"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="bg-card/30 border-white/5 animate-pulse">
                <CardContent className="p-6 h-20" />
              </Card>
            ))}
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <Card className="bg-card/30 border-white/5 p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
            <p className="text-muted-foreground">Try adjusting your search.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedLeaderboard.map((entry: any, i: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`${getRankBadgeColor(
                    entry.rank
                  )} border-white/5 hover:border-primary/30 transition-all group`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12 ring-2 ring-primary/50">
                        <AvatarImage
                          src={
                            entry.user?.discord_avatar
                              ? `https://cdn.discordapp.com/avatars/${entry.user.discord_id}/${entry.user.discord_avatar}.png`
                              : undefined
                          }
                          alt={
                            entry.profile?.display_name ||
                            entry.user?.discord_username
                          }
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {(
                            entry.profile?.display_name ||
                            entry.user?.discord_username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {entry.profile?.display_name ||
                            entry.user?.discord_username ||
                            "Unknown Player"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.profile?.level &&
                            `Level ${entry.profile.level}`}
                        </p>
                      </div>

                      {/* Score */}
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

                      {/* Top 3 Badge */}
                      {entry.rank <= 3 && (
                        <Badge className={getRankBadgeColor(entry.rank)}>
                          Top {entry.rank}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}
