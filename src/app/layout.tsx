import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { BackToTop } from "@/components/layout/BackToTop";

export const metadata: Metadata = {
  title: "LEGACY RP - FiveM Roleplay Server",
  description:
    "Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-white">
        <Providers>
          <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50"></div>
          <Navbar />
          <main>{children}</main>
          <Toaster />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
