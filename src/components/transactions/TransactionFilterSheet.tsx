"use client"

import React, { useCallback, useState } from "react";
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

interface TransactionFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
  eventList: string[];
  onSearchEvent: (eventName: string) => void;
}

export function TransactionFilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  eventList,
  onSearchEvent,
}: TransactionFilterSheetProps) {
  const [localFilters, setLocalFilters] =
    useState<TransactionFilters>(filters);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setDateError(null);
      setSelectedEvent("");
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
    if (selectedEvent) {
      onSearchEvent(selectedEvent);
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    const defaultFilters = getDefaultFilters();
    setLocalFilters(defaultFilters);
    setSelectedEvent("");
    setDateError(null);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (localFilters.start_date) count++;
    if (localFilters.end_date) count++;
    if (localFilters.status !== "all") count++;
    if (localFilters.payment_gateway !== "all") count++;
    if (selectedEvent) count++;
    return count;
  }, [localFilters, selectedEvent]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8] p-0"
      >
        <SheetHeader className="bg-white px-6 py-5 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filter Transactions</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-700 font-normal">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 bg-white border-gray-200 rounded-lg text-sm",
                        !localFilters.start_date && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-700" />
                      {localFilters.start_date ? (
                        format(localFilters.start_date, "MMM dd, yyyy")
                      ) : (
                        <span className="text-gray-700">Pick a date</span>
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

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-700 font-normal">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 bg-white border-gray-200 rounded-lg text-sm",
                        !localFilters.end_date && "text-gray-400",
                        dateError && "border-red-500 text-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                      {localFilters.end_date ? (
                        format(localFilters.end_date, "MMM dd, yyyy")
                      ) : (
                        <span className="text-gray-700">Pick a date</span>
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
              <p className="text-xs text-red-500 mt-1">{dateError}</p>
            )}
          </div>

          {/* Payment Gateway */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Payment Gateway</Label>
            <Select
              value={localFilters.payment_gateway === "all" ? "" : localFilters.payment_gateway}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, payment_gateway: value || "all" }))
              }
            >
              <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Select payment gateway" className="text-gray-700" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event - AsyncCombobox */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Event</Label>
            <AsyncCombobox
              queryKey={["filter", "events"]}
              value={selectedEvent}
              onValueChange={(val) => {
                setSelectedEvent(val || "");
              }}
              fetchOptions={fetchEventsLocal}
              placeholder="Search or select an event..."
              searchPlaceholder="Type to search events..."
              emptyText="No events found"
              className="w-full h-10 bg-white border-gray-200 rounded-lg text-sm"
              debounceMs={300}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Select status" className="text-gray-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 bg-white border-t flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-10 rounded-lg font-medium border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleApply}
            disabled={!!dateError}
            className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-white shadow-sm text-sm"
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