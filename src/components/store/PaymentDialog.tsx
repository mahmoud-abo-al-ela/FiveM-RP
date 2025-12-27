"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/AuthProvider";
import { convertPrice } from "@/lib/payments/provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthRequiredView } from "./_components/payment-dialog/AuthRequiredView";
import { PaymentSelectionView } from "./_components/payment-dialog/PaymentSelectionView";
import { ManualPaymentDetailsView } from "./_components/payment-dialog/ManualPaymentDetailsView";
import { StatusMessages } from "./_components/payment-dialog/StatusMessages";
import { usePaymentLogic } from "./_components/payment-dialog/usePaymentLogic";
import { DialogHeaderContent } from "./_components/payment-dialog/DialogHeaderContent";
import { ActionButtons } from "./_components/payment-dialog/ActionButtons";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: number;
    name: string;
    price: string;
    category: string;
  };
}

export function PaymentDialog({ open, onOpenChange, item }: PaymentDialogProps) {
  const { user, loading: authLoading, signInWithDiscord } = useAuth();
  
  const {
    loading,
    detectingLocation,
    selectedProvider,
    setSelectedProvider,
    providers,
    error,
    success,
    step,
    setStep,
    walletNumber,
    setWalletNumber,
    notes,
    setNotes,
    walletInstructions,
    paymentProofPreview,
    setPaymentProofFile,
    setPaymentProofPreview,
    submittingState,
    showFallback,
    handleImageChange,
    handlePayment,
  } = usePaymentLogic({ open, onOpenChange, item });

  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);
  const priceUSD = parsePrice(item.price);
  const convertedPrice = selectedProviderInfo 
    ? convertPrice(priceUSD, selectedProviderInfo) 
    : { formatted: item.price };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#0A0B0F]/95 backdrop-blur-xl border-white/5 p-0 overflow-hidden shadow-2xl">
        <div className="relative p-6 pt-8">
          <DialogHeaderContent 
            category={item.category} 
            name={item.name} 
            step={step} 
          />

          {(authLoading || detectingLocation) ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner className="h-8 w-8 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                {authLoading ? "Authenticating..." : "Optimizing for your location..."}
              </p>
            </div>
          ) : !user ? (
            <AuthRequiredView 
              onSignIn={signInWithDiscord} 
              onClose={() => onOpenChange(false)} 
            />
          ) : (
            <div className="space-y-6">
              {step === "select" ? (
                <PaymentSelectionView
                  item={item}
                  convertedPrice={convertedPrice}
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelectProvider={setSelectedProvider}
                />
              ) : (
                <ManualPaymentDetailsView
                  selectedProvider={selectedProvider}
                  walletInstructions={walletInstructions}
                  walletNumber={walletNumber}
                  onWalletNumberChange={setWalletNumber}
                  notes={notes}
                  onNotesChange={setNotes}
                  paymentProofPreview={paymentProofPreview}
                  onImageChange={handleImageChange}
                  onRemoveImage={() => { 
                    setPaymentProofFile(null); 
                    setPaymentProofPreview(null); 
                  }}
                  onBack={() => setStep("select")}
                />
              )}

              <StatusMessages 
                showFallback={showFallback}
                error={error}
                success={success}
              />

              <ActionButtons
                loading={loading}
                selectedProvider={selectedProvider}
                step={step}
                submittingState={submittingState}
                onCancel={() => onOpenChange(false)}
                onSubmit={handlePayment}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
