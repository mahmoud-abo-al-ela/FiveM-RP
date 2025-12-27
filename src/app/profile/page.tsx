"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { PaymentHistory } from "@/components/profile/PaymentHistory";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    in_game_name: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setFormData({
        display_name: data.display_name || "",
        bio: data.bio || "",
        in_game_name: data.in_game_name || "",
      });
      return data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    router.push("/auth/signin");
    return null;
  }

  const getDiscordAvatarUrl = () => {
    const metadata = user.user_metadata;
    if (metadata?.avatar_url) return metadata.avatar_url;
    if (metadata?.avatar && metadata?.provider_id) {
      return `https://cdn.discordapp.com/avatars/${metadata.provider_id}/${metadata.avatar}.png`;
    }
    return null;
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <ProfileHeader
          user={user}
          profile={profile}
          isEditing={isEditing}
          getDiscordAvatarUrl={getDiscordAvatarUrl}
          onToggleEdit={() => {
            if (isEditing) {
              setIsEditing(false);
              setFormData({
                display_name: profile?.display_name || "",
                bio: profile?.bio || "",
                in_game_name: profile?.in_game_name || "",
              });
            } else {
              setIsEditing(true);
            }
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <StatsGrid profile={profile} />

            {isEditing && (
              <ProfileEditForm
                formData={formData}
                onFormChange={setFormData}
                onSubmit={() => updateProfileMutation.mutate(formData)}
                isPending={updateProfileMutation.isPending}
              />
            )}

            <PaymentHistory
              payments={profile?.payments}
              currentPage={paymentsPage}
              onPageChange={setPaymentsPage}
            />
          </div>

          <ProfileSidebar user={user} profile={profile} />
        </div>
      </div>
    </div>
  );
}
