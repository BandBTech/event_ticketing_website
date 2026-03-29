"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, X, Loader2, Eraser, TicketIcon } from "lucide-react";
import {
  useUserTransactions,
  useTransactionDetail,
} from "@/hooks/useTransactions";
import {
  Transaction,
  TransactionApiFilters,
  TransactionFilters,
  getDefaultFilters,
} from "@/types/transaction";
import { cn, formatDate } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import { FigmaButton } from "@/components/ui/figma-button";
//import { TransactionFilterSheet } from "@/components/transactions/TransactionFilterSheet";
import Image from "next/image";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { differenceInMonths, isBefore, startOfDay } from "date-fns";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // 1. Pagination State
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 2. UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const selectedId = searchParams.get("id");
  // const [dateError, setDateError] = useState<string | null>(null);

  // 3. Filter State
  const [appliedFilters, setAppliedFilters] =
    useState<TransactionFilters>(getDefaultFilters());

  // 4. Create API filters
  const apiFilters = useMemo((): TransactionApiFilters => {
    const filters: TransactionApiFilters = {};

    if (appliedFilters.start_date) {
      filters.date_from = format(appliedFilters.start_date, "yyyy-MM-dd");
    }

    if (appliedFilters.end_date) {
      filters.date_to = format(appliedFilters.end_date, "yyyy-MM-dd");
    }

    if (
      appliedFilters.payment_gateway &&
      appliedFilters.payment_gateway !== "all"
    ) {
      filters.payment_gateway = appliedFilters.payment_gateway;
    }

    return filters;
  }, [appliedFilters]);

  // 5. API Data
  const {
    data: response,
    isLoading,
    isFetching,
  } = useUserTransactions(page, 20, apiFilters, searchQuery);

  const { data: detailData, isLoading: isDetailLoading } = useTransactionDetail(
    selectedId ?? undefined,
  );

  const transactionsFromApi: Transaction[] = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  // 6. Reset pagination when filters or search change
  const prevFiltersRef = useRef(apiFilters);
  const prevSearchRef = useRef(searchQuery);

  // 7. Extract unique event titles
  // const eventList = useMemo(() => {
  //   const events = new Set<string>();
  //   allTransactions.forEach(tx => {
  //     if (tx.event?.title) {
  //       events.add(tx.event.title);
  //     }
  //   });
  //   return Array.from(events).sort();
  // }, [allTransactions]);

  useEffect(() => {
    const filtersChanged =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(apiFilters);
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

  // 8. Append new transactions
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
      setHasLoaded(true);
    }
  }, [transactionsFromApi, page, pagination, isFetching, isInitialLoad]);

  // 9. Client-side filtering for unsupported filters
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Apply status filter client-side
    if (appliedFilters.status && appliedFilters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === appliedFilters.status);
    }

    return filtered;
  }, [allTransactions, appliedFilters]);

  // 10. Loading state for initial load
  const isLoadingInitial = isLoading && page === 1 && isInitialLoad;

  // 11. Load more button logic
  const shouldShowLoadMore = useMemo(() => {
    if (appliedFilters.status && appliedFilters.status !== "all") return false;
    if (appliedFilters.end_date && !appliedFilters.start_date) return false;
    return (
      hasMore &&
      !isFetching &&
      filteredTransactions.length > 0 &&
      filteredTransactions.length < totalTransactions
    );
  }, [
    hasMore,
    isFetching,
    filteredTransactions.length,
    totalTransactions,
    appliedFilters,
  ]);

  // 12. Handlers
  const handleClearAll = () => {
    const defaultFilters = getDefaultFilters();
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
    setPage(1);
    setAllTransactions([]);
    setHasMore(true);
    setIsInitialLoad(true);
    setHasLoaded(false);
    toast.dismiss();
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleEventSearch = (eventName: string) => {
    setSearchQuery(eventName);
    setPage(1);
    setAllTransactions([]);
    setIsInitialLoad(true);
    setIsFilterOpen(false);
    setHasLoaded(false);
  };
  const handleDateChange = (
    field: "start_date" | "end_date",
    date: Date | undefined,
  ) => {
    const updated = { ...appliedFilters, [field]: date };

    if (updated.start_date && updated.end_date) {
      if (
        isBefore(startOfDay(updated.end_date), startOfDay(updated.start_date))
      ) {
        toast.error("End date cannot be before start date", {
          id: "date-error",
        });
        return;
      }

      if (differenceInMonths(updated.end_date, updated.start_date) > 3) {
        toast.error("Date range cannot exceed 3 months", { id: "date-error" });
        return;
      }
    }

    toast.dismiss("date-error");
    setAppliedFilters(updated);
  };
  // 13. Active count
  const activeCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.status !== "all") count++;
    if (appliedFilters.payment_gateway !== "all") count++;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;
    if (searchQuery) count++;
    return count;
  }, [appliedFilters, searchQuery]);

  const hasActiveFilters = useMemo(() => {
    return activeCount > 0;
  }, [activeCount]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      {!selectedId && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("setting.menu.transaction.title", "Transactions")}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {t(
              "setting.menu.transaction.subtitle",
              "Manage and view all your transactions.",
            )}
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
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3 mb-6">
              {/* Search Bar */}
              <div className="relative flex-[1.5]">
                <Search
                  className={cn(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                    isSearchFocused ? "text-blue-500" : "text-gray-400",
                  )}
                />
                <input
                  type="text"
                  placeholder={t("setting.menu.transaction.search", "Search transactions...")}
                  className="w-full h-[42px] pl-10 pr-10 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Start Date */}
             <div className="flex flex-1 gap-2">
                {/* Start Date */}
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center w-full gap-2 px-3 h-[42px] bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white hover:border-blue-300 transition-all">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className={cn("truncate", !appliedFilters.start_date && "text-gray-400")}>
                          {appliedFilters.start_date
                            ? format(appliedFilters.start_date, "MMM dd, yyyy")
                            : "Start Date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={appliedFilters.start_date}
                        onSelect={(date) => handleDateChange("start_date", date)}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

              {/* End Date */}
          <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center w-full gap-2 px-3 h-[42px] bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white hover:border-blue-300 transition-all">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className={cn("truncate", !appliedFilters.end_date && "text-gray-400")}>
                          {appliedFilters.end_date
                            ? format(appliedFilters.end_date, "MMM dd, yyyy")
                            : "End Date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={appliedFilters.end_date}
                        onSelect={(date) => handleDateChange("end_date", date)}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Clear Button */}
       {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 px-4 h-[42px] bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all font-medium text-red-600 text-sm active:scale-95"
                >
                  <Eraser className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            

              {/* Filter Button */}
              {/* <button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 bg-white border rounded-xl transition-all font-semibold shadow-sm active:scale-95",
                  activeCount > 0
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                )}
              >
                <Filter className="h-5 w-5" />
                {t("setting.menu.transaction.filter","Filters")}
                {activeCount > 0 && (
                  <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] h-5 w-5 rounded-full ml-1">
                    {activeCount}
                  </span>
                )}
              </button> */}
            </div>

            {/* Transaction List - Fixed loading condition */}
            {isLoadingInitial ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300 mb-4" />
                <p className="text-sm text-gray-500">Loading transactions...</p>
              </div>
            ) : hasLoaded && filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(
                    "setting.menu.transaction.error.notfound",
                    " No transactions found",
                  )}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters
                    ? t(
                        "setting.menu.transaction.error.tryadjust",
                        "Try adjusting your filters or search query",
                      )
                    : t(
                        "setting.menu.transaction.error.notransaction",
                        "You haven't made any transactions yet",
                      )}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t(
                      "setting.menu.transaction.button.clearall",
                      "Clear all filters",
                    )}
                  </button>
                )}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => router.push(`${pathname}?id=${tx.id}`)}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Transaction card content remains the same */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
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

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {tx.event?.title || tx.event_title}
                        </h3>

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
                          <span className="capitalize">
                            {tx.payment_method}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-lg font-black text-gray-900">
                        ${tx.price.toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                          tx.status === "completed" &&
                            "bg-green-100 text-green-700",
                          tx.status === "pending" &&
                            "bg-amber-100 text-amber-700",
                          tx.status === "failed" && "bg-red-100 text-red-700",
                          tx.status === "refunded" &&
                            "bg-gray-100 text-gray-700",
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
                      className={
                        isFetching ? "opacity-70 cursor-not-allowed" : ""
                      }
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {t(
                            "setting.menu.transaction.button.loadmore",
                            "Loading more...",
                          )}
                        </>
                      ) : (
                        <>
                          {t(
                            "setting.menu.transaction.button.load",
                            "Load More Transactions",
                          )}
                        </>
                      )}
                    </FigmaButton>
                    <p className="text-[10px] text-gray-400 mt-4">
                      {t("setting.menu.transaction.showing", "Showing")}{" "}
                      {filteredTransactions.length}{" "}
                      {t("setting.menu.transaction.of", "of")}
                      {totalTransactions}{" "}
                      {t("setting.menu.transaction.trans", "Transactions")}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* <TransactionFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={appliedFilters}
        onApply={(newFilters) => {
     setAppliedFilters(newFilters);
    setPage(1);
    setAllTransactions([]);
    setHasMore(true);
    setIsInitialLoad(true);
    setHasLoaded(false); 
    setIsFilterOpen(false);
        }}
        eventList={eventList}
        onSearchEvent={handleEventSearch}
      />*/}
    </div>
  );
}
