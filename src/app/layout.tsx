import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { BackToTop } from "@/components/layout/BackToTop";
import { LoadingProvider } from "@/components/layout/LoadingScreen";

export const metadata: Metadata = {
  title: "LEGACY RP - FiveM Roleplay Server",
  description:
    "Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
          <LoadingProvider>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50"></div>
            <Navbar />
            <main>{children}</main>
            <Toaster />
            <BackToTop />
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
