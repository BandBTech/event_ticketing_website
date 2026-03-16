import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isSameDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date, dateFormat: string = "PPP p") {
  return format(new Date(date), dateFormat)
}

export function formatEventDateTime(start: string | number | Date, end: string | number | Date) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = isSameDay(startDate, endDate);
  
  const startStr = format(startDate, "dd MMM yyyy, hh:mm a");
  const endStr = sameDay 
    ? format(endDate, "hh:mm a") 
    : format(endDate, "dd MMM yyyy, hh:mm a");

  return {
    isSameDay: sameDay,
    start: startStr,
    end: endStr,
    full: `${startStr} - ${endStr}`
  };
}
