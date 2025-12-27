"use client";

import { useState, useEffect, useRef } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

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

interface CategoryTabProps {
  category: RuleCategory;
  IconComponent: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export function CategoryTab({ category, IconComponent }: CategoryTabProps) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkActive = () =>
      setIsActive(el.getAttribute("data-state") === "active");

    const observer = new MutationObserver(checkActive);
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    checkActive();

    return () => observer.disconnect();
  }, []);

  return (
    <TabsTrigger
      ref={ref}
      value={category.slug}
      className="cursor-pointer relative font-display uppercase tracking-wider transition-all duration-300 hover:text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${category.color}30 0%, ${category.color}50 100%)`
          : "transparent",
        border: isActive
          ? `1px solid ${category.color}80`
          : "1px solid transparent",
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
