"use client";

import { Crown, DollarSign, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentDialog } from "@/components/store/PaymentDialog";
import { useState } from "react";
import { StoreHero } from "@/components/store/StoreHero";
import { VipTab } from "@/components/store/VipTab";
import { MoneyTab } from "@/components/store/MoneyTab";
import { VehiclesTab } from "@/components/store/VehiclesTab";

const ITEMS_PER_PAGE = 6;

export default function Store() {
  const [vipPage, setVipPage] = useState(1);
  const [moneyPage, setMoneyPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: storeItems = [], isLoading } = useQuery({
    queryKey: ["store-items"],
    queryFn: async () => {
      const res = await fetch("/api/store");
      if (!res.ok) throw new Error("Failed to fetch store items");
      return res.json();
    },
  });

  const handlePurchaseClick = (item: any) => {
    setSelectedItem(item);
    setPaymentDialogOpen(true);
  };

  const vipItems = storeItems.filter((item: any) => item.category === "vip");
  const moneyItems = storeItems.filter((item: any) => item.category === "money");
  const vehicleItems = storeItems.filter((item: any) => item.category === "vehicle");

  const vipTotalPages = Math.ceil(vipItems.length / ITEMS_PER_PAGE);
  const moneyTotalPages = Math.ceil(moneyItems.length / ITEMS_PER_PAGE);
  const vehicleTotalPages = Math.ceil(vehicleItems.length / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <StoreHero />

      <Tabs defaultValue="vip" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10 p-1 mb-12 h-auto">
          <TabsTrigger
            value="vip"
            className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <Crown className="h-5 w-5" /> VIP Status
          </TabsTrigger>
          <TabsTrigger
            value="money"
            className="cursor-pointer data-[state=active]:bg-green-600 data-[state=active]:text-white font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <DollarSign className="h-5 w-5" /> In-Game Money
          </TabsTrigger>
          <TabsTrigger
            value="vehicles"
            className="cursor-pointer data-[state=active]:bg-secondary data-[state=active]:text-black font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <Car className="h-5 w-5" /> Vehicles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vip">
          <VipTab
            isLoading={isLoading}
            vipItems={vipItems}
            vipPage={vipPage}
            vipTotalPages={vipTotalPages}
            onPageChange={setVipPage}
            onPurchaseClick={handlePurchaseClick}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </TabsContent>

        <TabsContent value="money">
          <MoneyTab
            isLoading={isLoading}
            moneyItems={moneyItems}
            moneyPage={moneyPage}
            moneyTotalPages={moneyTotalPages}
            onPageChange={setMoneyPage}
            onPurchaseClick={handlePurchaseClick}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </TabsContent>

        <TabsContent value="vehicles">
          <VehiclesTab
            isLoading={isLoading}
            vehicleItems={vehicleItems}
            vehiclePage={vehiclePage}
            vehicleTotalPages={vehicleTotalPages}
            onPageChange={setVehiclePage}
            onPurchaseClick={handlePurchaseClick}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </TabsContent>
      </Tabs>


      {selectedItem && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          item={selectedItem}
        />
      )}
    </div>
  );
}
