import Link from "next/link";
import Image from "next/image";

interface NavbarLogoProps {
  getLogoHref: () => string;
}

export function NavbarLogo({ getLogoHref }: NavbarLogoProps) {
  return (
    <Link href={getLogoHref()} className="group relative flex items-center h-12 overflow-visible">
      {/* Motion trail effect */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 animate-logo-trail">
        <div className="h-10 w-24 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent blur-md rounded-full" />
      </div>
      
      {/* Logo container with slide + rotate + scale */}
      <div className="relative flex-shrink-0 animate-logo-slide z-10">
       {/* Logo image */}
        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] animate-logo-pulse">
          <Image
            src="/Logos/logo.png"
            alt="Legacy RP Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      
      {/* Title with staggered letter reveal */}
      <div className="flex flex-col leading-none ml-4 animate-title-container">
        <div className="flex items-baseline gap-0.5 overflow-hidden">
          <span className="animate-letter-1 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">L</span>
          <span className="animate-letter-2 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">E</span>
          <span className="animate-letter-3 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">G</span>
          <span className="animate-letter-4 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">A</span>
          <span className="animate-letter-5 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">C</span>
          <span className="animate-letter-6 font-display text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">Y</span>
          <span className="w-2" />
          <span className="animate-letter-7 font-display text-2xl font-black tracking-wider text-white">R</span>
          <span className="animate-letter-8 font-display text-2xl font-black tracking-wider text-white">P</span>
        </div>
      </div>
    </Link>
  );
}
