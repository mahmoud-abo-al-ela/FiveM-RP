"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, User, Gamepad2, Calendar, MessageSquare, Clock } from "lucide-react";
import { ActivationsEmptyState } from "./empty-states";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const ITEMS_PER_PAGE = 10;

interface PendingUser {
  id: string;
  display_name: string;
  in_game_name: string;
  bio: string | null;
  created_at: string;
  discord_username: string | null;
  discord_avatar: string | null;
}

const DISCORD_ACTIVATION_CHANNEL = "discord://discord.com/channels/1448275635268227153/1448291486088302692";

export function ActivationQueue() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ["pending-activations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/activations");
      if (!res.ok) throw new Error("Failed to fetch pending activations");
      return res.json();
    },
  });

  const openDiscordChannel = () => {
    // Try to open in Discord app first
    window.location.href = DISCORD_ACTIVATION_CHANNEL;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Activation Queue
              {!isLoading && pendingUsers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingUsers.length} pending
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1.5">
              View pending activation requests. Approve or reject them in Discord.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            onClick={openDiscordChannel}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Discord
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <ActivationsEmptyState />
        ) : (
          <>
            <div className="space-y-3">
              {pendingUsers
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((user: PendingUser, index: number) => (
              <Card 
                key={user.id}
                className="bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar with Badge */}
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                        <AvatarImage src={user.discord_avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {user.display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge 
                        variant="secondary" 
                        className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5"
                      >
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </Badge>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                            {user.display_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {user.discord_username && (
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-[#5865F2]" />
                                <span>{user.discord_username}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{getTimeAgo(user.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Gamepad2 className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">In-Game:</span>
                          <span className="font-medium">{user.in_game_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Registered:</span>
                          <span className="font-medium">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-md border border-white/5">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
                ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={Math.ceil(pendingUsers.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
