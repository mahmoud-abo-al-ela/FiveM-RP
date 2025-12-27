import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";

interface PaymentHistoryProps {
  payments: any[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PaymentHistory({ payments, currentPage, onPageChange }: PaymentHistoryProps) {
  return (
    <Card className="bg-card/30 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!payments || payments.length === 0) ? (
          <p className="text-muted-foreground text-center py-8">
            No payment history found
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {payments
                .slice((currentPage - 1) * 5, currentPage * 5)
                .map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-primary/20 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{payment.item}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {payment.method === "wallet" ? "Vodafone Cash" : payment.method}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {payment.currency === 'USD' ? '$' : ''}{payment.amount} {payment.currency !== 'USD' ? payment.currency : ''}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`
                          text-[10px] uppercase tracking-wider
                          ${payment.status === 'completed' || payment.status === 'approved' ? 'text-green-400 border-green-500/20 bg-green-500/10' : ''}
                          ${payment.status === 'pending' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : ''}
                          ${payment.status === 'failed' || payment.status === 'rejected' ? 'text-red-400 border-red-500/20 bg-red-500/10' : ''}
                        `}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {payments.length > 5 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={Math.ceil(payments.length / 5)}
                onPageChange={onPageChange}
                className="mt-6"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
