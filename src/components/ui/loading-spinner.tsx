import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "text-primary",
  message,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("text-center py-12", className)}>
      <Loader2
        className={cn(
          "animate-spin mx-auto",
          sizeClasses[size],
          color
        )}
      />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  );
}
