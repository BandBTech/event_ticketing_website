"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  DollarSign,
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar as CalendarIcon,
  Loader2,
  Check,
  Eraser,
} from "lucide-react";
import {
  useUserTransactions,
  useTransactionDetail,
} from "@/hooks/useTransactions";
import { Transaction } from "@/types/transaction";
import { cn, formatDate } from "@/lib/utils";
import { isBefore, startOfDay, differenceInMonths, parseISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FigmaButton } from "@/components/ui/figma-button";

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
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [eventSearchInput, setEventSearchInput] = useState("");
  const selectedId = searchParams.get("id");

  // 3. Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [tempFilters, setTempFilters] = useState({
    status: "all",
    payment_gateway: "all",
    event_title: "all",
    start_date: "",
    end_date: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(tempFilters);
  const [dateError, setDateError] = useState("");

  // 4. API Data
  const { data: response, isLoading, isFetching } = useUserTransactions(page);
  const { data: detailData, isLoading: isDetailLoading } = useTransactionDetail(
    selectedId ?? undefined,
  );
  
  const transactionsFromApi: Transaction[] = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  // 5. Reset pagination when filters change 
  const prevFiltersRef = useRef(appliedFilters);
  const prevSearchRef = useRef(searchQuery);
  
  useEffect(() => {
 
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(appliedFilters);
    const searchChanged = prevSearchRef.current !== searchQuery;
    
    if (filtersChanged || searchChanged) {
     
      setPage(1);
      setAllTransactions([]);
      setHasMore(true);
      setIsInitialLoad(true);

      prevFiltersRef.current = appliedFilters;
      prevSearchRef.current = searchQuery;
    }
  }, [appliedFilters, searchQuery]);

  // 6. Append new transactions to the list
  useEffect(() => {
    if (transactionsFromApi.length > 0) {
      setAllTransactions((prev) => {
        if (page === 1) {
          
          setIsInitialLoad(false);
          return transactionsFromApi;
        } else {
          // Avoid duplicates
          const existingIds = new Set(prev.map((tx) => tx.id));
          const newTransactions = transactionsFromApi.filter(
            (tx) => !existingIds.has(tx.id)
          );
         
          return [...prev, ...newTransactions];
        }
      });
      
      if (pagination) {
        setHasMore(pagination.has_next);
        setTotalTransactions(pagination.total);
      }
    } else if (page === 1 && transactionsFromApi.length === 0 && !isFetching && isInitialLoad) {
      setAllTransactions([]);
      setHasMore(false);
      setTotalTransactions(0);
      setIsInitialLoad(false);
    }
  }, [transactionsFromApi, page, pagination, isFetching, isInitialLoad]);

  // 7. Get unique events from all transactions
  const allEventList = useMemo(() => {
    const events = Array.from(
      new Set(allTransactions.map((t) => t.event_title))
    ).sort();
    return events;
  }, [allTransactions]);

  // 8. Filtered event list based on search input
  const filteredEventList = useMemo(() => {
    if (!eventSearchInput.trim()) return allEventList;
    return allEventList.filter((title) =>
      title.toLowerCase().includes(eventSearchInput.toLowerCase())
    );
  }, [allEventList, eventSearchInput]);

  // 9. Filtering Logic
  const filteredTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];
    
    const filtered = allTransactions.filter((tx) => {
      // Title Search
      const matchesSearch = searchQuery === "" || 
        tx.event_title.toLowerCase().includes(searchQuery.toLowerCase());

      // Status logic
      const matchesStatus =
        appliedFilters.status === "all" ||
        tx.status.toLowerCase() === appliedFilters.status.toLowerCase();

      // Gateway logic
      const matchesGateway =
        appliedFilters.payment_gateway === "all" ||
        (tx.payment_method && 
         tx.payment_method.toLowerCase() === appliedFilters.payment_gateway.toLowerCase());

      // Event logic
      const matchesEvent =
        appliedFilters.event_title === "all" ||
        tx.event_title === appliedFilters.event_title;

      // Date Range logic
      let matchesDate = true;
      if (appliedFilters.start_date || appliedFilters.end_date) {
        const txDate = new Date(tx.date);
        txDate.setHours(0, 0, 0, 0);
        
        if (appliedFilters.start_date) {
          const startDate = new Date(appliedFilters.start_date);
          startDate.setHours(0, 0, 0, 0);
          if (txDate < startDate) matchesDate = false;
        }
        
        if (appliedFilters.end_date && matchesDate) {
          const endDate = new Date(appliedFilters.end_date);
          endDate.setHours(23, 59, 59, 999);
          if (txDate > endDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesGateway && matchesEvent && matchesDate;
    });
    
    return filtered;
  }, [allTransactions, searchQuery, appliedFilters]);

  // 10. Calculate if we should show load more button
  const shouldShowLoadMore = useMemo(() => {
    if (!hasMore) return false;
    if (filteredTransactions.length === 0) return false;
    if (allTransactions.length >= totalTransactions && totalTransactions > 0) {
      return false;
    }
    
    return true;
  }, [hasMore, filteredTransactions.length, allTransactions.length, totalTransactions]);

  // 11. Date Validation Logic
  const handleDateChange = (
    field: "start_date" | "end_date",
    value: string,
  ) => {
    const updated = { ...tempFilters, [field]: value };
    setDateError("");

    if (updated.start_date && updated.end_date) {
      const start = parseISO(updated.start_date);
      const end = parseISO(updated.end_date);

      if (isBefore(startOfDay(end), startOfDay(start))) {
        setDateError("End date cannot be before start date");
      } else if (differenceInMonths(end, start) >= 3) {
        setDateError("Date range cannot exceed 3 months");
      }
    }
    setTempFilters(updated);
  };

  // 12. Handlers
  const handleApply = () => {
    if (dateError) return;
    setAppliedFilters(tempFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const reset = {
      status: "all",
      payment_gateway: "all",
      event_title: "all",
      start_date: "",
      end_date: "",
    };

    setTempFilters(reset);
    setAppliedFilters(reset);
    setDateError("");
    setSearchQuery("");
  };

  const handleClearAll = () => {
    const reset = {
      status: "all",
      payment_gateway: "all",
      event_title: "all",
      start_date: "",
      end_date: "",
    };
  
    setTempFilters(reset);
    setAppliedFilters(reset);
    setDateError("");
    setSearchQuery("");
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

  // Check if any filters are active (including search)
  const hasActiveFilters = useMemo(() => {
    return activeCount > 0 || searchQuery !== "";
  }, [activeCount, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      {!selectedId && (<>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          Transactions
        </h1>
            <p className="text-sm text-gray-600 mb-6">
          Manage and view all your transactions.
        </p>
        </>
      )}

      <div className="bg-white  rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        {selectedId ? (
          <TransactionDetail
            data={detailData}
            isLoading={isDetailLoading}
            onBack={() => router.push(pathname)}
          />
        ) : (
          <>
            {/* Main Search & Filter Toggle */}
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event title..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-sm active:scale-95"
              >
                <Filter className="h-5 w-5 text-gray-500" />
                Filters
                {activeCount > 0 && (
                  <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] h-5 w-5 rounded-full ml-1">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Clear Filters Button - Only shows when filters are active */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all font-semibold text-red-700 shadow-sm active:scale-95"
                >
                  <Eraser className="h-5 w-5 text-red-500" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Transaction List */}
            {isLoading && page === 1 && isInitialLoad ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-6">Transaction History</p>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => router.push(`${pathname}?id=${tx.id}`)}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {tx.event_title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(tx.date)} •{" "}
                          <span className="capitalize">
                            {tx.payment_method}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">
                        ${tx.price.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredTransactions.length === 0 && !isFetching && allTransactions.length > 0 && (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl text-gray-400">
                    No transactions found matching your filters.
                  </div>
                )}

                {filteredTransactions.length === 0 && !isFetching && allTransactions.length === 0 && !isInitialLoad && (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl text-gray-400">
                    No transactions found.
                  </div>
                )}

                {/* Load More Button - Now shows only when there are actually more transactions to load */}
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
                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-black">
                      Showing {filteredTransactions.length} of {totalTransactions} Transactions
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* FILTER PANEL - Same as before */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsFilterOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-[#f5f7f8] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Filter className="h-6 w-6 text-blue-600" />
            <span>Filter Transaction</span>
          </div>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Date Range Section */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Start Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={tempFilters.start_date}
                    onChange={(e) =>
                      handleDateChange("start_date", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500">
                  End Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    className={`w-full pl-10 pr-3 py-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${dateError ? "border-red-500" : "border-gray-200"}`}
                    value={tempFilters.end_date}
                    onChange={(e) =>
                      handleDateChange("end_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            {dateError && (
              <p className="text-[11px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                {dateError}
              </p>
            )}
          </div>

          {/* Payment Gateway Select */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
              Payment Gateway
            </label>
            <Popover open={isGatewayOpen} onOpenChange={setIsGatewayOpen}>
              <PopoverTrigger asChild>
                <button className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm shadow-sm hover:border-blue-400 transition-all outline-none">
                  <span className={cn("capitalize", tempFilters.payment_gateway === "all" ? "text-gray-400" : "text-gray-900 font-medium")}>
                    {tempFilters.payment_gateway === "all" ? "Select Gateway" : tempFilters.payment_gateway.replace('_', ' ')}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isGatewayOpen && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden w-[var(--radix-popover-trigger-width)]" align="start">
                <Command>
                  <CommandInput placeholder="Search gateway..." className="h-11" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {["all", "stripe", "khalti", "cash", "bank_transfer"].map((opt) => (
                        <CommandItem
                          key={opt}
                          onSelect={() => {
                            setTempFilters({ ...tempFilters, payment_gateway: opt });
                            setIsGatewayOpen(false);
                          }}
                          className="py-3 cursor-pointer capitalize"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{opt === "all" ? "All Gateways" : opt.replace('_', ' ')}</span>
                            {tempFilters.payment_gateway === opt && <Check className="h-4 w-4 text-blue-600" />}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Searchable Event Bar */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
              Event
            </label>
            <Popover
              open={isEventDropdownOpen}
              onOpenChange={setIsEventDropdownOpen}
            >
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm shadow-sm hover:border-blue-400 transition-all"
                >
                  <span
                    className={
                      tempFilters.event_title === "all"
                        ? "text-gray-400"
                        : "text-gray-900"
                    }
                  >
                    {tempFilters.event_title === "all"
                      ? "Select Event"
                      : tempFilters.event_title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-gray-400 transition-transform",
                      isEventDropdownOpen && "rotate-180 text-blue-500",
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden">
                <Command>
                  <CommandInput
                    placeholder="Type event name..."
                    className="h-12"
                    value={eventSearchInput}
                    onValueChange={setEventSearchInput}
                  />
                  <CommandList className="max-h-60 custom-scrollbar">
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setTempFilters({
                            ...tempFilters,
                            event_title: "all",
                          });
                          setIsEventDropdownOpen(false);
                          setEventSearchInput("");
                        }}
                        className="py-3 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>All Events</span>
                          {tempFilters.event_title === "all" && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </CommandItem>
                      {filteredEventList.map((title) => (
                        <CommandItem
                          key={title}
                          onSelect={() => {
                            setTempFilters({
                              ...tempFilters,
                              event_title: title,
                            });
                            setIsEventDropdownOpen(false);
                            setEventSearchInput("");
                          }}
                          className="py-3 cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{title}</span>
                            {tempFilters.event_title === title && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
              Status
            </label>
            <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
              <PopoverTrigger asChild>
                <button className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm shadow-sm hover:border-blue-400 transition-all outline-none">
                  <span className={cn("capitalize", tempFilters.status === "all" ? "text-gray-400" : "text-gray-900 font-medium")}>
                    {tempFilters.status === "all" ? "Select Status" : tempFilters.status}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isStatusOpen && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden w-[var(--radix-popover-trigger-width)]" align="start">
                <Command>
                  <CommandInput placeholder="Search status..." className="h-11" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {["all", "completed", "pending", "failed"].map((opt) => (
                        <CommandItem
                          key={opt}
                          onSelect={() => {
                            setTempFilters({ ...tempFilters, status: opt });
                            setIsStatusOpen(false);
                          }}
                          className="py-3 cursor-pointer capitalize"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{opt === "all" ? "All Status" : opt}</span>
                            {tempFilters.status === opt && <Check className="h-4 w-4 text-blue-600" />}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-6 bg-white border-t grid grid-cols-2 gap-4">
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            <X className="h-5 w-5" /> Clear
          </button>
          <button
            onClick={handleApply}
            disabled={!!dateError}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Filter className="h-5 w-5" /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}