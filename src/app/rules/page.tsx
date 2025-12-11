"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rules available at this time.</p>
        </div>
      ) : (
        <Tabs defaultValue={visibleCategories[0]?.slug} className="max-w-4xl mx-auto">
          <TabsList 
            className="grid w-full bg-black/40 border border-white/10 p-1 mb-8"
            style={{ gridTemplateColumns: `repeat(${visibleCategories.length}, minmax(0, 1fr))` }}
          >
            {visibleCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.slug}
                className="font-display uppercase tracking-wider data-[state=active]:text-white transition-colors"
              >
                {category.name}
              </TabsTrigger>
            ))}
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
      <div className="flex items-center gap-3 mb-6">
        <IconComponent className="h-8 w-8" style={{ color: category.color }} />
        <div>
          <h2 className="text-2xl font-display uppercase">{category.name}</h2>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No rules in this category yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((rule, i) => (
            <Card
              key={rule.id}
              className="bg-card/50 border-white/5 hover:border-white/20 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span style={{ color: category.color, opacity: 0.8 }}>§{i + 1}.0</span>
                  {rule.title}
                </CardTitle>
              </CardHeader>
              {rule.description && (
                <CardContent>
                  <p className="text-muted-foreground">{rule.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
