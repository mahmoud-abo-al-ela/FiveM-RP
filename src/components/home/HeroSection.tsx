"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, MessageCircle, Zap } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface HeroSectionProps {
  serverStatus?: {
    online: boolean;
    currentPlayers: number;
    maxPlayers: number;
    ping: number;
  };
}

// Matrix rain character component
const MatrixChar = ({ delay, x }: { delay: number; x: number }) => {
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
  const [char, setChar] = useState(chars[Math.floor(Math.random() * chars.length)]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setChar(chars[Math.floor(Math.random() * chars.length)]);
    }, 100 + Math.random() * 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className="absolute text-primary/30 font-mono text-sm pointer-events-none"
      style={{ left: `${x}%` }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: "100vh", opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 4 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {char}
    </motion.span>
  );
};

export function HeroSection({ serverStatus }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Typewriter effect for the static part
  const staticText = "Start Your ";
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Animated cycling words (starts after typing is done)
  const words = ["Journey", "Adventure", "Story", "Legacy"];
  const [currentWord, setCurrentWord] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [isWordDeleting, setIsWordDeleting] = useState(false);

  // Type out the static text first
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= staticText.length) {
        setDisplayedText(staticText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setIsTypingDone(true);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Type and cycle through words after static text is done
  useEffect(() => {
    if (!isTypingDone) return;

    const currentWordText = words[currentWord];
    
    if (!isWordDeleting) {
      // Typing the word
      if (displayedWord.length < currentWordText.length) {
        const timer = setTimeout(() => {
          setDisplayedWord(currentWordText.slice(0, displayedWord.length + 1));
        }, 70);
        return () => clearTimeout(timer);
      } else {
        // Word fully typed, wait then start deleting
        const timer = setTimeout(() => {
          setIsWordDeleting(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      // Deleting the word
      if (displayedWord.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedWord(displayedWord.slice(0, -1));
        }, 40);
        return () => clearTimeout(timer);
      } else {
        // Word fully deleted, move to next word
        setIsWordDeleting(false);
        setCurrentWord((prev) => (prev + 1) % words.length);
      }
    }
  }, [isTypingDone, displayedWord, currentWord, isWordDeleting, words]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <MatrixChar key={i} delay={i * 0.3} x={Math.random() * 100} />
        ))}
      </div>


      {/* Electric Arc Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" style={{ opacity: 0.1 }}>
        <motion.path
          d="M0,200 Q400,100 800,200 T1600,200"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(280, 100%, 60%)" />
            <stop offset="100%" stopColor="hsl(180, 100%, 50%)" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div 
        style={{ opacity: contentOpacity, y: contentY, scale: contentScale }}
        className="container relative z-20 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          {/* Typewriter Title */}
          <motion.div className="relative">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {displayedText}
              {isTypingDone && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary" style={{ backgroundSize: "200% 200%" }}>
                  {displayedWord}
                </span>
              )}
              {/* Blinking cursor */}
              <motion.span
                className="text-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                |
              </motion.span>
            </motion.h1>
            
            {/* Animated underline - appears after first word is typed */}
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isTypingDone ? "60%" : 0, 
                opacity: isTypingDone ? 1 : 0 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>

          {/* Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button 
              data-testid="button-connect"
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-none clip-path-slant"
            >
              <Zap className="mr-2 h-5 w-5" />
              <span className="font-bold tracking-wider">Connect Now</span>
            </Button>
            
            <Link href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/vhCDeprYcV"} target="_blank" rel="noopener noreferrer">
              <Button 
                data-testid="button-discord"
                size="lg" 
                variant="outline" 
                className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-6 text-lg rounded-none clip-path-slant"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                <span className="font-bold tracking-wider">Join Discord</span>
              </Button>
            </Link>
          </motion.div>

          {/* Server Status */}
          <div className="mt-12 flex items-center gap-8 text-sm text-gray-400 bg-black/60 p-4 rounded-full backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div 
                data-testid="status-indicator"
                className={`h-3 w-3 rounded-full ${serverStatus?.online ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="font-medium">{serverStatus?.online ? 'Online' : 'Offline'}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span data-testid="text-player-count" className="font-medium">
                {serverStatus?.currentPlayers || 0} / {serverStatus?.maxPlayers || 200} Players
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.span
          className="text-xs text-gray-500 uppercase tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to explore
        </motion.span>
        <motion.div
          className="relative"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-primary/50" />
          <motion.div
            className="absolute inset-0"
            animate={{ y: [0, 5, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          >
            <ChevronDown className="h-8 w-8 text-primary/30" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
