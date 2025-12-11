"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Activity, Calendar, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { EventsSection } from "@/components/home/EventsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import Loading from "./loading";

function HomeContent({
  serverStatus,
  upcomingEvents,
}: {
  serverStatus: any;
  upcomingEvents: any[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax effect for background - moves slower than content
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.1, 1.2]
  );
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.7, 0.5, 0.3, 0.2]
  );

  const stats = [
    {
      label: "Active Players",
      value: "300",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Total Events",
      value: "150+",
      icon: Calendar,
      color: "text-purple-400",
    },
    {
      label: "Server Uptime",
      value: "99.9%",
      icon: Activity,
      color: "text-green-400",
    },
    {
      label: "Community Size",
      value: "10K+",
      icon: Trophy,
      color: "text-yellow-400",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden relative">
      {/* Parallax Background - Fixed and covers entire page */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          y: backgroundY,
          scale: backgroundScale,
          opacity: backgroundOpacity,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/assets/generated_images/cyberpunk_city_street_at_night_with_neon_lights_and_rain.png)`,
            filter: "blur(2px)",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </motion.div>

      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at center, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-10">
        <HeroSection serverStatus={serverStatus} />
        <StatsSection stats={stats} />
        <EventsSection events={upcomingEvents} />
        <FeaturesSection />
        <CTASection />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: serverStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["server-status"],
    queryFn: async () => {
      const res = await fetch("/api/server-status");
      if (!res.ok) throw new Error("Failed to fetch server status");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: upcomingEvents = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) return [];
      const events = await res.json();
      return events.slice(0, 2);
    },
  });

  if (isStatusLoading || isEventsLoading) {
    return <Loading />;
  }

  return (
    <HomeContent serverStatus={serverStatus} upcomingEvents={upcomingEvents} />
  );
}
