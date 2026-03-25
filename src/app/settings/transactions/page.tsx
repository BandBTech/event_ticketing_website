"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Loader2,
  Eraser,
  TicketIcon,
} from "lucide-react";
import {
  useUserTransactions,
  useTransactionDetail,
} from "@/hooks/useTransactions";
import { Transaction, TransactionFilters, getDefaultFilters } from "@/types/transaction";
import { cn, formatDate } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import { FigmaButton } from "@/components/ui/figma-button";
import { TransactionFilterSheet } from "@/components/transactions/TransactionFilterSheet";
import Image from "next/image";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // 1. Pagination State
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 2. UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const selectedId = searchParams.get("id");

  // 3. Filter State
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>(getDefaultFilters());

  // 4. Create API filters based on what actually works
  const apiFilters = useMemo((): TransactionFilters => {
    const filters: TransactionFilters = getDefaultFilters();
    
    // Payment method - WORKS ALONE
    if (appliedFilters.payment_gateway && appliedFilters.payment_gateway !== "all") {
      filters.payment_gateway = appliedFilters.payment_gateway;
    }
    
    // Date from - WORKS ALONE
    if (appliedFilters.start_date) {
      filters.start_date = appliedFilters.start_date;
    }
    
    // Date to - ONLY works when combined with date_from
    if (appliedFilters.end_date && appliedFilters.start_date) {
      filters.end_date = appliedFilters.end_date;
    }
    
    // Event title / Search - ONLY works when combined with payment_method OR date_from
    if (appliedFilters.event_title && appliedFilters.event_title !== "all") {
      const hasCombinedFilter = 
        (appliedFilters.payment_gateway && appliedFilters.payment_gateway !== "all") ||
        appliedFilters.start_date;
      
      if (hasCombinedFilter) {
        filters.event_title = appliedFilters.event_title;
      }
    }
    
    return filters;
  }, [appliedFilters]);

  // 5. API Data
  const {
    data: response,
    isLoading,
    isFetching,
  } = useUserTransactions(page, 10, apiFilters);
  
  const { data: detailData, isLoading: isDetailLoading } = useTransactionDetail(
    selectedId ?? undefined,
  );

  const transactionsFromApi: Transaction[] = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  // 6. Reset pagination when filters change
  const prevFiltersRef = useRef(apiFilters);
  const prevSearchRef = useRef(searchQuery);

  useEffect(() => {
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(apiFilters);
    const searchChanged = prevSearchRef.current !== searchQuery;

    if (filtersChanged || searchChanged) {
      setPage(1);
      setAllTransactions([]);
      setHasMore(true);
      setIsInitialLoad(true);

      prevFiltersRef.current = apiFilters;
      prevSearchRef.current = searchQuery;
    }
  }, [apiFilters, searchQuery]);

  // 7. Append new transactions to the list
  useEffect(() => {
    if (transactionsFromApi.length > 0) {
      setAllTransactions((prev) => {
        if (page === 1) {
          setIsInitialLoad(false);
          return transactionsFromApi;
        } else {
          const existingIds = new Set(prev.map((tx) => tx.id));
          const newTransactions = transactionsFromApi.filter(
            (tx) => !existingIds.has(tx.id),
          );
          return [...prev, ...newTransactions];
        }
      });

      if (pagination) {
        setHasMore(pagination.has_next);
        setTotalTransactions(pagination.total);
      }
    } else if (
      page === 1 &&
      transactionsFromApi.length === 0 &&
      !isFetching &&
      isInitialLoad
    ) {
      setAllTransactions([]);
      setHasMore(false);
      setTotalTransactions(0);
      setIsInitialLoad(false);
    }
  }, [transactionsFromApi, page, pagination, isFetching, isInitialLoad]);

  // 8. Client-side filtering for unsupported filters
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;
    
    // Apply status filter client-side (API doesn't support)
    if (appliedFilters.status && appliedFilters.status !== "all") {
      filtered = filtered.filter(tx => tx.status === appliedFilters.status);
    }
    
    // Apply event filter client-side if it wasn't sent to API
    const eventFilterSentToAPI = 
      (appliedFilters.event_title && appliedFilters.event_title !== "all") &&
      ((appliedFilters.payment_gateway && appliedFilters.payment_gateway !== "all") ||
       appliedFilters.start_date);
    
    if (!eventFilterSentToAPI && appliedFilters.event_title && appliedFilters.event_title !== "all") {
      filtered = filtered.filter(tx => {
        const title = tx.event?.title || "";
        return title === appliedFilters.event_title;
      });
    }
    
    // Apply date_to client-side if it wasn't sent to API
    const dateToSentToAPI = appliedFilters.end_date && appliedFilters.start_date;
    
    if (!dateToSentToAPI && appliedFilters.end_date) {
      const endDate = new Date(appliedFilters.end_date);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate <= endDate;
      });
    }
    
    // Apply search client-side (since search is just event_title and may not be sent to API)
    if (searchQuery) {
      const searchFilterSentToAPI = 
        eventFilterSentToAPI && appliedFilters.event_title === searchQuery;
      
      if (!searchFilterSentToAPI) {
        filtered = filtered.filter(tx => {
          const title = (tx.event?.title || "").toLowerCase();
          return title.includes(searchQuery.toLowerCase());
        });
      }
    }
    
    return filtered;
  }, [allTransactions, searchQuery, appliedFilters]);

  // 9. Load more button logic
  const shouldShowLoadMore = useMemo(() => {
    // Don't show if client-side filters are active
    if (searchQuery && appliedFilters.event_title !== searchQuery) return false;
    if (appliedFilters.status && appliedFilters.status !== "all") return false;
    if (appliedFilters.end_date && !appliedFilters.start_date) return false;
    
    // Don't show if event filter is active and not sent to API
    if (appliedFilters.event_title && appliedFilters.event_title !== "all") {
      const eventFilterSentToAPI = 
        (appliedFilters.payment_gateway && appliedFilters.payment_gateway !== "all") ||
        appliedFilters.start_date;
      if (!eventFilterSentToAPI) return false;
    }
    
    return hasMore && !isFetching && filteredTransactions.length > 0 && 
           filteredTransactions.length < totalTransactions;
  }, [hasMore, isFetching, filteredTransactions.length, totalTransactions, searchQuery, appliedFilters]);

  // 10. Handlers
  const handleClearAll = () => {
    const defaultFilters = getDefaultFilters();
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
    setPage(1);
    setAllTransactions([]);
    setHasMore(true);
    setIsInitialLoad(true);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const activeCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.status !== "all") count++;
    if (appliedFilters.payment_gateway !== "all") count++;
    if (appliedFilters.event_title !== "all") count++;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;
    return count;
  }, [appliedFilters]);

  const hasActiveFilters = useMemo(() => {
    return activeCount > 0 || searchQuery !== "";
  }, [activeCount, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      {!selectedId && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Transactions
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Manage and view all your transactions.
          </p>
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        {selectedId ? (
          <TransactionDetail
            data={detailData}
            isLoading={isDetailLoading}
            onBack={() => router.push(pathname)}
          />
        ) : (
          <>
            {/* Search & Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                    isSearchFocused ? "text-blue-500" : "text-gray-400"
                  )}
                />
                <input
                  type="text"
                  placeholder="Search by event title..."
                  className={cn(
                    "w-full pl-12 pr-10 py-3 bg-gray-50/50 border rounded-xl outline-none transition-all",
                    isSearchFocused
                      ? "border-blue-500 ring-2 ring-blue-500/10"
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 bg-white border rounded-xl transition-all font-semibold shadow-sm active:scale-95",
                  activeCount > 0
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                )}
              >
                <Filter className="h-5 w-5" />
                Filters
                {activeCount > 0 && (
                  <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] h-5 w-5 rounded-full ml-1">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all font-semibold text-red-700 shadow-sm active:scale-95"
                >
                  <Eraser className="h-5 w-5 text-red-500" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            {/* Transaction List */}
            {isLoading && page === 1 && isInitialLoad ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300 mb-4" />
                <p className="text-sm text-gray-500">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search query"
                    : "You haven't made any transactions yet"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => router.push(`${pathname}?id=${tx.id}`)}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Image Section */}
                      <div className="flex-shrink-0">
                        {tx.event?.banner_image ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 ring-1 ring-gray-100 group-hover:ring-blue-200 transition-all">
                            <Image
                              src={tx.event.banner_image}
                              fill
                              alt={tx.event?.title || "Event"}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <TicketIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {tx.event?.title || tx.event_title}
                        </h3>

                        {/* Tier Badges */}
                        {tx.tiers && tx.tiers.length > 0 && (
                          <div className="flex flex-wrap gap-2 py-1">
                            {tx.tiers.map((tier) => (
                              <span
                                key={tier.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {tier.name} × {tier.quantity}
                              </span>
                            ))}
                       
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {formatDate(tx.date)} •{" "}
                          <span className="capitalize">{tx.payment_method}</span>
                        </p>
                      </div>
                    </div>

                    {/* Price and Status */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-lg font-black text-gray-900">
                        ${tx.price.toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                          tx.status === "completed" && "bg-green-100 text-green-700",
                          tx.status === "pending" && "bg-amber-100 text-amber-700",
                          tx.status === "failed" && "bg-red-100 text-red-700",
                          tx.status === "refunded" && "bg-gray-100 text-gray-700"
                        )}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {shouldShowLoadMore && (
                  <div className="flex flex-col items-center pt-8">
                    <FigmaButton
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      className={isFetching ? "opacity-70 cursor-not-allowed" : ""}
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Loading more...
                        </>
                      ) : (
                        <>Load More Transactions</>
                      )}
                    </FigmaButton>
                    <p className="text-[10px] text-gray-400 mt-4">
                      Showing {filteredTransactions.length} of {totalTransactions} Transactions
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <TransactionFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={appliedFilters}
        onApply={(newFilters) => {
          setAppliedFilters(newFilters);
          setPage(1);
          setAllTransactions([]);
          setIsFilterOpen(false);
        }}
      />
    </div>
  );
}