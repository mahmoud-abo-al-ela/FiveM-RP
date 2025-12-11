"use client";

import { StoreItemCard } from "./store";
import { DataPagination } from "@/components/ui/data-pagination";

export interface StoreItem {
  id: number;
  category: string;
  name: string;
  description: string | null;
  price: string;
  metadata: string | null;
  image_url: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  stock: number;
}

interface StoreTabContentProps {
  items: StoreItem[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (item: StoreItem) => void;
  onDelete: (item: StoreItem) => void;
  updatingItemId: number | null;
  deletingItemId: number | null;
  emptyMessage?: string;
}

export function StoreTabContent({
  items,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  updatingItemId,
  deletingItemId,
  emptyMessage = "No items yet",
}: StoreTabContentProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="space-y-4">
        {paginatedItems.map((item: StoreItem) => (
          <StoreItemCard
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            isPending={updatingItemId === item.id}
            isDeleting={deletingItemId === item.id}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-6"
        />
      )}
    </>
  );
}
