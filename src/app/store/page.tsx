"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Check,
  Crown,
  Diamond,
  Star,
  DollarSign,
  Car,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function Store() {
  const [vipPage, setVipPage] = useState(1);
  const [moneyPage, setMoneyPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);
  const { data: storeItems = [] } = useQuery({
    queryKey: ["store-items"],
    queryFn: async () => {
      const res = await fetch("/api/store");
      if (!res.ok) throw new Error("Failed to fetch store items");
      return res.json();
    },
  });

  const vipItems = storeItems.filter((item: any) => item.category === "vip");
  const moneyItems = storeItems.filter(
    (item: any) => item.category === "money"
  );
  const vehicleItems = storeItems.filter(
    (item: any) => item.category === "vehicle"
  );

  // Pagination for VIP items
  const vipTotalPages = Math.ceil(vipItems.length / ITEMS_PER_PAGE);
  const paginatedVipItems = vipItems.slice(
    (vipPage - 1) * ITEMS_PER_PAGE,
    vipPage * ITEMS_PER_PAGE
  );

  // Pagination for money items
  const moneyTotalPages = Math.ceil(moneyItems.length / ITEMS_PER_PAGE);
  const paginatedMoneyItems = moneyItems.slice(
    (moneyPage - 1) * ITEMS_PER_PAGE,
    moneyPage * ITEMS_PER_PAGE
  );

  // Pagination for vehicle items
  const vehicleTotalPages = Math.ceil(vehicleItems.length / ITEMS_PER_PAGE);
  const paginatedVehicleItems = vehicleItems.slice(
    (vehiclePage - 1) * ITEMS_PER_PAGE,
    vehiclePage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left"
        >
          <h1 className="text-5xl font-display font-bold mb-4 text-glow">
            Server Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Enhance your experience with VIP status, in-game currency, and
            exclusive limited-edition vehicles.
          </p>
        </motion.div>

        <Button
          variant="outline"
          className="border-white/10 bg-card/30 hover:bg-primary hover:text-white hover:border-primary transition-all relative"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            0
          </span>
        </Button>
      </div>

      <Tabs defaultValue="vip" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10 p-1 mb-12 h-auto">
          <TabsTrigger
            value="vip"
            className="data-[state=active]:bg-primary data-[state=active]:text-white font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <Crown className="h-5 w-5" /> VIP Status
          </TabsTrigger>
          <TabsTrigger
            value="money"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <DollarSign className="h-5 w-5" /> In-Game Money
          </TabsTrigger>
          <TabsTrigger
            value="vehicles"
            className="data-[state=active]:bg-secondary data-[state=active]:text-black font-display uppercase tracking-wider py-4 gap-2 text-lg"
          >
            <Car className="h-5 w-5" /> Vehicles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vip">
          {vipItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No VIP packages available.
            </div>
          ) : (
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
                    className={`relative ${
                      pkg.popular ? "md:-mt-8 md:mb-8" : ""
                    }`}
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
                        pkg.popular
                          ? "shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-card/60"
                          : ""
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
                          <span className="text-4xl font-bold">
                            {pkg.price}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {metadata.period || ""}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-4 mt-4">
                          {(metadata.features || []).map(
                            (feat: string, j: number) => (
                              <li
                                key={j}
                                className="flex items-start gap-3 text-sm group"
                              >
                                <Check className="h-5 w-5 text-primary shrink-0 group-hover:scale-125 transition-transform" />
                                <span className="text-gray-300">{feat}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>

                      <CardFooter className="pb-8">
                        <Button
                          data-testid={`button-purchase-${pkg.id}`}
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
                onPageChange={setVipPage}
                className="mt-12"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="money">
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
                    Funds are automatically deposited to your character's bank
                    account within 5 minutes of purchase.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {moneyItems.length === 0 ? (
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
                          pkg.popular
                            ? "border-green-500/30 bg-green-950/10"
                            : ""
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
                    onPageChange={setMoneyPage}
                    className="mt-8"
                  />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="mb-8 relative rounded-xl overflow-hidden h-64 border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(/assets/generated_images/futuristic_sports_car_in_a_neon_garage.png)`,
              }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-4xl font-display font-bold text-white mb-2">
                Limited Edition Imports
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl">
                Exclusive vehicles with custom handling, unique liveries, and
                top-tier performance. Once they're gone, they're gone.
              </p>
            </div>
          </div>

          {vehicleItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No vehicles available.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedVehicleItems.map((car: any, i: number) => {
                const metadata = car.metadata ? JSON.parse(car.metadata) : {};
                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-card/60 to-card/30 border-white/10 hover:border-secondary/70 hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] overflow-hidden group transition-all duration-300">
                      <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-black/80 to-black/40">
                        {car.image_url ? (
                          <img
                            src={car.image_url}
                            alt={car.name}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-20 w-20 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {car.popular && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-secondary text-black font-bold px-3 py-1 shadow-lg">
                              <Star className="h-3 w-3 mr-1 inline" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        {metadata.type && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-black/80 backdrop-blur-md border border-white/20 text-white font-medium px-3 py-1">
                              {metadata.type}
                            </Badge>
                          </div>
                        )}
                        {car.stock !== -1 && car.stock < 10 && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-red-600/90 text-white font-bold px-3 py-1 animate-pulse">
                              Only {car.stock} left!
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3 pt-6">
                        <CardTitle className="text-2xl font-display uppercase tracking-wide text-white group-hover:text-secondary transition-colors">
                          {car.name}
                        </CardTitle>
                        {car.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {car.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 pb-6">
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-muted-foreground text-sm">Price</span>
                          <span className="text-2xl font-bold text-secondary">{car.price}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-6">
                        <Button
                          data-testid={`button-purchase-${car.id}`}
                          className="w-full bg-gradient-to-r from-secondary/90 to-secondary hover:from-secondary hover:to-secondary/80 text-black font-bold py-6 text-base tracking-wider shadow-lg hover:shadow-secondary/20 transition-all duration-300 group-hover:scale-[1.02]"
                          disabled={!car.available || (car.stock !== -1 && car.stock === 0)}
                        >
                          <ShoppingBag className="mr-2 h-5 w-5" />
                          {!car.available ? "Unavailable" : car.stock === 0 ? "Out of Stock" : "Purchase Vehicle"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
                })}
              </div>

              <DataPagination
                currentPage={vehiclePage}
                totalPages={vehicleTotalPages}
                onPageChange={setVehiclePage}
                className="mt-12"
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-24 bg-card/30 border border-white/5 p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-display mb-4">Secure Payments</h2>
        <p className="text-muted-foreground mb-6">
          All payments are processed securely via Stripe. We do not store your
          credit card information.
        </p>
        <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="h-8 w-12 bg-white/10 rounded" />
          <div className="h-8 w-12 bg-white/10 rounded" />
          <div className="h-8 w-12 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}
