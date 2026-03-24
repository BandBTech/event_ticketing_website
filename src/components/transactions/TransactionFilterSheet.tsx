"use client"

import React, { useCallback, useMemo } from "react";
import { differenceInMonths, isBefore, startOfDay } from "date-fns";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserTransactionEvents } from "@/hooks/useTransactions";

interface TransactionFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
}

export function TransactionFilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
}: TransactionFilterSheetProps) {
  const [localFilters, setLocalFilters] =
    React.useState<TransactionFilters>(filters);
  const [dateError, setDateError] = React.useState<string | null>(null);

  // Use the dedicated hook to get unique event titles
  const { data: eventList = [], isLoading: isLoadingEvents } = useUserTransactionEvents();

  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setDateError(null);
    }
  }, [open, filters]);

  const fetchEventsLocal = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      const filtered = search
        ? eventList.filter((title: string) =>
            title.toLowerCase().includes(search.toLowerCase())
          )
        : eventList;

      return filtered.map((title: string) => ({
        value: title,
        label: title,
      }));
    },
    [eventList]
  );

  const handleDateChange = (
    field: "start_date" | "end_date",
    date: Date | undefined,
  ) => {
    const updated = { ...localFilters, [field]: date };
    setDateError(null);

    if (updated.start_date && updated.end_date) {
      if (
        isBefore(startOfDay(updated.end_date), startOfDay(updated.start_date))
      ) {
        setDateError("End date cannot be before start date");
        return;
      }
      if (differenceInMonths(updated.end_date, updated.start_date) > 3) {
        setDateError("Date range cannot exceed 3 months");
        toast.error("Date range cannot exceed 3 months");
        return;
      }
    }

    setLocalFilters(updated);
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const defaultFilters = getDefaultFilters();
    setLocalFilters(defaultFilters);
    
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (localFilters.start_date) count++;
    if (localFilters.end_date) count++;
    if (localFilters.status !== "all") count++;
    if (localFilters.payment_gateway !== "all") count++;
    if (localFilters.event_title !== "all") count++;
    return count;
  }, [localFilters]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8] p-0"
      >
        <SheetHeader className="bg-white p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Filter className="h-6 w-6 text-blue-600" />
            <span>Filter Transaction</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 bg-white border-gray-200 rounded-xl cursor-pointer",
                        !localFilters.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.start_date ? (
                        format(localFilters.start_date, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.start_date}
                      onSelect={(date) => handleDateChange("start_date", date)}
                      captionLayout="dropdown"
                      fromYear={2010}
                      toYear={new Date().getFullYear()}
                      toDate={new Date()}
                      disabled={{ after: new Date() }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 bg-white border-gray-200 rounded-xl cursor-pointer",
                        !localFilters.end_date && "text-muted-foreground",
                        dateError && "text-destructive border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.end_date ? (
                        format(localFilters.end_date, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.end_date}
                      onSelect={(date) => handleDateChange("end_date", date)}
                      captionLayout="dropdown"
                      fromYear={2010}
                      toYear={new Date().getFullYear()}
                      toDate={new Date()}
                      disabled={{ after: new Date() }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-destructive">{dateError}</p>
            )}
          </div>

          {/* Payment Gateway */}
          <div className="space-y-2">
            <Label>Payment Gateway</Label>
            <Select
              value={localFilters.payment_gateway === "all" ? "" : localFilters.payment_gateway}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, payment_gateway: value || "all" }))
              }
             
            >
              <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-xl cursor-pointer">
                <SelectValue placeholder="Select Payment Gateway"
                className="text-black data-[placeholder]:text-black" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer" className="cursor-pointer">Bank Transfer</SelectItem>
                <SelectItem value="cash" className="cursor-pointer">Cash</SelectItem>
                <SelectItem value="cheque" className="cursor-pointer">Cheque</SelectItem>
                <SelectItem value="mobile_payment" className="cursor-pointer">Mobile Payment</SelectItem>
                <SelectItem value="stripe" className="cursor-pointer">Stripe</SelectItem>
                <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event - AsyncCombobox */}
          <div className="space-y-2">
            <Label>Event</Label>
            <AsyncCombobox
              queryKey={["filter", "events"]}
              value={localFilters.event_title === "all" ? "" : localFilters.event_title ?? ""}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, event_title: val || "all" }))
              }
              fetchOptions={fetchEventsLocal}
              placeholder={isLoadingEvents ? "Loading events..." : "Select Event"}
              searchPlaceholder="Search Events"
              emptyText={isLoadingEvents ? "Loading..." : "No events found"}
              className="w-full h-12 bg-white border-gray-200 rounded-xl cursor-pointer"
              debounceMs={300}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-xl cursor-pointer">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer with smaller buttons */}
        <SheetFooter className="p-4 bg-white border-t flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-10 rounded-lg font-medium text-sm border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 cursor-pointer"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleApply}
            disabled={!!dateError}
            className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-sm shadow-sm active:scale-95 cursor-pointer"
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}