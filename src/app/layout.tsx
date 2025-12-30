import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { BackToTop } from "@/components/layout/BackToTop";
import { LoadingProvider } from "@/components/layout/LoadingScreen";
import MicrosoftClarity from "@/components/analytics/MicrosoftClarity";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: {
    default: "LEGACY RP - FiveM Roleplay Server",
    template: "%s | LEGACY RP",
  },
  description:
    "Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.",
  keywords: [
    "FiveM",
    "roleplay",
    "GTA V",
    "RP server",
    "gaming",
    "multiplayer",
    "LEGACY RP",
    "custom framework",
    "player economy",
  ],
  authors: [{ name: "LEGACY RP" }],
  creator: "LEGACY RP",
  publisher: "LEGACY RP",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "LEGACY RP - FiveM Roleplay Server",
    description:
      "Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.",
    siteName: "LEGACY RP",
    images: [
      {
        url: "/Logos/logo.png",
        width: 1200,
        height: 630,
        alt: "LEGACY RP Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEGACY RP - FiveM Roleplay Server",
    description:
      "Experience the next generation of FiveM roleplay. Custom framework, player-driven economy, and infinite possibilities.",
    images: ["/Logos/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  verification: {
    google: "Jk-G1yF8X_JmCe6f9eAGWCdB1CHQysj4leBDHDykiF4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projectId = "us6k68pztu";
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-white">
        <Providers>
          <LoadingProvider>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50"></div>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <MicrosoftClarity projectId={projectId} />
            <BackToTop />
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
