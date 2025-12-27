import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopNavItemsProps {
  navItems: NavItem[];
  pathname: string;
}

export function DesktopNavItems({ navItems, pathname }: DesktopNavItemsProps) {
  return (
    <div className="hidden md:flex gap-6 items-center">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary uppercase tracking-wide",
            pathname === item.href ? "text-primary text-glow" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}
