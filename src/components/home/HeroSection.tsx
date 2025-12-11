"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, Users, Activity, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface HeroSectionProps {
  serverStatus?: {
    online: boolean;
    currentPlayers: number;
    maxPlayers: number;
    ping: number;
  };
}

export function HeroSection({ serverStatus }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full z-10"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
          }}
          animate={{
            y: typeof window !== 'undefined' ? [null, Math.random() * window.innerHeight] : 0,
            x: typeof window !== 'undefined' ? [null, Math.random() * window.innerWidth] : 0,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
      ))}

      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className="container relative z-20 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          >
            <Badge variant="outline" className="border-primary text-primary px-4 py-1 text-sm tracking-widest uppercase bg-primary/10 backdrop-blur-md">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Season 2 Now Live
              </motion.span>
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Legacy{" "}
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary text-glow inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              RP
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Experience the next generation of FiveM roleplay. 
            Custom framework, player-driven economy, and infinite possibilities.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                data-testid="button-connect"
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-none clip-path-slant shadow-[0_0_30px_rgba(168,85,247,0.5)] relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <ExternalLink className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Connect Now</span>
              </Button>
            </motion.div>
            <Link href="/rules">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  data-testid="button-rules"
                  size="lg" 
                  variant="outline" 
                  className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-6 text-lg rounded-none clip-path-slant relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-secondary/10"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Shield className="mr-2 h-5 w-5 relative z-10" />
                  <span className="relative z-10">View Rules</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div 
            className="mt-12 flex items-center gap-8 text-sm text-gray-400 bg-black/40 p-4 rounded-full backdrop-blur-sm border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <motion.div 
                data-testid="status-indicator"
                className={`h-2 w-2 rounded-full ${serverStatus?.online ? 'bg-green-500' : 'bg-red-500'}`}
                animate={{
                  boxShadow: serverStatus?.online 
                    ? ["0 0 10px rgba(34,197,94,0.8)", "0 0 20px rgba(34,197,94,0.4)", "0 0 10px rgba(34,197,94,0.8)"]
                    : ["0 0 10px rgba(239,68,68,0.8)", "0 0 20px rgba(239,68,68,0.4)", "0 0 10px rgba(239,68,68,0.8)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>{serverStatus?.online ? 'Online' : 'Offline'}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span data-testid="text-player-count">{serverStatus?.currentPlayers || 0} / {serverStatus?.maxPlayers || 200} Players</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              <span data-testid="text-ping">{serverStatus?.ping || 0}ms Ping</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-8 w-8 text-primary/50" />
      </motion.div>
    </section>
  );
}
