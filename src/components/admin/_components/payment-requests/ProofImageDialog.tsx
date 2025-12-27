import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProofImageDialogProps {
  selectedImage: string | null;
  onClose: () => void;
}

export function ProofImageDialog({ selectedImage, onClose }: ProofImageDialogProps) {
  return (
    <Dialog open={!!selectedImage} onOpenChange={() => onClose()}>
       <DialogContent className="max-w-4xl bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle>Payment Proof Screenshot</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center bg-black/50 p-4 rounded-lg overflow-hidden">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Payment proof" 
                className="max-h-[70vh] w-auto object-contain shadow-2xl rounded"
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button asChild>
              <a href={selectedImage || undefined} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Original
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
