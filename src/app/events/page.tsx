"use client";

import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { DataPagination } from "@/components/ui/data-pagination";
import { EventsHero } from "@/components/events/EventsHero";
import { EventsSearch } from "@/components/events/EventsSearch";
import { EventCard } from "@/components/events/EventCard";

const ITEMS_PER_PAGE = 9;

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <EventsHero />

        <EventsSearch searchQuery={searchQuery} onSearchChange={handleSearchChange} />

        {isLoading ? (
          <LoadingSpinner message="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <Card className="bg-card/30 border-white/5 p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event: any, i: number) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-12"
            />
          </>
        )}
      </div>
    </div>
  );
}
