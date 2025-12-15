"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

function CategoryTab({ 
  category, 
  IconComponent 
}: { 
  category: RuleCategory; 
  IconComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const checkActive = () => setIsActive(el.getAttribute("data-state") === "active");
    
    const observer = new MutationObserver(checkActive);
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    checkActive();
    
    return () => observer.disconnect();
  }, []);

  return (
    <TabsTrigger
      ref={ref}
      value={category.slug}
      className=" cursor-pointer relative font-display uppercase tracking-wider transition-all duration-300 hover:text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${category.color}30 0%, ${category.color}50 100%)` 
          : "transparent",
        border: isActive ? `1px solid ${category.color}80` : "1px solid transparent",
        color: isActive ? "#fff" : undefined,
        boxShadow: isActive ? `0 0 20px ${category.color}30` : undefined,
      }}
    >
      <IconComponent 
        className="h-4 w-4" 
        style={{ color: isActive ? category.color : undefined }}
      />
      <span className="hidden sm:inline">{category.name}</span>
      <span className="sm:hidden">{category.name.substring(0, 3)}</span>
    </TabsTrigger>
  );
}

export default function Rules() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<RuleCategory[]>({
    queryKey: ["public-rule-categories"],
    queryFn: async () => {
      const res = await fetch("/api/rules/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery<Rule[]>({
    queryKey: ["public-rules"],
    queryFn: async () => {
      const res = await fetch("/api/rules");
      if (!res.ok) throw new Error("Failed to fetch rules");
      return res.json();
    },
  });

  const isLoading = categoriesLoading || rulesLoading;

  // Filter visible categories and sort by display_order
  const visibleCategories = categories
    .filter((cat) => cat.visible)
    .sort((a, b) => a.display_order - b.display_order);

  // Get visible rules for a category
  const getCategoryRules = (categoryId: number) => {
    return rules
      .filter((rule) => rule.category_id === categoryId && rule.visible)
      .sort((a, b) => a.display_order - b.display_order);
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-display font-bold mb-4 text-glow">
          Server Rules
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          To ensure a high-quality roleplay environment, all citizens must
          adhere to the following laws.
        </p>
      </motion.div>

      {isLoading ? (
        <LoadingSpinner message="Loading rules..." />
      ) : visibleCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rules available at this time.</p>
        </div>
      ) : (
        <Tabs defaultValue={visibleCategories[0]?.slug} className="max-w-4xl mx-auto">
          <TabsList 
            className="grid w-full bg-black/60 backdrop-blur-md border border-white/10 p-2 mb-8 rounded-xl gap-3 h-auto"
            style={{ gridTemplateColumns: `repeat(${visibleCategories.length}, minmax(0, 1fr))` }}
          >
            {visibleCategories.map((category) => {
              const IconComponent = category.icon && (LucideIcons as any)[category.icon] 
                ? (LucideIcons as any)[category.icon] 
                : Folder;
              
              return (
                <CategoryTab
                  key={category.id}
                  category={category}
                  IconComponent={IconComponent}
                />
              );
            })}
          </TabsList>

          {visibleCategories.map((category) => (
            <TabsContent key={category.id} value={category.slug}>
              <RuleSection
                category={category}
                items={getCategoryRules(category.id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function RuleSection({ category, items }: { category: RuleCategory; items: Rule[] }) {
  // Get the icon component dynamically
  const IconComponent = category.icon && (LucideIcons as any)[category.icon] 
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
            border: `2px solid ${category.color}40`
          }}
        >
          <IconComponent className="h-7 w-7" style={{ color: category.color }} />
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
        <div className="grid gap-4">
          {items.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card
                className="group relative bg-card/50 backdrop-blur-sm border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-2"
                  style={{ 
                    background: `linear-gradient(180deg, ${category.color}80 0%, ${category.color}40 100%)` 
                  }}
                />
                <CardHeader className="pl-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <span 
                      className="flex items-center justify-center w-10 h-10 rounded-lg font-mono text-sm shrink-0"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        border: `1px solid ${category.color}40`
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1">{rule.title}</span>
                  </CardTitle>
                </CardHeader>
                {rule.description && (
                  <CardContent className="pl-6">
                    <p className="text-muted-foreground leading-relaxed pl-[52px]">
                      {rule.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
