"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDots, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FigmaButton } from "@/components/ui/figma-button";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@phosphor-icons/react";

interface EventCardProps {
  event: Event;
  className?: string;
}
const getEventStatusStyles = (status: string) => {
  const s = status?.toLowerCase().replace(" ", "_");
  switch (s) {
    case "on_sale":
      return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
    case "completed":
      return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    case "cancelled":
      return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-indigo-600 bg-indigo-500/10 border-indigo-500/20";
  }
};

const getSalesStatusStyles = (salesStatus: string) => {
  switch (salesStatus) {
    case "active":
      return {
        label: "Active",
        color: "text-white",
        dot: "bg-green-700",
        badge: "bg-green-500/75 border-green-200",
      };
    case "stopped":
      return {
        label: "Sales Ended",
        color: "text-white",
        dot: "bg-red-500",
        badge: "bg-red-500/75 border-red-200",
      };
    default:
      return {
        label: "Hold",
        color: "text-yellow-600",
        dot: "bg-yellow-500",
        badge: "bg-yellow-100 border-yellow-200",
      };
  }
};

export function EventCard({ event, className }: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // const availableTickets = event.ticketTypes.reduce(
  //   (total, ticket) => {
  //     const sold = ticket.sold || 0;
  //     const quantity = ticket.quantity || 0;
  //     console.log(`🎫 Ticket ${ticket.name}: quantity=${quantity}, sold=${sold}, available=${quantity - sold}`);
  //     return total + (quantity - sold);
  //   },
  //   0
  // );
  const salesInfo = getSalesStatusStyles(event.sales_status);

  return (
    <Link href={`/events/detail?id=${event.id}`} className="block">
      <Card
        className={cn(
          "flex flex-col w-full group overflow-hidden",
          "group overflow-hidden bg-white/60 backdrop-blur-[20px]",
          "border border-white/10 border-gradient-to-r from-white/0 via-white/100 to-white/100",
          "shadow-[0px_8px_8px_0px_rgba(0,0,0,0.05),0px_4px_4px_0px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.03)]",
          "hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
          "rounded-[10px] cursor-pointer",
          className,
        )}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            width={400}
            height={225}
            className="w-full h-[225px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 ">
            <Badge
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 border rounded-2xl backdrop-blur-[8px]",
                salesInfo.badge,
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  salesInfo.dot,
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wide",
                  salesInfo.color,
                )}
              >
                {salesInfo.label}
              </span>
            </Badge>
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-30" />
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex flex-col flex-grow ">
          {/* Category Tags */}
          <div className="flex flex-wrap gap-1 overflow-hidden mb-3 h-[26px]">
            {event.categories.slice(0, 3).map((category) => (
              <Badge
                key={category.id}
                className="text-xs bg-blue-500/5 text-gray-600 border-gray-100/10 px-1 py-0.5 rounded-2xl backdrop-blur-[8px]"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Event Title */}
          <h3 className="font-medium text-lg text-gray-900 leading-snug line-clamp-2 mb-1 min-h-[3rem]">
            {event.title}
          </h3>

          {/* Date and Location */}
          <div className="space-y-2 flex-grow flex flex-col justify-start">
            <div className="flex items-center gap-2.5 text-sm">
              <CalendarDots size={20} className="text-gray-600 flex-shrink-0" />
              <span className="text-gray-600 text-[13px] line-clamp-1">
                {format(new Date(event.startDate), "yyyy-MM-dd hh:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <MapPin size={20} className="text-gray-600 flex-shrink-0" />
              <span className="text-gray-600 text-[13px] leading-[1.54] truncate">
                {event.venue.name}, {event.venue.country}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <div
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-md border",
                "text-[10px] font-semibold uppercase tracking-[0.1em]",
                "transition-colors duration-200",
                getEventStatusStyles(event.status),
              )}
            >
              {event.status?.replace("_", " ") || "DRAFT"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-2.5">
            <div className="w-full h-px bg-gray-900/10 rounded-[10px] mb-2.5" />
            <div className="flex justify-between items-center gap-2.5">
              {/* View Detail Button with Glow Effect */}
              <FigmaButton
                variant="glass"
                size="sm"
                showGlow={true}
                disabled={false}
              >
                {t("common.viewDetails")}
                <ArrowRightIcon size={16} />
              </FigmaButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
