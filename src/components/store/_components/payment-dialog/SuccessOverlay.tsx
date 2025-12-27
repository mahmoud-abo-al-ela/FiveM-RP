import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessOverlayProps {
  onDone: () => void;
}

export function SuccessOverlay({ onDone }: SuccessOverlayProps) {
  return (
    <div className="absolute inset-0 z-[100] bg-[#0A0B0F]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative h-20 w-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.5)]">
          <CheckCircle className="h-10 w-10 text-primary-foreground stroke-[3]" />
        </div>
      </div>
      
      <div className="space-y-4 relative z-10 flex flex-col items-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Order Submitted</h3>
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            Your payment request has been received! Our team will verify it shortly. You can track the status in your profile.
          </p>
        </div>

        <div className="pt-8 w-full max-w-[200px]">
          <Button 
            onClick={onDone}
            className="w-full h-12 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.05]"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
