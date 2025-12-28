"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Users, Activity, Calendar, Zap, Shield, Gamepad2, Trophy } from "lucide-react";
import { useRef } from "react";

const features = [
  { 
    title: "Custom Framework", 
    desc: "Built from the ground up for maximum performance and unique features you won't find anywhere else.", 
    icon: Server, 
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5"
  },
  { 
    title: "Player Economy", 
    desc: "A realistic, player-driven economy where every job, business, and interaction matters.", 
    icon: Activity, 
    color: "text-secondary",
    gradient: "from-secondary/20 to-secondary/5"
  },
  { 
    title: "Active Community", 
    desc: "Join thousands of active players in a toxicity-free environment monitored by professional staff.", 
    icon: Users, 
    color: "text-blue-400",
    gradient: "from-blue-400/20 to-blue-400/5"
  },
  { 
    title: "Regular Events", 
    desc: "Participate in weekly events, tournaments, and special activities with amazing rewards.", 
    icon: Calendar, 
    color: "text-green-400",
    gradient: "from-green-400/20 to-green-400/5"
  },
  { 
    title: "Advanced Systems", 
    desc: "Custom scripts for housing, vehicles, jobs, gangs, and much more.", 
    icon: Zap, 
    color: "text-yellow-400",
    gradient: "from-yellow-400/20 to-yellow-400/5"
  },
  { 
    title: "Fair Moderation", 
    desc: "Experienced staff team ensuring fair play and handling reports 24/7.", 
    icon: Shield, 
    color: "text-red-400",
    gradient: "from-red-400/20 to-red-400/5"
  },
  { 
    title: "Optimized Performance", 
    desc: "Smooth gameplay with 60+ FPS on most systems thanks to our optimization.", 
    icon: Gamepad2, 
    color: "text-purple-400",
    gradient: "from-purple-400/20 to-purple-400/5"
  },
  { 
    title: "Competitive Leaderboards", 
    desc: "Climb the ranks and compete with other players in various categories.", 
    icon: Trophy, 
    color: "text-orange-400",
    gradient: "from-orange-400/20 to-orange-400/5"
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);

  return (
    <section ref={sectionRef} className="py-8 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-0" />
      <motion.div style={{ y }} className="container mx-auto px-4 relative">
      
      <motion.div 
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl md:text-4xl font-display font-bold uppercase mb-6">
          Why Choose <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary relative"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >Legacy RP</motion.span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, rotateY: 5, scale: 1.05 }}
            style={{ perspective: 1000 }}
          >
            <Card className={`bg-gradient-to-br ${feature.gradient} border-white/5 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group h-full relative overflow-hidden`}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
              <CardHeader className="relative z-10">
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <CardTitle className="text-xl font-display uppercase tracking-wide">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      </motion.div>
    </section>
  );
}
