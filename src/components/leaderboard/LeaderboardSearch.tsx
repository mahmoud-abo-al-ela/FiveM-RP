"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LeaderboardSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LeaderboardSearch({ searchQuery, onSearchChange }: LeaderboardSearchProps) {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search player..."
        className="pl-9 bg-card/30 border-white/5"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
