"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={sectionRef} className="py-16 border-y border-white/5 relative">
      <motion.div 
        style={{ y }}
        className="container mx-auto px-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <AnimatedStatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function AnimatedStatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Parse the value correctly, handling K suffix and decimals
      let target = 0;
      const numericString = stat.value.match(/[\d.]+/)?.[0] || '0';
      
      if (stat.value.includes('K')) {
        target = parseFloat(numericString) * 1000;
      } else {
        target = parseFloat(numericString);
      }
      
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  // Format the display value based on original format
  const displayValue = stat.value.includes('K') 
    ? `${(count / 1000).toFixed(1)}K+` 
    : stat.value.includes('%')
    ? `${count.toFixed(1)}%`
    : stat.value.includes('+')
    ? `${Math.floor(count)}+`
    : Math.floor(count).toString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10, scale: 1.05 }}
    >
      <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all text-center relative overflow-hidden group">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        />
        <CardContent className="p-6 relative z-10">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.6 }}
          >
            <stat.icon className={`h-10 w-10 ${stat.color} mx-auto mb-3`} />
          </motion.div>
          <motion.div 
            className="text-3xl font-bold mb-1"
            initial={{ scale: 1 }}
            animate={isInView ? { scale: [1, 1.1, 1] } : {}}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
          >
            {displayValue}
          </motion.div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
