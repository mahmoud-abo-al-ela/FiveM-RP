"use client";

import { motion } from "framer-motion";

export function RulesHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <h1 className="text-5xl font-display font-bold mb-4 text-glow">
        Server Rules
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        To ensure a high-quality roleplay environment, all citizens must adhere to
        the following laws.
      </p>
    </motion.div>
  );
}
