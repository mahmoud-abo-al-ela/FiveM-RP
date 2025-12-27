"use client";

import { motion } from "framer-motion";

export function LeaderboardHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <h1 className="text-5xl font-display font-bold mb-4 text-glow">
        Leaderboard
      </h1>
      <p className="text-muted-foreground text-lg">
        Compete with the best players on the server
      </p>
    </motion.div>
  );
}
