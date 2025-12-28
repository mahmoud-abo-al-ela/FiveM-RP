"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Activity, Calendar, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { EventsSection } from "@/components/home/EventsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import Loading from "./loading";

// Cyberpunk grid line component
const GridLine = ({ direction, position, delay }: { direction: 'horizontal' | 'vertical'; position: number; delay: number }) => (
  <motion.div
    className={`fixed ${direction === 'horizontal' ? 'left-0 right-0 h-[1px]' : 'top-0 bottom-0 w-[1px]'} bg-gradient-to-${direction === 'horizontal' ? 'r' : 'b'} from-transparent via-primary/10 to-transparent pointer-events-none z-[1]`}
    style={direction === 'horizontal' ? { top: `${position}%` } : { left: `${position}%` }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.5, 0] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// Floating cyber element
const CyberElement = ({ index }: { index: number }) => {
  const shapes = [
    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond
    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // Hexagon
    "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", // Pentagon
  ];
  
  return (
    <motion.div
      className="fixed pointer-events-none z-[1]"
      style={{
        left: `${10 + (index * 25) % 80}%`,
        top: `${15 + (index * 30) % 70}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.15, 0],
        scale: [0.5, 1, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 15 + index * 3,
        delay: index * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-32 h-32 border border-primary/20"
        style={{ clipPath: shapes[index % shapes.length] }}
      />
    </motion.div>
  );
};

function HomeContent({
  serverStatus,
  upcomingEvents,
}: {
  serverStatus: any;
  upcomingEvents: any[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track mouse for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

      {/* Interactive mouse-following gradient */}
      <motion.div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(280 100% 60% / 0.08) 0%, transparent 40%)`,
        }}
      />

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

      {/* Animated grid lines */}
      {[20, 40, 60, 80].map((pos, i) => (
        <GridLine key={`h-${i}`} direction="horizontal" position={pos} delay={i * 1.5} />
      ))}
      {[20, 40, 60, 80].map((pos, i) => (
        <GridLine key={`v-${i}`} direction="vertical" position={pos} delay={i * 1.5 + 0.5} />
      ))}

      {/* Floating cyber elements */}
      {[...Array(4)].map((_, i) => (
        <CyberElement key={i} index={i} />
      ))}

      {/* Vignette effect */}
      <div 
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Scan line overlay */}
      <div 
        className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 z-[3] pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')",
        }}
      />

      {/* Content with relative positioning */}
      <div className="relative z-10">
        <HeroSection serverStatus={serverStatus} />
        <StatsSection stats={stats} />
        <EventsSection events={upcomingEvents} />
        <FeaturesSection />
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
