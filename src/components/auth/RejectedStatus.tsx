"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RejectedStatusProps {
  profile: any;
  hoursRemaining: number;
}

export function RejectedStatus({ profile, hoursRemaining }: RejectedStatusProps) {
  const router = useRouter();

  const handleSignOut = () => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => router.push("/"));
  };

  return (
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
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
