import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  detectUserLocation, 
  getAvailablePaymentProviders, 
  type PaymentProvider, 
  type PaymentProviderInfo 
} from "@/lib/payments/provider";

interface UsePaymentLogicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: number;
    name: string;
    price: string;
    category: string;
  };
}

export function usePaymentLogic({ open, onOpenChange, item }: UsePaymentLogicProps) {
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [isEgypt, setIsEgypt] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [providers, setProviders] = useState<PaymentProviderInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "details">("select");

  // Wallet payment fields
  const [walletNumber, setWalletNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [walletInstructions, setWalletInstructions] = useState<any>(null);
  
  // Payment proof image upload
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Granular Submission State
  const [submittingState, setSubmittingState] = useState<"idle" | "uploading" | "processing" | "success">("idle");
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (open) {
      detectLocation();
      setStep("select");
      setSuccess(null);
      setError(null);
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      setWalletNumber("");
      setNotes("");
      setSubmittingState("idle");
    }
  }, [open]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submittingState === "processing") {
      timer = setTimeout(() => setShowFallback(true), 8000);
    } else {
      setShowFallback(false);
    }
    return () => clearTimeout(timer);
  }, [submittingState]);

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const location = await detectUserLocation();
      setIsEgypt(location.isEgypt);
      const availableProviders = getAvailablePaymentProviders(location.isEgypt);
      setProviders(availableProviders.filter(p => p.enabled));
      
      if (availableProviders.length > 0 && availableProviders[0].enabled) {
        setSelectedProvider(availableProviders[0].id);
      }

      if (location.isEgypt) {
        fetchWalletInstructions();
      }
    } catch (err) {
      console.error("Location detection failed:", err);
      const globalProviders = getAvailablePaymentProviders(false);
      setProviders(globalProviders.filter(p => p.enabled));
      if (globalProviders.length > 0) {
        setSelectedProvider(globalProviders[0].id);
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  const fetchWalletInstructions = async () => {
    try {
      const response = await fetch("/api/payments/wallet");
      if (response.ok) {
        const data = await response.json();
        setWalletInstructions(data);
      }
    } catch (err) {
      console.error("Failed to fetch wallet instructions:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setPaymentProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const uploadPaymentProof = async (): Promise<string | null> => {
    if (!paymentProofFile) return null;
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('file', paymentProofFile);
      const response = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }
      const data = await response.json();
      return data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment proof');
      return null;
    } finally {
      setUploadingProof(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedProvider) {
      setError("Please select a payment method");
      return;
    }

    if ((selectedProvider === "wallet" || selectedProvider === "instapay") && step === "select") {
      setStep("details");
      return;
    }

    setLoading(true);
    setError(null);
    const toastId = toast.loading(
      selectedProvider === "stripe" 
        ? "Preparing checkout..." 
        : "Submitting your payment request..."
    );

    try {
      let uploadedProofUrl: string | null = null;

      if (selectedProvider === "wallet" || selectedProvider === "instapay") {
        if (!walletNumber) {
          setError("Please enter your wallet/phone number");
          setLoading(false);
          toast.dismiss(toastId);
          return;
        }
        if (!paymentProofFile) {
          setError("Please upload a screenshot of your successful transfer");
          setLoading(false);
          toast.dismiss(toastId);
          return;
        }
        
        setSubmittingState("uploading");
        uploadedProofUrl = await uploadPaymentProof();
        if (!uploadedProofUrl) {
          setLoading(false);
          setSubmittingState("idle");
          toast.dismiss(toastId);
          return;
        }
      }

      setSubmittingState("processing");
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          paymentProvider: selectedProvider,
          walletNumber: (selectedProvider === "wallet" || selectedProvider === "instapay") ? walletNumber : undefined,
          paymentProofUrl: uploadedProofUrl || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) throw new Error(data.error || "Payment failed");

      if (selectedProvider === "stripe") {
        if (data.url) {
          toast.success("Redirecting to checkout...");
          window.location.href = data.url;
        } else {
          throw new Error("No payment URL received");
        }
      } else {
        toast.success("Payment request submitted successfully!", {
          description: "Our team will verify it shortly. You can track the status in your profile."
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      setError(err.message || "Payment failed. Please try again.");
      setSubmittingState("idle");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    detectingLocation,
    isEgypt,
    selectedProvider,
    setSelectedProvider,
    providers,
    error,
    setError,
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
  };
}
