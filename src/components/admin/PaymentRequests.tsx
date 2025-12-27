"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertCircle,
  Smartphone,
  CreditCard,
  Search,
  Filter
} from "lucide-react";
import { ProofImageDialog } from "@/components/admin/_components/payment-requests/ProofImageDialog";
import { RejectPaymentDialog } from "@/components/admin/_components/payment-requests/RejectPaymentDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

export function PaymentRequests() {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payment-requests");
      if (!res.ok) throw new Error("Failed to fetch payment requests");
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: "approve" | "reject"; reason?: string }) => {
      const res = await fetch("/api/admin/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, paymentRequestId: id, reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to process request");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Payment request ${variables.action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] });
      setRejectId(null);
      setRejectId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> {status === "completed" ? "Completed" : "Approved"}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "instapay":
        return <CreditCard className="w-4 h-4 text-primary" />;
      case "wallet":
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case "stripe":
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    if (type === "automated") {
      return <Badge variant="outline" className="text-[10px] uppercase bg-purple-500/10 text-purple-500 border-purple-500/20">Stripe</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] uppercase bg-blue-500/10 text-blue-500 border-blue-500/20">Manual</Badge>;
  };

  const filteredRequests = data?.requests?.filter((req: any) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesSearch = 
      req.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.users?.discord_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.users?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.users?.discord_id?.toString().includes(searchQuery) ||
      req.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.wallet_number?.includes(searchQuery) ||
      req.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-8 text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
        <AlertCircle className="w-5 h-5" />
        <p>Error loading payment requests: {(error as any).message}</p>
      </div>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-md border-white/10">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment History & Requests
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search email, item, provider, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[280px] bg-black/30 border-white/10"
              />
            </div>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md px-3 py-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">
                    No payment requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((req: any) => (
                  <TableRow key={req.id} className="hover:bg-white/5 border-white/5">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white">
                          {req.users?.discord_username || req.users?.display_name || "Unknown User"}
                        </span>
                        <div className="flex flex-col text-xs text-muted-foreground font-mono">
                          <span>{req.users?.discord_id || "No Discord ID"}</span>
                          <span className="text-primary/70">{req.wallet_number}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary/80">{req.item_name}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {req.display_currency === 'USD' ? '$' : ''}{req.display_amount} {req.display_currency !== 'USD' ? req.display_currency : ''}
                      </span>
                    </TableCell>
                    <TableCell>{getPaymentTypeBadge(req.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 capitalize">
                        {getMethodIcon(req.payment_method)}
                        {req.payment_method}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {req.transaction_id ? (
                        <div className="flex flex-col">
                          <span className="opacity-70">{format(new Date(req.created_at), "MMM d, HH:mm")}</span>
                          <span className="opacity-30 text-[10px]" title={req.transaction_id}>
                            {req.transaction_id.substring(0, 12)}...
                          </span>
                        </div>
                      ) : (
                        format(new Date(req.created_at), "MMM d, HH:mm")
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.type === "manual" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedImage(req.payment_proof_url)}
                            title="View Proof"
                            className="hover:bg-primary/20 text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="w-8" /> // Placeholder
                        )}

                        {req.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Are you sure you want to approve this payment?")) {
                                  actionMutation.mutate({ id: req.id, action: "approve" });
                                }
                              }}
                              title="Approve"
                              className="hover:bg-green-500/20 text-green-500"
                              disabled={actionMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRejectId(req.id)}
                              title="Reject"
                              className="hover:bg-red-500/20 text-red-500"
                              disabled={actionMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {req.rejection_reason && (
                          <div className="group relative">
                            <AlertCircle className="w-4 h-4 text-muted-foreground ml-2 cursor-help" />
                            <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded text-xs text-white z-50">
                              Rejection Reason: {req.rejection_reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Proof Image Dialog */}
      {/* Proof Image Dialog */}
      <ProofImageDialog 
        selectedImage={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      {/* Reject Dialog */}
      {/* Reject Dialog */}
      <RejectPaymentDialog
        rejectId={rejectId}
        onClose={() => setRejectId(null)}
        onReject={(id, reason) => actionMutation.mutate({ id, action: "reject", reason })}
        isPending={actionMutation.isPending}
      />
    </Card>
  );
}
