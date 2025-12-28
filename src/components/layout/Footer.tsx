"use client";

import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Legacy RP. All rights reserved.
          </div>

          {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Built with
            <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" />
            by
            <a
              href="#"
              target="_blank"
              className="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
            >
              Mahmoud Ali
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
