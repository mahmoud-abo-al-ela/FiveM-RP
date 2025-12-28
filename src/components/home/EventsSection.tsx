"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight, CalendarX, Clock, Users, Sparkles } from "lucide-react";
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

function EventCard({ event, index }: { event: Event; index: number }) {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card className="bg-card/30 border-white/10 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden h-full backdrop-blur-sm">
        {/* Image section */}
        {event.image_url && (
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Date badge */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/30">
              <div className="text-2xl font-bold text-primary">{eventDate.getDate()}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>

            {/* Status badge */}
            {isUpcoming && (
              <div className="absolute top-4 left-4 bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-green-500/50 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-400 font-medium">Upcoming</span>
              </div>
            )}
          </div>
        )}

        <CardContent className="p-6 relative z-10">
          {/* Icon for events without images */}
          {!event.image_url && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>

          {/* Event meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{event.current_participants} joined</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EventsSection({ events }: EventsSectionProps) {
  const hasEvents = events.length > 0;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="py-12 border-b border-white/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div style={{ y, opacity }} className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>  
            <motion.h2 
              className="text-2xl md:text-4xl font-display font-bold uppercase"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Upcoming{" "}
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary relative"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Events
              </motion.span>
            </motion.h2>
          </div>

          {hasEvents && (
            <Link href="/events">
              <motion.div 
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Button variant="ghost" className="text-primary hover:bg-primary/10 group">
                  <span>View All Events</span>
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {/* Events grid or empty state */}
        {hasEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card className="bg-card/30 border-white/10 border-dashed relative overflow-hidden">
              {/* Animated background */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, hsl(280 100% 60% / 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, hsl(180 100% 50% / 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, hsl(280 100% 60% / 0.1) 0%, transparent 50%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              <CardContent className="p-16 text-center relative z-10">
                <motion.div
                  className="relative inline-block mb-6"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <CalendarX className="h-20 w-20 text-muted-foreground/30 mx-auto" />
                  <motion.div
                    className="absolute inset-0 blur-xl bg-primary/20"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <motion.h3 
                  className="text-3xl font-display font-bold uppercase mb-3 text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  No Events Scheduled
                </motion.h3>

                <motion.p 
                  className="text-muted-foreground/70 max-w-md mx-auto text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  We're planning something amazing! Check back soon for upcoming events and tournaments.
                </motion.p>

                {/* Decorative elements */}
                <motion.div
                  className="mt-8 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
