"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Loader2,
  Eraser,
  TicketIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
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
import Image from "next/image";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { differenceInMonths, isBefore, startOfDay, format } from "date-fns";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/useDebounce";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);


  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<TransactionFilters>(getDefaultFilters());

  const selectedId = searchParams.get("id");



  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      console.log("API will be called with:", value); // Debug log
      setDebouncedSearch(value);
      setPage(1);
      setAllTransactions([]);
      setIsInitialLoad(true);
    }, 500);
  };

   useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
    setAllTransactions([]);
    setIsInitialLoad(true);
  };

  // 1. API Filters (Date only as requested)
  const apiFilters = useMemo((): TransactionApiFilters => {
    const filters: TransactionApiFilters = {};
    if (appliedFilters.start_date)
      filters.date_from = format(appliedFilters.start_date, "yyyy-MM-dd");
    if (appliedFilters.end_date)
      filters.date_to = format(appliedFilters.end_date, "yyyy-MM-dd");
    return filters;
  }, [appliedFilters.start_date, appliedFilters.end_date]);

  // 2. Fetch Data - Uses debouncedSearch state, NOT searchInput
  const {
    data: response,
    isLoading,
    isFetching,
  } = useUserTransactions(page, 20, apiFilters, debouncedSearch);

  const { data: detailData, isLoading: isDetailLoading } = useTransactionDetail(
    selectedId ?? undefined,
  );
  
  // Show loading while typing (debounce in progress)
  const isSearching = searchInput !== debouncedSearch && searchInput !== "";
  const showLoading = (isLoading && page === 1 && isInitialLoad) || isSearching;

  const transactionsFromApi: Transaction[] = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  // 3. Reset logic when API dependencies change
  const prevFiltersRef = useRef(apiFilters);
  const prevSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    const filtersChanged =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(apiFilters);
    const searchChanged = prevSearchRef.current !== debouncedSearch;

    if (filtersChanged || searchChanged) {
      setPage(1);
      setAllTransactions([]);
      setHasMore(true);
      setIsInitialLoad(true);
      prevFiltersRef.current = apiFilters;
      prevSearchRef.current = debouncedSearch;
    }
  }, [apiFilters, debouncedSearch]);

  // 4. Accumulate Results
  useEffect(() => {
    if (transactionsFromApi.length > 0) {
      setAllTransactions((prev) => {
        if (page === 1) return transactionsFromApi;
        const existingIds = new Set(prev.map((tx) => tx.id));
        const uniqueNewTransactions = transactionsFromApi.filter(
          (tx) => !existingIds.has(tx.id)
        );
        return [...prev, ...uniqueNewTransactions];
      });
      if (pagination) {
        setHasMore(pagination.has_next);
        setTotalTransactions(pagination.total);
      }
      setIsInitialLoad(false);
      setHasLoaded(true);
    } else if (page === 1 && !isFetching) {
      setAllTransactions([]);
      setHasMore(false);
      setIsInitialLoad(false);
      setHasLoaded(true);
    }
  }, [transactionsFromApi, page, pagination, isFetching]);

  // 5. Handlers
  const handleClearAll = () => {
    setAppliedFilters(getDefaultFilters());
    handleClearSearch();
    toast.dismiss();
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore && !isSearching) setPage((prev) => prev + 1);
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
        toast.error("End date cannot be before start date");
        return;
      }
      if (differenceInMonths(updated.end_date, updated.start_date) > 3) {
        toast.error("Range cannot exceed 3 months");
        return;
      }
    }
    setAppliedFilters(updated);
  };

  const hasActiveFilters =
    searchInput !== "" ||
    !!appliedFilters.start_date ||
    !!appliedFilters.end_date;

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {!selectedId && (
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
            {t("setting.menu.transaction.title", "Transactions")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {t(
              "setting.menu.transaction.subtitle",
              "Manage and view all your transactions.",
            )}
          </p>
        </div>
      )}
      <div className="glass-card rounded-xl p-6">
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
                  placeholder={t(
                    "setting.menu.transaction.search",
                    "Search transactions...",
                  )}
                  className="w-full h-[42px] pl-10 pr-10 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {/* Show loader OR clear button, not both */}
                {isSearching ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : searchInput ? (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Start Date */}
              <div className="flex flex-1 gap-2">
                {/* Start Date */}
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center w-full gap-2 px-3 h-[42px] bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white hover:border-blue-300 transition-all">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span
                          className={cn(
                            "truncate",
                            !appliedFilters.start_date && "text-gray-400",
                          )}
                        >
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
                        onSelect={(date) =>
                          handleDateChange("start_date", date)
                        }
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
                        <span
                          className={cn(
                            "truncate",
                            !appliedFilters.end_date && "text-gray-400",
                          )}
                        >
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
            </div>

            {/* LIST SECTION */}
            {showLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
                {isSearching && (
                  <p className="text-sm text-gray-400 mt-2">Searching...</p>
                )}
              </div>
            ) : hasLoaded && allTransactions.length === 0 ? (
              <div className="text-center py-20 px-4">
                <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 font-semibold">
                  No transactions found
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 text-sm mt-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => router.push(`${pathname}?id=${tx.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {tx.event?.banner_image ? (
                          <Image
                            src={tx.event.banner_image}
                            fill
                            alt="Event"
                            className="object-cover"
                          />
                        ) : (
                          <TicketIcon className="w-full h-full p-2 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-700 truncate">
                          {tx.event?.title || tx.event.title}
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
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {formatDate(tx.date)} •{" "}
                          <span className="capitalize">
                            {tx.payment_method}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 pt-2 sm:pt-0 border-gray-50">
                      <p className="text-base sm:text-lg font-black text-gray-900">
                        ${tx.price?.toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                          tx.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
                {hasMore && !isFetching && !isSearching && (
                  <div className="flex justify-center pt-6">
                    <FigmaButton
                      onClick={handleLoadMore}
                      className="w-full sm:w-auto"
                    >
                      Load More
                    </FigmaButton>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}