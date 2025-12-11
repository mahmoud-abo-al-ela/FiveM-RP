"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight, CalendarX } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  expiration_date: string;
  current_participants: number;
}

interface EventsSectionProps {
  events: Event[];
}

export function EventsSection({ events }: EventsSectionProps) {
  const hasEvents = events.length > 0;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={sectionRef} className="py-24 border-b border-white/5 relative">
      <motion.div style={{ y }} className="container mx-auto px-4">
        <motion.div
          className="flex justify-between items-end mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl font-display font-bold uppercase mb-2">
              Upcoming <span className="text-primary">Events</span>
            </h2>
            <p className="text-muted-foreground">
              {hasEvents ? "Don't miss out on the action!" : "Stay tuned for exciting events!"}
            </p>
          </div>
          {hasEvents && (
            <Link href="/events">
              <motion.div whileHover={{ x: 5 }}>
                <Button variant="ghost" className="text-primary hover:bg-primary/10">
                  View All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {hasEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden h-full">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                  {event.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      {!event.image_url && (
                        <motion.div
                          className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Calendar className="h-8 w-8 text-primary" />
                        </motion.div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors flex justify-between">
                          {event.title} <span className="text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card className="bg-card/30 border-white/5 border-dashed">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <CalendarX className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold uppercase mb-2 text-muted-foreground">
                  No Events Scheduled
                </h3>
                <p className="text-muted-foreground/70 max-w-md mx-auto">
                  We're planning something amazing! Check back soon for upcoming events and tournaments.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </motion.div>  
    </section>
  );
}
