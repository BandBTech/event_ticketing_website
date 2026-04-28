"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CalendarIcon,
  HeartIcon,
  InfoIcon,
  BroadcastIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatEventDateTime } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Event } from "@/types/event";
import { SalesCountdown } from "./SalesCountdown";
import { ShareButton } from "@/components/ui/ShareButton";

interface EventSidebarProps {
  event: Event;
  onShare: () => void;
  onFindTickets: () => void;
}

export const EventSidebar = ({
  event,
  onShare,
  onFindTickets,
}: EventSidebarProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const dateDisplay = formatEventDateTime(event.startDate, event.endDate);

  const renderSalesAction = () => {
    const isLive = event.status?.toLowerCase() === "live";
    const isPaused =
      event.sales_status === "paused" || event.status?.toLowerCase() === "hold";
    const isStopped = event.sales_status === "stopped";

    if (isLive) {
      return (
        <div className="bg-emerald-50 border flex items-start gap-3 border-emerald-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="relative shrink-0 mt-0.5">
            <BroadcastIcon
              size={24}
              weight="duotone"
              className="text-emerald-600"
            />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div className="text-emerald-900">
            <span className="font-bold">
              {t("eventDetails.button.eventLive", "Event is Live Now")}
            </span>
            <p className="text-sm text-emerald-700 mt-0.5">
              {t(
                "eventDetails.button.eventLiveNote",
                "This event is currently happening. Online ticket sales are no longer available.",
              )}
            </p>
          </div>
        </div>
      );
    }

    if (isPaused) {
      return (
        <div className="bg-amber-50 border flex items-start gap-2 border-amber-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <InfoIcon
            size={24}
            weight="duotone"
            className="text-amber-500 shrink-0"
          />
          <div className="text-amber-800">
            <span className="font-bold">
              {t(
                "eventDetails.button.ticketSalesPaused",
                "Ticket Sales Paused",
              )}
            </span>
            <p className="text-sm text-amber-700">
              {t(
                "eventDetails.button.ticketSalesPausedNote",
                "Ticket sales are temporarily on hold. Please check back later.",
              )}
            </p>
          </div>
        </div>
      );
    }

    if (isStopped) {
      return (
        <div className="bg-red-50 border flex items-start gap-2 border-red-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <InfoIcon
            size={24}
            weight="duotone"
            className="text-red-500 shrink-0"
          />
          <div className="text-red-800">
            <span className="font-bold">
              {t(
                "eventDetails.button.ticketSalesStopped",
                "Ticket Sales Stopped",
              )}
            </span>
            <p className="text-sm text-red-700">
              {t(
                "eventDetails.button.ticketSalesStoppedNote",
                "Ticket sales for this event have been stopped. Please contact support for more information.",
              )}
            </p>
          </div>
        </div>
      );
    }

    const now = new Date().toISOString();
    const hasActiveTickets = event.ticketTypes.some(
      (t) => t.sales_start <= now && t.sales_end >= now && t.isActive,
    );

    if (hasActiveTickets) {
      const availableTickets = event.ticketTypes.filter(
        (t) =>
          t.available > 0 &&
          t.sales_start <= now &&
          t.sales_end >= now &&
          t.isActive,
      );

      if (availableTickets.length === 0) {
        return (
          <div className="bg-gray-100 border flex items-start gap-2 border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
            <InfoIcon
              size={24}
              weight="duotone"
              className="text-gray-500 mt-1 shrink-0"
            />
            <div className="text-gray-800">
              <span className="font-bold leading-8">
                {t("eventDetails.button.soldOut", "Sold Out")}
              </span>
              <p className="text-sm text-gray-700">
                {t(
                  "eventDetails.button.soldOutNote",
                  "All tickets for this event have been sold out.",
                )}
              </p>
            </div>
          </div>
        );
      }

      const lowestAvailablePrice = Math.min(
        ...availableTickets.map((t) => t.price),
      );

      return (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-500 font-medium">
              {t("events.startingFrom", "Tickets starting from")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("en-NP", {
                style: "currency",
                currency: availableTickets[0].currency,
                minimumFractionDigits: 0,
              }).format(lowestAvailablePrice)}
            </p>
          </div>
          <Button
            onClick={onFindTickets}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {t("eventDetails.button.findTickets", "Buy Tickets")}
          </Button>
        </>
      );
    }

    const willSalesStart = event.ticketTypes.some(
      (t) => t.sales_start > now && t.isActive,
    );
    if (willSalesStart) {
      const futureActiveTiers = event.ticketTypes
        .filter((t) => t.isActive && new Date(t.sales_start) > new Date())
        .sort(
          (a, b) =>
            new Date(a.sales_start).getTime() -
            new Date(b.sales_start).getTime(),
        );

      const nextSalesStart = futureActiveTiers[0]?.sales_start;

      const hadPreviousSales = event.ticketTypes.some(
        (t) => new Date(t.sales_end) < new Date(),
      );

      const countdownLabel = hadPreviousSales
        ? t("events.nextTierSalesStartingIn", "Next Ticket Sales Starting In")
        : t("events.salesStartingIn", "Ticket Sales Starting In");

      return (
        <>
          {nextSalesStart && (
            <SalesCountdown
              targetDate={nextSalesStart}
              label={countdownLabel}
            />
          )}
        </>
      );
    }

    return (
      <div className="bg-gray-100 border flex items-start gap-2 border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
        <InfoIcon
          size={24}
          weight="duotone"
          className="text-gray-500 mt-1 shrink-0"
        />
        <div className="text-gray-800">
          <span className="font-bold leading-8">
            {t("eventDetails.button.ticketSalesEnded", "Ticket Sales Ended")}
          </span>
          <p className="text-sm text-gray-700">
            {t(
              "eventDetails.button.ticketSalesEndedNote",
              "Official ticket sales for this event have concluded.",
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 sticky top-24">
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="pt-2">
          <div className="space-y-3">
            {renderSalesAction()}

            <ShareButton
              url={`/events/detail?id=${event.id}`}
              title={event.title}
              text={`Check out this event: ${event.title}`}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-lg"
              onShare={onShare}
            />
          </div>
        </div>

        

        {/* Place */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("common.place")}
          </h3>
          <p className="text-gray-900 font-medium">{event.venue.name}</p>
          {!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
            event.venue.address?.trim() || "",
          ) && <p className="text-sm text-gray-600">{event.venue.address}</p>}
        </div>

        {/* Date */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("common.date")}
          </h3>
          <div className="flex items-start gap-2 text-gray-900">
            <CalendarIcon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {dateDisplay.start}{" "}
                {dateDisplay.isSameDay ? `- ${dateDisplay.end}` : "-"}
              </span>
              {!dateDisplay.isSameDay && (
                <span className="text-sm font-medium">{dateDisplay.end}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            {t("common.tags")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {event.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            {t("common.acceptedPaymentMethods", "Accepted Payment Methods")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Image
              src="/images/stripe.svg"
              alt="Stripe"
              width={50}
              height={50}
            />
            <Image src="/images/visa.svg" alt="Visa" width={50} height={50} />
            <Image
              src="/images/mastercard.svg"
              alt="Mastercard"
              width={50}
              height={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
