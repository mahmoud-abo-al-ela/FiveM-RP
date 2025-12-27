import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusMessagesProps {
  showFallback: boolean;
  error: string | null;
  success: string | null;
}

export function StatusMessages({ showFallback, error, success }: StatusMessagesProps) {
  return (
    <>
      {showFallback && !error && (
        <div className="mx-1 p-3 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-primary/80 leading-normal">
            This is taking a bit longer than usual. Please don't close the window, we're finalizing your request...
          </p>
        </div>
      )}

      {error && (
        <div className="mx-1 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 animate-in fade-in zoom-in-95">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-semibold text-red-400 leading-normal">{error}</p>
        </div>
      )}

      {success && (
        <div className="mx-1 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <p className="text-sm font-black text-green-400 uppercase tracking-tight">{success}</p>
          <p className="text-[10px] text-muted-foreground italic font-medium">Automatic delivery will follow approval.</p>
        </div>
      )}
    </>
  );
}
