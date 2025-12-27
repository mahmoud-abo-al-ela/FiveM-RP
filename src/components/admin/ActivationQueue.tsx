"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, User } from "lucide-react";
import { ActivationsEmptyState } from "./empty-states";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

import { ActivationCard, PendingUser } from "@/components/admin/_components/activation-queue/ActivationCard";

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
    refetchInterval: 3000, // Poll every 3 seconds for faster updates
    refetchIntervalInBackground: true, // Continue polling even when tab is not focused
  });

  const openDiscordChannel = () => {
    // Try to open in Discord app first
    window.location.href = DISCORD_ACTIVATION_CHANNEL;
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
                  <ActivationCard 
                    key={user.id} 
                    user={user} 
                    rank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1} 
                  />
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
