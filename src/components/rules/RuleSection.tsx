"use client";

import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RuleCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  display_order: number;
  visible: boolean;
}

interface Rule {
  id: number;
  category_id: number;
  title: string;
  description: string;
  display_order: number;
  visible: boolean;
}

interface RuleSectionProps {
  category: RuleCategory;
  items: Rule[];
}

export function RuleSection({ category, items }: RuleSectionProps) {
  const IconComponent =
    category.icon && (LucideIcons as any)[category.icon]
      ? (LucideIcons as any)[category.icon]
      : Folder;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-start gap-4 mb-8 p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-white/10">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
          style={{
            backgroundColor: `${category.color}20`,
            border: `2px solid ${category.color}40`,
          }}
        >
          <IconComponent
            className="h-7 w-7"
            style={{ color: category.color }}
          />
        </div>
        <div className="flex-1">
          <h2
            className="text-3xl font-display font-bold uppercase mb-2"
            style={{ color: category.color }}
          >
            {category.name}
          </h2>
          {category.description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-white/10">
          <p className="text-lg">No rules in this category yet.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <AccordionItem
                value={`rule-${rule.id}`}
                className="group relative bg-card/50 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl overflow-hidden rounded-xl data-[state=open]:border-white/30 data-[state=open]:shadow-2xl"
                dir="rtl"
                style={{
                  boxShadow: `0 0 0 0 ${category.color}00`,
                  transition: 'all 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 30px ${category.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 ${category.color}00`;
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-2 group-data-[state=open]:w-2"
                  style={{
                    background: `linear-gradient(180deg, ${category.color}80 0%, ${category.color}40 100%)`,
                  }}
                />
                <AccordionTrigger className="px-6 py-4 hover:no-underline group/trigger">
                  <div className="text-lg font-bold flex items-center gap-3 flex-1">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-lg font-mono text-sm shrink-0 transition-all duration-300 group-hover/trigger:scale-110"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        border: `1px solid ${category.color}40`,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-right transition-colors duration-300 group-hover/trigger:text-white">
                      {rule.title}
                    </span>
                  </div>
                </AccordionTrigger>
                {rule.description && (
                  <AccordionContent className="px-6 pb-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed pr-12">
                        {rule.description}
                      </p>
                    </motion.div>
                  </AccordionContent>
                )}
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      )}
    </motion.div>
  );
}
