"use client";

import { useAuth as useSupabaseAuth } from "./AuthProvider";

export function useAuth() {
  return useSupabaseAuth();
}

export function useRequireAuth() {
  const auth = useSupabaseAuth();
  
  if (!auth.user && !auth.loading) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
  }
  
  return auth;
}
