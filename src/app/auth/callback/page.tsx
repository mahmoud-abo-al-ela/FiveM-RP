"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error during auth callback:", error);
        router.push("/auth/error?error=Callback");
        return;
      }

      if (session?.user) {
        try {
          // Sync user data with our custom users table
          const response = await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            console.error("Error syncing user:", await response.text());
          }

          // Check if user has completed profile setup and activation status
          const profileResponse = await fetch("/api/auth/check-profile");
          const profileData = await profileResponse.json();

          if (!profileData.hasProfile) {
            // New user - redirect to activation form
            router.push("/auth/activate");
          } else if (!profileData.activated) {
            // User has profile but not activated - redirect to pending page
            const status = profileData.rejected ? "rejected" : "pending";
            router.push(`/auth/pending?status=${status}`);
          } else {
            // Activated user - redirect to home
            router.push("/");
          }
        } catch (err) {
          console.error("Failed to sync user:", err);
          router.push("/auth/activate");
        }
      } else {
        router.push("/");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
