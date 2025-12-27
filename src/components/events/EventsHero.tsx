"use client";

import { motion } from "framer-motion";

export function EventsHero() {
  return (
    <div className="text-center mb-12 ">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-display font-bold mb-4 text-glow"
        >
          Events
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Join community events, races, heists, and tournaments
        </p>
      </div>
    </div>
  );
}
