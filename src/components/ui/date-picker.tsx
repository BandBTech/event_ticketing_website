"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  id?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  id,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-11 bg-white/70 border-gray-200 hover:bg-white/90 hover:border-blue-400 transition-colors",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon size={16} weight="duotone" className="mr-2" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
