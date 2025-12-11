"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(128,0,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,0,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Animated scan line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scanline" />
      </div>

      {/* Center loading content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo/Brand */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse-scale" />

          {/* Spinning outer ring */}
          <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 animate-[spin_3s_linear_infinite]">
            {/* Accent dots on ring */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_hsl(var(--secondary))]" />
          </div>

          {/* Inner spinning ring (opposite direction) */}
          <div className="absolute inset-3 rounded-full border-2 border-secondary/30 animate-spin-reverse">
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_hsl(var(--secondary))]" />
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          </div>

          {/* Center pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center animate-pulse-scale">
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)),0_0_40px_hsl(var(--primary)/0.5)]" />
          </div>
        </div>

        {/* Loading text with glitch effect */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="font-display text-2xl tracking-[0.3em] text-primary text-glow">
            LEGACY RP
          </h2>

          {/* Animated loading dots */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground tracking-widest uppercase">
              Loading
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
}
