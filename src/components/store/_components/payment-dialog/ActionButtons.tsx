import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ActionButtonsProps {
  loading: boolean;
  selectedProvider: string | null;
  step: "select" | "details";
  submittingState: string;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ActionButtons({ 
  loading, 
  selectedProvider, 
  step, 
  submittingState, 
  onCancel, 
  onSubmit 
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
       <Button 
         variant="ghost" 
         onClick={onCancel}
         className="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/5 transition-all"
         disabled={loading}
       >
         Cancel
       </Button>
       <Button 
         onClick={onSubmit}
         disabled={loading || !selectedProvider}
         className={`
           flex-[1.5] h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 border
           ${selectedProvider === "stripe" 
              ? "bg-white text-black hover:bg-white/90 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"}
           hover:translate-y-[-2px] active:translate-y-[1px] disabled:opacity-50 disabled:translate-y-0
         `}
       >
         {loading ? (
           <div className="flex items-center justify-center gap-2 w-full h-full">
             <span className="animate-pulse whitespace-nowrap">
               {submittingState === "uploading" ? "Uploading..." : "Processing..."}
             </span>
           </div>
         ) : (
           <div className="flex items-center justify-center gap-2 w-full h-full">
             <span className="flex items-center gap-2 font-black">
               {step === "select" && selectedProvider !== "stripe" ? "Next Step" : "Submit Payment"}
               <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
             </span>
           </div>
         )}
       </Button>
    </div>
  );
}
