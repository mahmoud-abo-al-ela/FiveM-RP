import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface RejectPaymentDialogProps {
  rejectId: number | null;
  onClose: () => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}

export function RejectPaymentDialog({ rejectId, onClose, onReject, isPending }: RejectPaymentDialogProps) {
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        if (rejectId) {
            setRejectionReason("");
        }
    }, [rejectId]);

    const handleReject = () => {
        if (!rejectionReason) return toast.error("Please provide a reason");
        if (rejectId) {
            onReject(rejectId, rejectionReason);
        }
    };

  return (
      <Dialog open={!!rejectId} onOpenChange={() => onClose()}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Reject Payment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment request. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Screenshot is blurry, Transaction ID doesn't match, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] bg-black/30 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
