"use client";

import { motion } from "framer-motion";

export function StoreHero() {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-display font-bold mb-4 text-glow">
          Server Store
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Enhance your experience with VIP status, in-game currency, and exclusive limited-edition vehicles.
        </p>
      </motion.div>
    </div>
  );
}
