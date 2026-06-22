"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDotsIcon,
  MapPinIcon,
  TicketIcon,
  CaretRightIcon,
  SparkleIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import { Event } from "@/types/event";
import { cn, formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import FeaturedBadge from "@/components/events/FeaturedBadge";

interface HeroEventsBannerProps {
  featuredEvents?: Event[];
  salesLiveEvents?: Event[];
  allEvents?: Event[];
  isLoading?: boolean;
}

export function HeroEventsBanner({
  featuredEvents = [],
  salesLiveEvents = [],
  allEvents = [],
  isLoading = false,
}: HeroEventsBannerProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Combine featured events, live events, and all public events to get a solid list of top events
  const combinedEvents: Event[] = [];
  const addedIds = new Set<string>();

  // Prioritize featured events
  featuredEvents.forEach((event) => {
    if (!addedIds.has(event.id)) {
      combinedEvents.push(event);
      addedIds.add(event.id);
    }
  });

  // Then add sales live events
  salesLiveEvents.forEach((event) => {
    if (!addedIds.has(event.id)) {
      combinedEvents.push(event);
      addedIds.add(event.id);
    }
  });

  // Then add all public events to ensure we have at least 5 events if possible, and up to 10
  allEvents.forEach((event) => {
    if (!addedIds.has(event.id)) {
      combinedEvents.push(event);
      addedIds.add(event.id);
    }
  });

  // Limit to top 10 for the banner
  const bannerEvents = combinedEvents.slice(0, 10);

  const nextSlide = useCallback(() => {
    if (bannerEvents.length > 0) {
      setActiveIdx((prev) => (prev + 1) % bannerEvents.length);
    }
  }, [bannerEvents.length]);

  const prevSlide = useCallback(() => {
    if (bannerEvents.length > 0) {
      setActiveIdx(
        (prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length,
      );
    }
  }, [bannerEvents.length]);

  // Set up auto-play timer
  useEffect(() => {
    if (!isHovered && bannerEvents.length > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000); // Rotates every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, nextSlide, bannerEvents.length]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto max-lg:px-4 pt-6 md:pt-8 lg:pt-16 mb-16">
        <div className="w-full h-[576px] bg-slate-200/60 rounded-3xl border border-slate-200/50 animate-pulse flex items-end p-10">
          <div className="space-y-4 max-w-xl w-full">
            <div className="h-6 bg-slate-300/60 rounded w-1/4" />
            <div className="h-10 bg-slate-300/60 rounded w-3/4" />
            <div className="h-6 bg-slate-300/60 rounded w-1/2" />
            <div className="h-12 bg-slate-300/60 rounded w-1/3 pt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (bannerEvents.length === 0) {
    return null;
  }

  // Ensure active index is within bounds
  const activeIndex = activeIdx >= bannerEvents.length ? 0 : activeIdx;

  // Helper to get lowest ticket price
  const getStartingPrice = (event: Event) => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return null;
    const activeTiers = event.ticketTypes.filter((t) => t.isActive);
    const tiersToUse = activeTiers.length > 0 ? activeTiers : event.ticketTypes;
    const lowestPrice = Math.min(...tiersToUse.map((t) => t.price));
    return formatCurrency(lowestPrice, tiersToUse[0].currency);
  };

  // Helper to format clean display location and avoid "Unknown Location"
  const getDisplayLocation = (event: Event) => {
    const name = event.venue.name;
    const address = event.venue.address;
    const city = event.venue.city;

    const hasValidName =
      name &&
      name.toLowerCase() !== "unknown venue" &&
      name.toLowerCase() !== "unknown location";

    const hasValidCity =
      city &&
      city.toLowerCase() !== "unknown city" &&
      city.toLowerCase() !== "unknown location";

    const isCoords = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
      address?.trim() || "",
    );
    const hasValidAddress =
      address && address.toLowerCase() !== "unknown location" && !isCoords;

    if (hasValidName) {
      if (hasValidCity && !name.toLowerCase().includes(city.toLowerCase())) {
        return `${name}, ${city}`;
      }
      return name;
    }

    if (hasValidAddress) {
      return address;
    }

    if (hasValidCity) {
      return city;
    }

    return t("common.location", "Nepal");
  };

  return (
    <div className="w-full max-w-7xl mx-auto max-xl:px-4 pt-6 md:pt-8 lg:pt-16 mb-8 relative z-10">
      {/* Visual background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 blur-3xl -z-10 rounded-3xl" />

      {/* Main Carousel Wrapper */}
      <div
        className="relative w-full h-[576px] overflow-hidden rounded-3xl border border-white/20 shadow-xl group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {bannerEvents.map((event, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Link
                key={event.id}
                href={`/events/detail?id=${event.id}`}
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col justify-end transition-all duration-700 ease-in-out cursor-pointer",
                  isActive
                    ? "opacity-100 z-10 scale-100 pointer-events-auto"
                    : "opacity-0 z-0 scale-[1.02] pointer-events-none",
                )}
              >
                {/* Slide Background Image */}
                <div className="absolute inset-0 transition-transform duration-10000 ease-out scale-100 group-hover/carousel:scale-[1.03]">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                  />
                  {/* Premium Layered Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                </div>

                {/* Featured Badge - Top Right Corner */}
                {event.is_featured && (
                  <div className="absolute top-6 right-6 z-20">
                    <FeaturedBadge />
                  </div>
                )}

                {/* Left/Main Overlay Content */}
                <div className="relative z-10 p-8 sm:p-12 md:p-16 text-white space-y-4 max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <EventStatusBadge
                      status={event.status}
                      className="shadow-lg backdrop-blur-md border border-white/10"
                    />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white line-clamp-2 leading-tight">
                    {event.title}
                  </h2>

                  {/* Event Tags Badge (below title) */}
                  {/*{event.categories && event.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {event.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-md"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}*/}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-start gap-6 text-sm text-slate-300 font-medium pt-1">
                    <span className="flex items-center gap-2">
                      <CalendarDotsIcon size={18} className="text-indigo-400" />
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-start gap-2">
                      <MapPinIcon
                        size={18}
                        className="text-indigo-400 flex-shrink-0"
                      />
                      <span className="wrap-anywhere">
                        {getDisplayLocation(event)}
                      </span>
                    </span>
                  </div>

                  {/* Action Block */}
                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/35 hover:shadow-indigo-600/50 transition-all duration-300 transform active:scale-[0.98]">
                      {/*<TicketIcon size={18} weight="bold" />*/}
                      {event.status?.toLowerCase() === "scheduled"
                        ? t("common.viewDetails", "View Details")
                        : t("hero.banner.getTickets", "Get Tickets")}
                    </div>
                    {getStartingPrice(event) && (
                      <span className="text-sm font-semibold text-slate-300">
                        {t("events.startingFrom", "Starting from")}{" "}
                        <span className="text-yellow-400 text-lg font-extrabold ml-1">
                          {getStartingPrice(event)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Carousel Arrow Controls */}
        {bannerEvents.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white hover:text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95"
              aria-label="Previous Slide"
            >
              <CaretLeftIcon size={24} weight="bold" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white hover:text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95"
              aria-label="Next Slide"
            >
              <CaretRightIcon size={24} weight="bold" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Indicator Dots (Placed BELOW the image wrapper) */}
      {bannerEvents.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {bannerEvents.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isActive
                    ? "w-8 bg-blue-600 shadow-sm"
                    : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
