"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Terminal, Shield, ShoppingBag, Menu, X, Calendar, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { NavbarLogo } from "./_components/navbar/NavbarLogo";
import { DesktopNavItems } from "./_components/navbar/DesktopNavItems";
import { UserMenu } from "./_components/navbar/UserMenu";
import { MobileMenu } from "./_components/navbar/MobileMenu";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<{ activated: boolean; display_name: string | null; in_game_name: string | null } | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      // 1. Check if user is logged in
      if (!user) {
        setIsAdmin(false);
        setUserProfile(null);
        return;
      }

      // 2. Fetch user profile for display names / activation status / role
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("users")
        .select("role, activated, display_name, in_game_name")
        .eq("id", user.id)
        .single();
      
      // Check if user is admin from profile
      if (profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setUserProfile(profile ? {
        activated: profile.activated,
        display_name: profile.display_name,
        in_game_name: profile.in_game_name
      } : null);

    }
    
    checkAdmin();
  }, [user, pathname]);

  const allNavItems = [
    { href: "/", label: "Home", icon: Terminal },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/rules", label: "Rules", icon: Shield },
    { href: "/store", label: "Store", icon: ShoppingBag },
  ];

  // Check if user can access public pages (must have profile AND be activated, or be admin)
  const canAccessPublicPages = () => {
    if (!user) return true; // Non-logged in users can see nav (will be redirected by middleware)
    if (isAdmin) return true;
    if (!userProfile) return false;
    const hasProfile = !!(userProfile.display_name && userProfile.in_game_name);
    return hasProfile && userProfile.activated;
  };

  // Filter nav items based on user status
  const navItems = canAccessPublicPages() ? allNavItems : [];

  const getDiscordAvatarUrl = () => {
    if (!user) return null;
    const metadata = user.user_metadata;
    if (metadata?.avatar_url) return metadata.avatar_url;
    return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;
  };

  const getLogoHref = () => {
    // If user is not logged in, go to home
    if (!user) return "/";
    
    // If admin, go to home
    if (isAdmin) return "/";
    
    if (!userProfile) return "/";

    // If user has no profile (no display_name or in_game_name), go to activate
    const hasProfile = userProfile.display_name && userProfile.in_game_name;
    if (!hasProfile) return "/auth/activate";
    
    // If user has profile but not activated, go to pending
    if (!userProfile.activated) return "/auth/pending";
    
    // If activated, go to home
    return "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <NavbarLogo getLogoHref={getLogoHref} />

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center">
          <DesktopNavItems navItems={navItems} pathname={pathname} />
          
          {loading ? (
            <div className="ml-4 h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <div className="ml-4 flex items-center gap-3">
              <UserMenu
                user={user}
                isAdmin={isAdmin}
                canAccessPublicPages={canAccessPublicPages()}
                getDiscordAvatarUrl={getDiscordAvatarUrl}
                onSignOut={signOut}
              />
            </div>
          ) : (
            <Button 
              onClick={() => signInWithDiscord()}
              className="ml-4 bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-300 shadow-[0_0_15px_rgba(88,101,242,0.3)]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Sign in with Discord
            </Button>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <MobileMenu
          navItems={navItems}
          pathname={pathname}
          user={user}
          isAdmin={isAdmin}
          canAccessPublicPages={canAccessPublicPages()}
          getDiscordAvatarUrl={getDiscordAvatarUrl}
          onSignOut={signOut}
          onSignIn={signInWithDiscord}
          onClose={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}

