"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState<any>(null);

  const itemId = searchParams.get("item");

  useEffect(() => {
    if (itemId) {
      fetchItemDetails();
    } else {
      setLoading(false);
    }
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`/api/store?category=all`);
      if (response.ok) {
        const items = await response.json();
        const item = items.find((i: any) => i.id === parseInt(itemId!));
        setItemDetails(item);
      }
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading payment details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/60 backdrop-blur-md border-white/10 overflow-hidden">
            <CardHeader className="text-center pb-6 pt-12 bg-gradient-to-b from-green-500/10 to-transparent">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              </motion.div>
              <CardTitle className="text-4xl font-display mb-2">
                Payment Successful!
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Thank you for your purchase
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pb-12">
              {itemDetails && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{itemDetails.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {itemDetails.category.charAt(0).toUpperCase() + itemDetails.category.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {itemDetails.price}
                      </div>
                    </div>
                  </div>
                  {itemDetails.description && (
                    <p className="text-sm text-muted-foreground border-t border-white/5 pt-4">
                      {itemDetails.description}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-400" />
                  What's Next?
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your purchase has been confirmed and recorded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      Your item will be delivered to your account within 5-10 minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      You can check your purchase history in your profile
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      If you don't receive your item, please contact support
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  onClick={() => router.push("/store")}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
