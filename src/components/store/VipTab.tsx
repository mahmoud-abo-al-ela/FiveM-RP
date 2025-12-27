"use client";

import { motion } from "framer-motion";
import { Check, Crown, Diamond, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DataPagination } from "@/components/ui/data-pagination";

interface VipTabProps {
  isLoading: boolean;
  vipItems: any[];
  vipPage: number;
  vipTotalPages: number;
  onPageChange: (page: number) => void;
  onPurchaseClick: (item: any) => void;
  itemsPerPage: number;
}

export function VipTab({
  isLoading,
  vipItems,
  vipPage,
  vipTotalPages,
  onPageChange,
  onPurchaseClick,
  itemsPerPage,
}: VipTabProps) {
  const paginatedVipItems = vipItems.slice(
    (vipPage - 1) * itemsPerPage,
    vipPage * itemsPerPage
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading VIP packages..." />;
  }

  if (vipItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No VIP packages available.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {paginatedVipItems.map((pkg: any, i: number) => {
          const metadata = pkg.metadata ? JSON.parse(pkg.metadata) : {};
          const iconMap: any = {
            "Gold VIP": Star,
            "Platinum VIP": Crown,
            "Diamond VIP": Diamond,
          };
          const Icon = iconMap[pkg.name] || Star;
          const colorMap: any = {
            "Gold VIP": "text-yellow-400",
            "Platinum VIP": "text-gray-300",
            "Diamond VIP": "text-cyan-400",
          };
          const color = colorMap[pkg.name] || "text-primary";

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative ${pkg.popular ? "md:-mt-8 md:mb-8" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                  <Badge className="bg-primary text-white px-4 py-1 uppercase tracking-widest text-xs shadow-lg shadow-primary/50">
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full bg-card/40 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col ${
                  pkg.popular ? "shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-card/60" : ""
                }`}
              >
                <CardHeader className="text-center pt-10">
                  <div className="mx-auto bg-white/5 p-4 rounded-full mb-4 w-fit">
                    <Icon className={`h-8 w-8 ${color}`} />
                  </div>
                  <CardTitle className="text-3xl font-display uppercase">
                    {pkg.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-4xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground text-sm">
                      {metadata.period || ""}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-4 mt-4">
                    {(metadata.features || []).map((feat: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-sm group">
                        <Check className="h-5 w-5 text-primary shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="text-gray-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-8">
                  <Button
                    data-testid={`button-purchase-${pkg.id}`}
                    onClick={() => onPurchaseClick(pkg)}
                    className={`w-full py-6 text-lg tracking-wider ${
                      pkg.popular
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <DataPagination
        currentPage={vipPage}
        totalPages={vipTotalPages}
        onPageChange={onPageChange}
        className="mt-12"
      />
    </>
  );
}
