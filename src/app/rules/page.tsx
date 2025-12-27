"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { RulesHero } from "@/components/rules/RulesHero";
import { CategoryTab } from "@/components/rules/CategoryTab";
import { RuleSection } from "@/components/rules/RuleSection";

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
      <RulesHero />

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
