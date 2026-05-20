"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Search, X, Eraser, Filter, ChevronDown, History, Undo2 
} from "lucide-react";
import { useUserRefunds, useRefundDetail } from "@/hooks/useRefunds";
import { useDebouncedState } from "@/hooks/useDebounce";
import TablePagination from "@/components/ui/TablePagination";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

import { RefundDetail } from "@/components/refunds/refundDetails";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function RefundsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
    const { locale } = useLanguageStore();
    const { t } = useTranslation(locale);

  const [searchInput, debouncedSearch, setSearchInput] = useDebouncedState("", 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const selectedId = searchParams.get("id");

  
  const { data: response, isFetching } = useUserRefunds(page, limit);
  const { data: detailData, isLoading: isDetailLoading } = useRefundDetail(selectedId);

  const refunds = response?.refunds || [];
  const pagination = response?.pagination;

  const handleClearAll = () => {
    setSearchInput("");
    setDateRange(undefined);
    router.push(pathname);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <PageTitle title={t("refund.title","My Refunds" )}/>
      <div className="space-y-4 px-2 sm:px-0">
        {!selectedId && (
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">Refunds</h1>
            <p className="text-xs sm:text-sm text-gray-600">Track and manage your requests.</p>
          </div>
        )}

        <div className="glass-card rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
          {selectedId ? (
            <RefundDetail
              data={detailData}
              isLoading={isDetailLoading}
              onBack={() => router.push(pathname)}
            />
          ) : (
            <>
              {/* Toolbar */}
              {/* <div className="flex flex-col lg:flex-row gap-3 mb-6">
                <div className="relative flex-[2]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search refunds..."
                    className="w-full h-[42px] pl-10 pr-10 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-4 h-[42px] border rounded-xl bg-gray-50/50 text-sm font-medium">
                      <Filter className="h-4 w-4" />
                      Filters
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-4" align="end">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
                  </PopoverContent>
                </Popover>

                {(searchInput || dateRange) && (
                  <button onClick={handleClearAll} className="flex items-center gap-2 px-4 h-[42px] bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    <Eraser className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div> */}

              {/* List */}
              <div className="space-y-3">
                {isFetching && refunds.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : refunds.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <Undo2 className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <p>No refunds found.</p>
                  </div>
                ) : (
                  refunds.map((refund) => (
                    <div
                      key={refund.ID}
                      onClick={() => router.push(`${pathname}?id=${refund.ID}`)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <History className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {refund.RefundNumber}
                          </h3>
                          <p className="text-[10px] text-gray-400">{format(new Date(refund.CreatedAt), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between mt-2 sm:mt-0">
                        <p className="font-black text-gray-900">{refund.Currency} {(refund.Amount / 100).toFixed(2)}</p>
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", getStatusStyle(refund.Status))}>
                          {refund.Status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pagination && (
                <div className="mt-6">
                  <TablePagination
                    currentPage={page}
                    totalPages={pagination.total_pages}
                    total={pagination.total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}