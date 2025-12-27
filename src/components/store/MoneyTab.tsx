"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DataPagination } from "@/components/ui/data-pagination";

interface MoneyTabProps {
  isLoading: boolean;
  moneyItems: any[];
  moneyPage: number;
  moneyTotalPages: number;
  onPageChange: (page: number) => void;
  onPurchaseClick: (item: any) => void;
  itemsPerPage: number;
}

export function MoneyTab({
  isLoading,
  moneyItems,
  moneyPage,
  moneyTotalPages,
  onPageChange,
  onPurchaseClick,
  itemsPerPage,
}: MoneyTabProps) {
  const paginatedMoneyItems = moneyItems.slice(
    (moneyPage - 1) * itemsPerPage,
    moneyPage * itemsPerPage
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/assets/generated_images/stacks_of_futuristic_cash_and_crypto_chips_on_a_dark_table.png)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-8">
          <div>
            <h3 className="text-3xl font-display font-bold text-white mb-2">
              Instant Delivery
            </h3>
            <p className="text-gray-300">
              Funds are automatically deposited to your character's bank account within 5 minutes of purchase.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner color="text-green-600" message="Loading money packages..." />
        ) : moneyItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No money packages available.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedMoneyItems.map((pkg: any, i: number) => {
                const metadata = pkg.metadata ? JSON.parse(pkg.metadata) : {};
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card
                      className={`bg-card/40 border-white/5 hover:border-green-500/50 transition-all cursor-pointer relative overflow-hidden group ${
                        pkg.popular ? "border-green-500/30 bg-green-950/10" : ""
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-bl-lg">
                          Best Value
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                          <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {pkg.name}
                        </div>
                        {metadata.bonus && (
                          <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-4">
                            {metadata.bonus}
                          </div>
                        )}
                        <Button
                          data-testid={`button-purchase-${pkg.id}`}
                          onClick={() => onPurchaseClick(pkg)}
                          variant="outline"
                          className="w-full border-white/10 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
                        >
                          Buy for {pkg.price}
                        </Button>
                      </CardContent>
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <DataPagination
              currentPage={moneyPage}
              totalPages={moneyTotalPages}
              onPageChange={onPageChange}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}
