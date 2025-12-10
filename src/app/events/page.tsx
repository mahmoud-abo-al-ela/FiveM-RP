"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { format } from "date-fns";

export default function EventsPage() {
  const { user } = useAuth();
  
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
    return colors[type.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
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
          
          {user && (
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>

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
        ) : events.length === 0 ? (
          <Card className="bg-card/30 border-white/5 p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground">Check back later for new events!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any, i: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group h-full flex flex-col overflow-hidden">
                  {/* Event Image/Banner */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getEventTypeColor(event.event_type)} border`}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-display font-bold text-white drop-shadow-lg">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="flex-1 p-6">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{format(new Date(event.start_time), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{format(new Date(event.start_time), "p")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          {event.current_participants || 0}
                          {event.max_participants && ` / ${event.max_participants}`} participants
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/50 transition-all">
                      {user ? "Register" : "Sign in to Register"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
