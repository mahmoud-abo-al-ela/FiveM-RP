"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Clock, Star, TrendingUp, Edit, Save, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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

  const stats = [
    {
      label: "Level",
      value: profile?.level || 1,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Playtime",
      value: `${profile?.playtime_hours || 0}h`,
      icon: Clock,
      color: "text-green-400",
    },
    {
      label: "Reputation",
      value: profile?.reputation_score || 0,
      icon: Star,
      color: "text-yellow-400",
    },
    {
      label: "Experience",
      value: profile?.experience_points || 0,
      icon: Trophy,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card/30 border-white/5 mb-8 overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <CardContent className="relative px-8 pb-8">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  <AvatarImage src={getDiscordAvatarUrl() || undefined} alt={user.user_metadata?.full_name || user.email || "User"} />
                  <AvatarFallback className="bg-primary text-white text-4xl">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-display font-bold">
                      {profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </h1>
                    <Badge className="bg-[#5865F2] text-white">
                      Discord Verified
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    @{user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </p>
                  {profile?.in_game_name && (
                    <p className="text-sm text-muted-foreground">
                      In-Game: <span className="text-primary">{profile.in_game_name}</span>
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => {
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
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "" : "bg-primary hover:bg-primary/90"}
                >
                  {isEditing ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {/* Bio */}
              {!isEditing && profile?.bio && (
                <p className="text-muted-foreground mb-6">{profile.bio}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all">
                    <CardContent className="p-6 text-center">
                      <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Edit Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/30 border-white/5">
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) =>
                          setFormData({ ...formData, display_name: e.target.value })
                        }
                        className="bg-background/50 border-white/10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="in_game_name">In-Game Name</Label>
                      <Input
                        id="in_game_name"
                        value={formData.in_game_name}
                        onChange={(e) =>
                          setFormData({ ...formData, in_game_name: e.target.value })
                        }
                        className="bg-background/50 border-white/10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="bg-background/50 border-white/10 min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <Button
                      onClick={() => updateProfileMutation.mutate(formData)}
                      disabled={updateProfileMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recent Activity */}
            <Card className="bg-card/30 border-white/5">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent activity to display
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="bg-card/30 border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-center py-4">
                  No achievements yet
                </p>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-card/30 border-white/5">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge variant="outline">{user.user_metadata?.role || "User"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
