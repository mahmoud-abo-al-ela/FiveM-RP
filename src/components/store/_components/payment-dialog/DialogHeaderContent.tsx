import { Badge } from "@/components/ui/badge";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DialogHeaderContentProps {
  category: string;
  name: string;
  step: "select" | "details";
}

export function DialogHeaderContent({ category, name, step }: DialogHeaderContentProps) {
  return (
    <div className="space-y-1 mb-6">
      <div className="flex items-center gap-2 mb-1">
         <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold">
           {category}
         </Badge>
      </div>
      <DialogTitle className="text-2xl font-black tracking-tight text-white leading-tight">
        {name}
      </DialogTitle>
      <DialogDescription className="text-muted-foreground text-xs font-medium">
        {step === "select" ? "Choose how you'd like to pay" : "Provide transfer details"}
      </DialogDescription>
    </div>
  );
}
