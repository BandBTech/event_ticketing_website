"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useDebounce } from "@/hooks/useDebounce";


export interface AsyncComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AsyncComboboxProps {
  value?: string;
  onValueChange?: (value: string, label?: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  /** Unique query key for React Query caching */
  queryKey: string[];
  /** Function to fetch options based on search term */
  fetchOptions: (search: string) => Promise<AsyncComboboxOption[]>;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Cache time in ms (default 5 minutes) */
  staleTime?: number;
  /** Currently selected option label (for display when value is set) */
  selectedLabel?: string;
  disabled?: boolean;
  defaultOption?: AsyncComboboxOption;
}

export function AsyncCombobox({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  queryKey,
  fetchOptions,
  debounceMs = 300,
  staleTime = 5 * 60 * 1000,
  selectedLabel,
  defaultOption,
  disabled,
  ...props
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const debouncedSearch = useDebounce(searchTerm, debounceMs);

  const {
    data: options = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: () => fetchOptions(debouncedSearch),
    staleTime,
    gcTime: staleTime * 2,
    enabled: open,
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // Merge defaultOption into the options list so it's always available
  const mergedOptions = React.useMemo(() => {
    if (!defaultOption) return options;
    const exists = options.some((o) => o.value === defaultOption.value);
    return exists ? options : [defaultOption, ...options];
  }, [options, defaultOption]);

  const displayLabel = React.useMemo(() => {
    if (!value || value === "all") return placeholder;
    const option = mergedOptions.find((opt) => opt.value === value);
    if (option) return option.label;
    if (selectedLabel) return selectedLabel;
    if (defaultOption?.value === value) return defaultOption.label;
    return placeholder;
  }, [value, mergedOptions, placeholder, selectedLabel, defaultOption]);

  // Show loading in list when initially loading OR when refetching with no cached data
  const showListLoading =
    isLoading || (isFetching && mergedOptions.length === 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-8 w-full cursor-pointer text-xs font-normal gap-1.5 pl-2! pr-1! shadow-xs overflow-hidden",
            className,
          )}
        >
          <span className="truncate flex-1 text-left">{displayLabel}</span>
          {isFetching && showListLoading ? (
            <Loader2 className="h-3 w-3 animate-spin opacity-50 shrink-0" />
          ) : (
            <ChevronDown className="opacity-50 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {showListLoading || isFetching ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : mergedOptions.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {mergedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "cursor-pointer w-full",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                    onSelect={(currentValue) => {
                      if (option.disabled) {
                        return;
                      }

                      const selectedOption = mergedOptions.find(
                        (o) => o.value === currentValue,
                      );
                      onValueChange?.(
                        currentValue === value ? "" : currentValue,
                        selectedOption?.label,
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}

                    {option.disabled && (
                      <span className="ml-auto text-xs text-muted-foreground italic">
                        Already added
                      </span>
                    )}

                    {!option.disabled && (
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}