"use client";

import { motion } from "framer-motion";
import { Car, ShoppingBag, Star } from "lucide-react";
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

interface VehiclesTabProps {
  isLoading: boolean;
  vehicleItems: any[];
  vehiclePage: number;
  vehicleTotalPages: number;
  onPageChange: (page: number) => void;
  onPurchaseClick: (item: any) => void;
  itemsPerPage: number;
}

export function VehiclesTab({
  isLoading,
  vehicleItems,
  vehiclePage,
  vehicleTotalPages,
  onPageChange,
  onPurchaseClick,
  itemsPerPage,
}: VehiclesTabProps) {
  const paginatedVehicleItems = vehicleItems.slice(
    (vehiclePage - 1) * itemsPerPage,
    vehiclePage * itemsPerPage
  );

  return (
    <>
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
            Exclusive vehicles with custom handling, unique liveries, and top-tier performance. Once they're gone, they're gone.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner color="text-secondary" message="Loading vehicles..." />
      ) : vehicleItems.length === 0 ? (
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
                        onClick={() => onPurchaseClick(car)}
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
            onPageChange={onPageChange}
            className="mt-12"
          />
        </>
      )}
    </>
  );
}
