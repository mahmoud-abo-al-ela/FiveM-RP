"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { format } from "date-fns";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataPagination } from "@/components/ui/data-pagination";

const ITEMS_PER_PAGE = 9;

export default function EventsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      race: "bg-red-500/20 text-red-400 border-red-500/50",
      heist: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      community: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      tournament: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    };
    return (
      colors[type.toLowerCase()] ||
      "bg-gray-500/20 text-gray-400 border-gray-500/50"
    );
  };

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      event.event_type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-display font-bold uppercase mb-4"
            >
              Server <span className="text-primary">Events</span>
            </motion.h1>
            <p className="text-muted-foreground text-lg">
              Join community events, races, heists, and tournaments
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {user && (
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
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
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Event Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="race">Race</SelectItem>
                <SelectItem value="heist">Heist</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card/30 border-white/5 animate-pulse">
                <CardHeader className="h-48 bg-white/5" />
                <CardContent className="h-32" />
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="bg-card/30 border-white/5 p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event: any, i: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group h-full flex flex-col overflow-hidden hover:shadow-lg hover:shadow-primary/5">
                  {/* Event Image/Banner */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className={`${getEventTypeColor(
                          event.event_type
                        )} border backdrop-blur-md`}
                      >
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-2xl font-display font-bold text-white drop-shadow-lg truncate">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="flex-1 p-6 flex flex-col">
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span>{format(new Date(event.start_time), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span>{format(new Date(event.start_time), "p")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <span>
                          {event.current_participants || 0}
                          {event.max_participants &&
                            ` / ${event.max_participants}`}{" "}
                          participants
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                      {user ? "Register Now" : "Sign in to Register"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-12"
            />
          </>
        )}
      </div>
    </div>
  );
}
