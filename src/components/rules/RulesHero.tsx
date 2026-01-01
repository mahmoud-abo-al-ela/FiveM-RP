"use client";

import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replace this with your actual Google Drive PDF link
const RULES_PDF_LINK = "https://docs.google.com/document/d/14zuGUFgiqvA08c47gdxA_kywW2X3eKEBZJu4HBpbssQ/edit?tab=t.0#heading=h.59xjl3a8w3hu";

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
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
        To ensure a high-quality roleplay environment, all citizens must adhere to
        the following laws.
      </p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          asChild
          className="group relative bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border border-primary/50 hover:border-primary text-white font-display uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <a
            href={RULES_PDF_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            <span>Read more about Rules</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </Button>
      </motion.div>
    </motion.div>
  );
}
