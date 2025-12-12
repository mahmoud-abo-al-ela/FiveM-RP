"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Terminal, Shield, ShoppingCart, Menu, X, Calendar, Trophy, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState<{ username: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ activated: boolean; display_name: string | null; in_game_name: string | null } | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      // Always check for admin session cookie first (on all pages)
      try {
        const res = await fetch("/api/auth/admin/verify");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAdminSession({ username: data.admin.username });
            setIsAdmin(true);
            setUserProfile(null);
            return;
          }
        }
      } catch (error) {
        // Silently fail if admin check fails
        console.debug("Admin session check failed:", error);
      }

      // No admin session, reset admin state
      setAdminSession(null);

      // Check if regular user has admin role
      if (!user) {
        setIsAdmin(false);
        setUserProfile(null);
        return;
      }
      
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("users")
        .select("role, activated, display_name, in_game_name")
        .eq("id", user.id)
        .single();
      
      setIsAdmin(profile?.role === "admin");
      setUserProfile(profile ? {
        activated: profile.activated,
        display_name: profile.display_name,
        in_game_name: profile.in_game_name
      } : null);
    }
    
    checkAdmin();
  }, [user, pathname]);

  const navItems = [
    { href: "/", label: "Home", icon: Terminal },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/rules", label: "Rules", icon: Shield },
    { href: "/store", label: "Store", icon: ShoppingCart },
  ];

  const getDiscordAvatarUrl = () => {
    if (!user) return null;
    const metadata = user.user_metadata;
    if (metadata?.avatar_url) return metadata.avatar_url;
    return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;
  };

  const getLogoHref = () => {
    // If user is not logged in, go to home
    if (!user || !userProfile) return "/";
    
    // If admin, go to home
    if (isAdmin) return "/";
    
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
        <Link href={getLogoHref()} className="flex items-center gap-2 font-display text-2xl font-bold tracking-wider text-primary hover:text-primary/80 transition-colors">
          <span className="text-glow">LEGACY</span> <span className="text-white">RP</span>
        </Link>

        {/* Desktop Nav */}
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
          
          {loading && !adminSession ? (
            <div className="ml-4 h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          ) : adminSession || user ? (
            <div className="ml-4 flex items-center gap-3">
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/50 hover:ring-primary transition-all">
                    <Avatar className="h-10 w-10">
                      {adminSession ? (
                        <>
                          <AvatarFallback className="bg-primary text-white">
                            <Shield className="h-5 w-5" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={getDiscordAvatarUrl() || undefined} alt={user?.user_metadata?.full_name || user?.email || "User"} />
                          <AvatarFallback className="bg-primary text-white">
                            {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-md border-white/10" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {adminSession ? (
                        <>
                          <p className="text-sm font-medium leading-none">{adminSession.username}</p>
                          <p className="text-xs leading-none text-muted-foreground">Administrator</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={async () => {
                      if (adminSession) {
                        await fetch("/api/auth/admin/logout", { method: "POST" });
                        window.location.href = "/auth/admin";
                      } else {
                        signOut();
                      }
                    }}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              onClick={signInWithDiscord}
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
        <div className="md:hidden border-t border-white/10 bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5",
                pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          
          {adminSession || user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 border-t border-white/10 mt-2 pt-4">
                <Avatar className="h-10 w-10">
                  {adminSession ? (
                    <AvatarFallback className="bg-primary text-white">
                      <Shield className="h-5 w-5" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={getDiscordAvatarUrl() || undefined} alt={user?.user_metadata?.full_name || user?.email || "User"} />
                      <AvatarFallback className="bg-primary text-white">
                        {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="flex-1">
                  {adminSession ? (
                    <>
                      <p className="text-sm font-medium">{adminSession.username}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </>
                  )}
                </div>
              </div>
              {isAdmin ? (
                <Link href="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-400"
                onClick={async () => {
                  if (adminSession) {
                    await fetch("/api/auth/admin/logout", { method: "POST" });
                    window.location.href = "/auth/admin";
                  } else {
                    signOut();
                  }
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button 
              onClick={signInWithDiscord}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white mt-2"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Sign in with Discord
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

