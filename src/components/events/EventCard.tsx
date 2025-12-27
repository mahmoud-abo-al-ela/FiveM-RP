"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: any;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group h-full flex flex-col overflow-hidden hover:shadow-lg hover:shadow-primary/5">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden group-hover:scale-105 transition-transform duration-500">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-2xl font-display font-bold text-white drop-shadow-lg truncate">
              {event.title}
            </h3>
          </div>
        </div>

        <CardContent className="flex-1 p-6 flex flex-col">
          <p className="text-muted-foreground text-sm h-[60px] line-clamp-3 mb-4">
            {event.description}
          </p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <span>{format(new Date(event.event_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <span>{format(new Date(event.event_date), "p")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
