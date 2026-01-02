"use client";

import { Card } from "@/components/ui/card";
import { Trophy, Award, TrendingUp, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPagination } from "@/components/ui/data-pagination";
import { LeaderboardHero } from "@/components/leaderboard/LeaderboardHero";
import { LeaderboardSearch } from "@/components/leaderboard/LeaderboardSearch";
import { LeaderboardItem } from "@/components/leaderboard/LeaderboardItem";

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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <LeaderboardHero />

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

        <LeaderboardSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
        />

        {isLoading ? (
          <LoadingSpinner message="Loading leaderboard..." />
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
                <LeaderboardItem 
                  key={entry.id} 
                  entry={entry} 
                  index={i} 
                  category={category} 
                />
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
