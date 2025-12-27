import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { PaymentProvider, PaymentProviderInfo } from "@/lib/payments/provider";

interface PaymentSelectionViewProps {
  item: {
    name: string;
    price: string;
    category: string;
  };
  convertedPrice: { formatted: string };
  providers: PaymentProviderInfo[];
  selectedProvider: PaymentProvider | null;
  onSelectProvider: (provider: PaymentProvider) => void;
}

export function PaymentSelectionView({ 
  item, 
  convertedPrice, 
  providers, 
  selectedProvider, 
  onSelectProvider 
}: PaymentSelectionViewProps) {
  
  const getProviderIcon = (providerId: PaymentProvider) => {
    switch (providerId) {
      case "stripe": return <CreditCard className="h-5 w-5" />;
      case "instapay": return <CreditCard className="h-5 w-5" />;
      case "wallet": return <Smartphone className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <>
      {/* Price Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
        <div className="relative bg-black/40 border border-white/5 p-5 rounded-2xl flex justify-between items-center overflow-hidden">
           <div className="space-y-1 relative z-10">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Price</p>
             <h3 className="text-3xl font-black text-white tracking-tighter">
               {convertedPrice.formatted}
             </h3>
           </div>
           <div className="bg-white/5 p-3 rounded-xl border border-white/10 relative z-10 backdrop-blur-md">
             <CreditCard className="h-6 w-6 text-primary" />
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
        </div>
      </div>

      {/* Payment Grid */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Payment Method</Label>
        <div className="grid grid-cols-1 gap-2">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProvider(p.id)}
              className={`
                relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group
                ${selectedProvider === p.id 
                   ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/5" 
                   : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  p-2 rounded-lg transition-all duration-300
                  ${selectedProvider === p.id ? "bg-primary text-primary-foreground scale-110" : "bg-black/30 text-muted-foreground group-hover:text-white"}
                `}>
                  {getProviderIcon(p.id)}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${selectedProvider === p.id ? "text-white" : "text-muted-foreground group-hover:text-white"}`}>
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground opacity-60 font-medium">
                    {p.description}
                  </p>
                </div>
              </div>
              {selectedProvider === p.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow shadow-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
