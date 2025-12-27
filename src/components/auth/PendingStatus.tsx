"use client";

import { DiscordJoinPrompt } from "./DiscordJoinPrompt";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PendingStatusProps {
  profile: any;
  countdown: number;
  hasRedirected: boolean;
  onJoinClick: () => void;
}

export function PendingStatus({
  profile,
  countdown,
  hasRedirected,
  onJoinClick,
}: PendingStatusProps) {
  const router = useRouter();

  const handleSignOut = () => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => router.push("/"));
  };

  return (
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
        <h1 className="text-3xl font-bold text-white mb-2">Activation Pending</h1>
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
            <span>
              If approved, you'll get the "Activated" role and can join the
              server
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>
              This page will automatically update when a decision is made
            </span>
          </li>
        </ul>
      </div>

      <DiscordJoinPrompt
        countdown={countdown}
        hasRedirected={hasRedirected}
        onJoinClick={onJoinClick}
      />

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
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
