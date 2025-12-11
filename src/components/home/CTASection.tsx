"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={sectionRef} className="py-24 relative">
      <motion.div style={{ y, scale }} className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <Card className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-white/10 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, hsl(var(--secondary) / 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <CardContent className="p-12 text-center relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10">
              <motion.h2 
                className="text-4xl md:text-5xl font-display font-bold uppercase mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to Start Your <span className="text-primary">Journey</span>?
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands of players in the most immersive FiveM roleplay experience
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <ExternalLink className="mr-2 h-5 w-5 relative z-10" />
                    <span className="relative z-10">Connect to Server</span>
                  </Button>
                </motion.div>
                <Link href="/events">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg">
                      <Calendar className="mr-2 h-5 w-5" />
                      View Events
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
    </section>
  );
}
