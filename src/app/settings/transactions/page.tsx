"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Loader2,
  Eraser,
  TicketIcon,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
  CalendarRange,
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
import { DateRange } from "react-day-picker";
import {
  differenceInMonths,
  isBefore,
  startOfDay,
  format,
  subMonths,
} from "date-fns";
import { toast } from "sonner";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // State
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<TransactionFilters>(getDefaultFilters());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const selectedId = searchParams.get("id");

  // Update date range when filters change
  useEffect(() => {
    setDateRange({
      from: appliedFilters.start_date,
      to: appliedFilters.end_date,
    });
  }, [appliedFilters.start_date, appliedFilters.end_date]);

  // API Filters
  const apiFilters = useMemo((): TransactionApiFilters => {
    const filters: TransactionApiFilters = {};
    if (appliedFilters.start_date)
      filters.date_from = format(appliedFilters.start_date, "yyyy-MM-dd");
    if (appliedFilters.end_date)
      filters.date_to = format(appliedFilters.end_date, "yyyy-MM-dd");
    return filters;
  }, [appliedFilters.start_date, appliedFilters.end_date]);

  // Fetch Data
  const {
    data: response,
    isLoading,
    isFetching,
  } = useUserTransactions(page, 20, apiFilters, searchInput);

  const { data: detailData, isLoading: isDetailLoading } = useTransactionDetail(
    selectedId ?? undefined,
  );

  // Reset pagination when search or filters change
  useEffect(() => {
    setPage(1);
    setAllTransactions([]);
  }, [searchInput, apiFilters.date_from, apiFilters.date_to]);

  // Accumulate Results
  useEffect(() => {
    const transactions = response?.data?.transactions || [];
    const pagination = response?.data?.pagination;

    if (transactions.length > 0) {
      setAllTransactions((prev) => {
        if (page === 1) return transactions;
        const existingIds = new Set(prev.map((tx) => tx.id));
        const newTransactions = transactions.filter(
          (tx) => !existingIds.has(tx.id),
        );
        return [...prev, ...newTransactions];
      });
      if (pagination) {
        setHasMore(pagination.has_next);
      }
    } else if (page === 1 && !isFetching) {
      setAllTransactions([]);
      setHasMore(false);
    }
  }, [
    response?.data?.transactions,
    page,
    isFetching,
    response?.data?.pagination,
  ]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setPage(1);
    setAllTransactions([]);
  };

  const handleClearAll = () => {
    setAppliedFilters(getDefaultFilters());
    setDateRange({ from: undefined, to: undefined });
    handleClearSearch();
    toast.dismiss();
    setIsFilterOpen(false);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDateRangeApply = () => {
    if (dateRange?.from && dateRange?.to) {
      if (isBefore(startOfDay(dateRange.to), startOfDay(dateRange.from))) {
        toast.error("End date cannot be before start date");
        return;
      }
      if (differenceInMonths(dateRange.to, dateRange.from) > 3) {
        toast.error("Range cannot exceed 3 months");
        return;
      }
    }

    setAppliedFilters({
      ...appliedFilters,
      start_date: dateRange?.from,
      end_date: dateRange?.to,
    });
    setPage(1);
    setAllTransactions([]);
    setIsFilterOpen(false);
    toast.success("Filters applied");
  };

  const handleDateRangeClear = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleQuickRange = (months: number) => {
    const to = new Date();
    const from = subMonths(to, months);
    setDateRange({ from, to });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchInput) count++;
    if (appliedFilters.start_date || appliedFilters.end_date) count++;
    return count;
  };

  const showLoading = isLoading && page === 1;
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
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-3 mb-6">
              {/* Search Bar */}
              <div className="relative flex-[2]">
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

                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "relative flex items-center gap-2 px-4 h-[42px] border rounded-xl transition-all whitespace-nowrap",
                      hasActiveFilters
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-300",
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filters</span>
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[95vw] sm:w-[500px] p-0"
                  align="end"
                  sideOffset={5}
                >
                  <div className="p-3 sm:p-4 border-b">
                    <h3 className="font-semibold text-gray-900">
                      Filter Transactions
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select date range to filter transactions
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 max-h-[80vh] overflow-y-auto">
                    {/* Quick Range Buttons */}
                    {/* <div className="grid grid-cols-3 gap-2 mb-4">
                      <button
                        onClick={() => handleQuickRange(1)}
                        className="px-2 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        30 days
                      </button>
                      <button
                        onClick={() => handleQuickRange(3)}
                        className="px-2 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        3 months
                      </button>
              
                    </div> */}

                    {/* Date Range Calendar - Responsive */}
                    <div className="border rounded-lg sm:p-3">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        disabled={{ after: new Date() }}
                        // Force the internal rdp wrapper to be full width
                        className="rounded-md w-full [&_.rdp]:w-full"
                        classNames={{
                          months: "w-full",
                          month: "space-y-4 w-full",
                          // 1. Position relative so the nav can pin to its edges
                          caption:
                            "flex justify-center pt-1 relative items-center w-full",
                          caption_label: "text-sm font-medium",

                          nav: "flex items-center justify-between absolute inset-x-0 z-10 px-1",
                          nav_button:
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "",
                          nav_button_next: "",

                          table: "w-full border-collapse",
                          head_row: "flex w-full",

                          head_cell:
                            "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm flex-1 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",

                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 mx-auto flex items-center justify-center",
                          day_range_end: "day-range-end",
                          day_selected:
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle:
                            "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>

                    {/* Selected Range Display */}
                    {(dateRange?.from || dateRange?.to) && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Selected range:</span>
                          <button
                            onClick={handleDateRangeClear}
                            className="text-red-500 hover:text-red-600 text-xs"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-900">
                          <CalendarRange className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {dateRange?.from
                              ? format(dateRange.from, "MMM dd, yyyy")
                              : "Start"}{" "}
                            -{" "}
                            {dateRange?.to
                              ? format(dateRange.to, "MMM dd, yyyy")
                              : "End"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 border-t bg-gray-50">
                    <button
                      onClick={handleDateRangeClear}
                      className="order-2 sm:order-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleDateRangeApply}
                      className="order-1 sm:order-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear All Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 px-4 h-[42px] bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all font-medium text-red-600 text-sm active:scale-95"
                >
                  <Eraser className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                {searchInput && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                    <span className="max-w-[150px] sm:max-w-none truncate">
                      Search: &quot;{searchInput}&quot;
                    </span>
                    <button
                      onClick={handleClearSearch}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(appliedFilters.start_date || appliedFilters.end_date) && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                    <CalendarRange className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {appliedFilters.start_date &&
                        format(appliedFilters.start_date, "MMM dd, yyyy")}
                      {appliedFilters.start_date &&
                        appliedFilters.end_date &&
                        " - "}
                      {appliedFilters.end_date &&
                        format(appliedFilters.end_date, "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Results Section */}
            {showLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="text-center py-20 px-4">
                <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 font-semibold">
                  No transactions found
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 text-sm mt-2 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
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
                            {tx.event?.title}
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
                </div>

                {hasMore && !isFetching && (
                  <div className="flex justify-center pt-6">
                    <FigmaButton
                      onClick={handleLoadMore}
                      className="w-full sm:w-auto"
                    >
                      Load More
                    </FigmaButton>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
