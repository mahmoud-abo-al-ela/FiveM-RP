import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Upload, CheckCircle, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PaymentProvider } from "@/lib/payments/provider";

interface ManualPaymentDetailsViewProps {
  selectedProvider: PaymentProvider | null;
  walletInstructions: any;
  walletNumber: string;
  onWalletNumberChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  paymentProofPreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onBack: () => void;
}

export function ManualPaymentDetailsView({
  selectedProvider,
  walletInstructions,
  walletNumber,
  onWalletNumberChange,
  notes,
  onNotesChange,
  paymentProofPreview,
  onImageChange,
  onRemoveImage,
  onBack
}: ManualPaymentDetailsViewProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-7 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white mb-2"
      >
        <ChevronLeft className="h-3 w-3 mr-1" /> Back
      </Button>

      {/* Manual Payment Instructions */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4">
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            {selectedProvider === "wallet" ? "Send to Vodafone Cash" : "Send to InstaPay ID"}
          </Label>
          {selectedProvider === "wallet" ? (
            walletInstructions?.walletNumbers.map((num: string, i: number) => (
              <div key={i} className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-white/5 group mt-2">
                 <span className="text-lg font-mono font-bold tracking-tighter text-white">{num}</span>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-primary hover:bg-primary/20"
                   onClick={() => {
                     navigator.clipboard.writeText(num);
                     toast.success("Number copied!");
                   }}
                 >
                   <CreditCard className="h-4 w-4" />
                 </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-white/5 group mt-2">
               <span className="text-base font-bold tracking-tight text-primary uppercase">{walletInstructions?.instaPayId}</span>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-8 w-8 text-primary hover:bg-primary/20"
                 onClick={() => {
                   navigator.clipboard.writeText(walletInstructions?.instaPayId);
                   toast.success("ID copied!");
                 }}
               >
                 <CreditCard className="h-4 w-4" />
               </Button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            Please perform the transfer first, then fill in your details below and upload the screenshot.
          </p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="walletNumber" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Sender Number</Label>
          <Input
            id="walletNumber"
            placeholder="01XXXXXXXXX"
            value={walletNumber}
            onChange={(e) => onWalletNumberChange(e.target.value)}
            className="h-11 bg-black/40 border-white/5 focus:border-primary/50 text-sm font-medium transition-all"
          />
        </div>

        <div className="space-y-1.5 text-center">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Payment Proof</Label>
          {!paymentProofPreview ? (
            <div 
              onClick={() => document.getElementById('paymentProof')?.click()}
              className="w-full border-2 border-dashed border-white/5 rounded-2xl p-6 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all cursor-pointer group"
            >
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
              <p className="text-[11px] font-bold text-muted-foreground group-hover:text-white uppercase tracking-wider">Upload Screenshot</p>
              <input id="paymentProof" type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 group">
               <img src={paymentProofPreview} className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Proof" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <CheckCircle className="h-8 w-8 text-primary shadow-2xl opacity-80" />
               </div>
               <Button 
                 variant="destructive" 
                 size="icon" 
                 className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-2xl"
                 onClick={onRemoveImage}
               >
                 <X className="h-3 w-3" />
               </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any extra info..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[60px] bg-black/40 border-white/5 focus:border-primary/50 text-xs transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}
