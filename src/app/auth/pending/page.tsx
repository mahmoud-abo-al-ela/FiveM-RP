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
      .from("user_profiles")
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
