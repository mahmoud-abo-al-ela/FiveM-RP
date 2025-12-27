"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EventsSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function EventsSearch({ searchQuery, onSearchChange }: EventsSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col md:flex-row gap-4 mb-8 bg-card/30 p-4 rounded-lg border border-white/5"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-9 bg-black/20 border-white/10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </motion.div>
  );
}
