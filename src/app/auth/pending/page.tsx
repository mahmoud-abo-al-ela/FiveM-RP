"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
            // Redirect to Discord server
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

    // Poll every 10 seconds to check if user has been activated
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

    // If activated, redirect to home
    if (profileData?.activated) {
      router.push("/");
    }
  }

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
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Activation Request Rejected
                </h1>
                <p className="text-gray-400">
                  Your activation request was not approved
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-red-400 font-semibold mb-2">Rejection Reason:</h3>
                <p className="text-gray-300">
                  {profile?.rejection_reason || "No reason provided"}
                </p>
              </div>

              {hoursRemaining > 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400">
                    ⏳ You can submit a new activation request in{" "}
                    <span className="font-bold">{Math.ceil(hoursRemaining)} hours</span>
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => router.push("/auth/activate")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Submit New Request
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    const supabase = createClient();
                    supabase.auth.signOut().then(() => router.push("/"));
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                  <svg
                    className="w-8 h-8 text-blue-500 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Activation Pending
                </h1>
                <p className="text-gray-400">
                  Your activation request is being reviewed by our staff
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-blue-400 font-semibold mb-3">What happens next?</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Staff will review your activation request</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>You'll receive a Discord DM with the decision</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>If approved, you'll get the "Activated" role and can join the server</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>This page will automatically update when a decision is made</span>
                  </li>
                </ul>
              </div>

              {/* Discord Join Prompt */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-indigo-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Join Our Discord Server</h3>
                      <p className="text-gray-400 text-sm">Required to receive approval notifications</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm mb-3">
                    ⚠️ <strong className="text-yellow-400">Important:</strong> You must join our Discord server to:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-400 ml-4">
                    <li>• Receive DM notifications about your activation status</li>
                    <li>• Get the "Activated" role when approved</li>
                    <li>• Access server information and support</li>
                  </ul>
                </div>

                {!hasRedirected && countdown > 0 ? (
                  <div className="text-center">
                    <p className="text-gray-300 mb-3">
                      Redirecting to Discord in <span className="text-2xl font-bold text-indigo-400">{countdown}</span> seconds...
                    </p>
                    <button
                      onClick={() => {
                        const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/your-server";
                        window.open(discordInvite, "_blank");
                        setHasRedirected(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Join Discord Now
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => {
                        const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/your-server";
                        window.open(discordInvite, "_blank");
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Join Discord Server
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Click to open Discord invite</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">Your Application:</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>
                    <span className="text-gray-500">Character Name:</span>{" "}
                    <span className="text-white">{profile?.display_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Submitted:</span>{" "}
                    <span className="text-white">
                      {profile?.updated_at
                        ? new Date(profile.updated_at).toLocaleString()
                        : "Recently"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>This page will refresh automatically every 10 seconds</p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    const supabase = createClient();
                    supabase.auth.signOut().then(() => router.push("/"));
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
