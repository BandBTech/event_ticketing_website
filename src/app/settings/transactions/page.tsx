"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Receipt,
  TrendingDown,
  Loader2, // For a nice spinner
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/types/transaction";

export default function BillingPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"transactions" | "invoices">("transactions");
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const { data: response, isLoading, isFetching } = useUserTransactions(page);
  const pagination = response?.data?.pagination;

  useEffect(() => {
    if (response?.data?.transactions) {
      setAllTransactions((prev) => {
        if (page === 1) return response.data.transactions;
        const existingIds = new Set(prev.map((tx) => tx.id));
        const newUnique = response.data.transactions.filter(
          (tx) => !existingIds.has(tx.id)
        );
        return [...prev, ...newUnique];
      });
    }
  }, [response, page]);

  const handleLoadMore = () => {
    if (pagination?.has_next) {
      setPage((prev) => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800 border-none";
      case "pending": return "bg-yellow-100 text-yellow-800 border-none";
      case "failed": return "bg-red-100 text-red-800 border-none";
      default: return "bg-gray-100 text-gray-800 border-none";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t('billing.title', 'Billing & Payments')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('billing.description', 'Manage your payment methods and view transaction history')}
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 border bg-white/50 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {(["transactions", "invoices"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize font-medium transition-colors cursor-pointer text-sm ${
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`billing.tabs.${tab}`, tab)}
              </button>
            ))}
          </div>

          {/* Initial Loading Skeleton */}
          {isLoading && allTransactions.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "transactions" && (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    {t('billing.history', 'Transaction History')}
                  </h2>


                  {allTransactions.map((tx) => (
                    <Card key={tx.id} className="hover:bg-accent/50 transition-colors border-none bg-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${tx.price > 0 ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{tx.event_title}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(tx.date), "MMM dd, yyyy • hh:mm a")}
                                <span className="capitalize"> • {tx.payment_method}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                {tx.invoice.currency} {tx.invoice.total_amount.toLocaleString()}
                              </div>
                              <Badge variant="secondary" className={getStatusColor(tx.status)}>
                                {tx.status}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}


                  {pagination?.has_next && (
                    <div className="text-center py-4">
                      <Button
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        className="min-w-[160px] rounded-full shadow-sm"
                      >
                        {isFetching ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('common.loading', 'Loading...')}
                          </span>
                        ) : (
                          t('transaction.loadMore', 'Load More')
                        )}
                      </Button>

                      <p className="text-gray-500 text-xs mt-4">
                        {t('billing.showingCount', `Showing ${allTransactions.length} of ${pagination.total} transactions`)}
                      </p>
                    </div>
                  )}

                  {!pagination?.has_next && allTransactions.length > 0 && (
                    <p className="text-center text-gray-400 text-xs py-4 italic">
                      {t('billing.endOfList', 'You have reached the end of your history')}
                    </p>
                  )}
                </>
              )}

              {activeTab === "invoices" && (
                <div className="text-center py-10 text-muted-foreground">
                  Invoices functionality coming soon.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}