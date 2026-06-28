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
  const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Combine featured events, live events, and all public events to get a solid list of top events
  const combinedEvents: Event[] = [];
  const addedIds = new Set<string>();

  // Filter helper: check if event is within 3 months from today
  const isWithinThreeMonths = (event: Event) => {
    if (!event.startDate) return false;
    const eventDate = new Date(event.startDate);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    threeMonthsLater.setHours(23, 59, 59, 999);

    return eventDate >= todayStart && eventDate <= threeMonthsLater;
  };

  const addEvents = (list: Event[]) => {
    list.forEach((event) => {
      if (isWithinThreeMonths(event) && !addedIds.has(event.id)) {
        combinedEvents.push(event);
        addedIds.add(event.id);
      }
    });
  };

  // Prioritize featured events
  addEvents(featuredEvents);

  // Then add sales live events
  addEvents(salesLiveEvents);

  // Then add all public events to ensure we have at least 5 events if possible, and up to 10
  addEvents(allEvents);

  // Separate featured and non-featured from our deduplicated & filtered list
  const featured = combinedEvents.filter((e) => e.is_featured);
  const nonFeatured = combinedEvents.filter((e) => !e.is_featured);

  // Make featured come first
  const sortedCombinedEvents = [...featured, ...nonFeatured];

  // Limit to top 5 for the banner
  const bannerEvents = sortedCombinedEvents.slice(0, 5);

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
        <div className="w-full aspect-[16/10] bg-slate-200/60 rounded-3xl border border-slate-200/50 animate-pulse flex items-end p-10">
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

  // Determine aspect ratio based on active image, fallback to 1.6 (16:10)
  const currentAspectRatio = aspectRatios[activeIndex] || 1.6;

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
        className="relative w-full h-auto md:aspect-[var(--desktop-aspect)] overflow-hidden rounded-3xl border border-white/20 shadow-xl group/carousel transition-all duration-500 ease-in-out"
        style={
          { "--desktop-aspect": currentAspectRatio } as React.CSSProperties
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides Container */}
        <div className="relative w-full h-auto md:absolute md:inset-0 md:h-full">
          {bannerEvents.map((event, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Link
                key={event.id}
                href={`/events/detail?id=${event.id}`}
                className={cn(
                  isActive
                    ? "relative w-full h-auto md:absolute md:inset-0 md:h-full md:w-full flex flex-col justify-start md:justify-end opacity-100 z-10 scale-100 pointer-events-auto"
                    : "absolute top-0 left-0 w-full h-full flex flex-col justify-start md:justify-end opacity-0 z-0 scale-[1.02] pointer-events-none",
                  "transition-all duration-700 ease-in-out cursor-pointer",
                )}
              >
                {/* Slide Image Container */}
                <div
                  className="relative w-full aspect-[var(--image-aspect)] md:aspect-auto md:absolute md:inset-0 md:w-full md:h-full transition-transform duration-10000 ease-out scale-100 group-hover/carousel:scale-[1.03] overflow-hidden shrink-0"
                  style={
                    {
                      "--image-aspect": aspectRatios[idx] || 1.6,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    priority={idx === 0}
                    className="object-cover blur-3xl z-0"
                  />
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    priority={idx === 0}
                    className="object-contain object-center md:object-right"
                    onLoad={(e) => {
                      if (
                        typeof window !== "undefined" &&
                        window.innerWidth < 768
                      ) {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          setAspectRatios((prev) => ({
                            ...prev,
                            [idx]: naturalWidth / naturalHeight,
                          }));
                        }
                      }
                    }}
                  />
                  {/* Premium Layered Gradient Overlay - Desktop Only */}
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                </div>

                {/* Featured Badge - Top Right Corner */}
                {event.is_featured && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                    <FeaturedBadge />
                  </div>
                )}

                {/* Left/Main Overlay & Content Block */}
                <div className="relative z-10 w-full p-6 md:p-12 lg:p-16 space-y-2 md:max-w-3xl flex flex-col grow justify-between bg-white md:bg-transparent md:grow-0 md:justify-start">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <EventStatusBadge
                      status={event.status}
                      className="shadow-lg backdrop-blur-md border border-white/10"
                    />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl md:text-5xl font-extrabold tracking-tight md:text-white line-clamp-2 leading-tight">
                    {event.title}
                  </h2>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-start gap-x-6 gap-y-2 text-sm md:text-base text-slate-300 font-medium pt-1">
                    <span className="flex items-center gap-2 text-muted-foreground md:text-white/80">
                      <CalendarDotsIcon
                        size={24}
                        className="text-gray-400 md:w-[18px]"
                      />
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-start gap-2 text-muted-foreground md:text-white/80">
                      <MapPinIcon
                        size={24}
                        className="text-gray-400 flex-shrink-0 md:w-[18px]"
                      />
                      <span className="wrap-anywhere">
                        {getDisplayLocation(event)}
                      </span>
                    </span>
                  </div>

                  {/* Action Block */}
                  <div className="pt-2 md:pt-4 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 md:px-8 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm md:text-base font-bold rounded-xl shadow-lg shadow-indigo-600/35 hover:shadow-indigo-600/50 transition-all duration-300 transform active:scale-[0.98]">
                      {event.status?.toLowerCase() === "scheduled"
                        ? t("common.viewDetails", "View Details")
                        : t("hero.banner.getTickets", "Get Tickets")}
                    </div>
                    {getStartingPrice(event) && (
                      <span className="text-xs md:text-sm font-semibold text-slate-300">
                        {t("events.startingFrom", "Starting from")}{" "}
                        <span className="text-yellow-400 text-sm md:text-lg font-extrabold ml-1">
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
