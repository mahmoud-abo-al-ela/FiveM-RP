"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PendingStatus } from "@/components/auth/PendingStatus";
import { RejectedStatus } from "@/components/auth/RejectedStatus";

export default function PendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Countdown timer for Discord redirect
  useEffect(() => {
    if (!loading && !profile?.activated && !hasRedirected && status === "pending") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/your-server";
            window.open(discordInvite, "_blank");
            setHasRedirected(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, profile, hasRedirected, status]);

  useEffect(() => {
    checkActivationStatus();
    const interval = setInterval(checkActivationStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  async function checkActivationStatus() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);
    setLoading(false);

    if (profileData?.activated) {
      router.push("/");
    }
  }

  const handleJoinDiscord = () => {
    const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/your-server";
    window.open(discordInvite, "_blank");
    setHasRedirected(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isRejected = status === "rejected" || profile?.rejected_at;
  const rejectedAt = profile?.rejected_at ? new Date(profile.rejected_at) : null;
  const now = new Date();
  const hoursSinceRejection = rejectedAt 
    ? (now.getTime() - rejectedAt.getTime()) / (1000 * 60 * 60)
    : 999;
  const hoursRemaining = rejectedAt ? Math.max(0, 24 - hoursSinceRejection) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {isRejected ? (
            <RejectedStatus profile={profile} hoursRemaining={hoursRemaining} />
          ) : (
            <PendingStatus
              profile={profile}
              countdown={countdown}
              hasRedirected={hasRedirected}
              onJoinClick={handleJoinDiscord}
            />
          )}
        </div>
      </div>
    </div>
  );
}
