"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/ShareButton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatEventDateTime } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { Event } from "@/types/event";
import { BroadcastIcon, InfoIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import Image from "next/image";
import { SalesCountdown } from "./SalesCountdown";

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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const dateDisplay = formatEventDateTime(event.startDate, event.endDate);

  const renderSalesAction = () => {
    const isCancelPending = event.status?.toLowerCase() === "cancel_pending";
    const isCancelled =
      event.is_cancelled || event.status?.toLowerCase() === "cancelled";
    const isLive = event.status?.toLowerCase() === "live";
    const isCompleted = event.status?.toLowerCase() === "completed";
    const isPaused =
      event.sales_status === "paused" || event.status?.toLowerCase() === "hold";
    const isStopped = event.sales_status === "stopped";

    if (isCancelPending) {
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
                "eventDetails.button.cancellationPending",
                "Cancellation Pending",
              )}
            </span>
            <p className="text-sm text-orange-700 mt-0.5">
              {t(
                "eventDetails.button.cancellationPendingNote",
                "This event has a cancellation request pending admin approval. Ticket purchases are unavailable.",
              )}
            </p>
          </div>
        </div>
      );
    }

    if (isCancelled) {
      return (
        <div className="bg-red-50 border flex items-start gap-2 border-red-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <InfoIcon
            size={24}
            weight="duotone"
            className="text-red-500 shrink-0"
          />
          <div className="text-red-800">
            <span className="font-bold">
              {t("eventDetails.button.eventCancelled", "Event Cancelled")}
            </span>
            <p className="text-sm text-red-700 mt-0.5">
              {t(
                "eventDetails.button.eventCancelledNote",
                "This event has been cancelled. Ticket sales are unavailable.",
              )}
            </p>
          </div>
        </div>
      );
    }

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

    if (isCompleted) {
      return (
        <div className="bg-gray-100 border flex items-start gap-2 border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <InfoIcon
            size={24}
            weight="duotone"
            className="text-gray-500 shrink-0"
          />
          <div className="text-gray-800">
            <span className="font-bold leading-8">
              {t("eventDetails.button.eventEnded", "Event Ended")}
            </span>
            <p className="text-sm text-gray-700">
              {t(
                "eventDetails.button.eventEndedNote",
                "This event has ended. Ticket sales are no longer available.",
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
      const lowestRemaining = Math.min(
        ...availableTickets.map((t) => t.available),
      );

      return (
        <>
          {lowestRemaining > 0 && lowestRemaining < 10 && (
            <div className="mb-3">
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {t(
                  "events.onlyTicketsLeft",
                  `Only ${lowestRemaining} left!`,
                  { count: lowestRemaining },
                )}
              </span>
            </div>
          )}
          <div className="mb-4">
            <p className="text-sm text-gray-500 font-medium">
              {t("events.startingFrom", "Tickets starting from")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                lowestAvailablePrice,
                availableTickets[0].currency,
              )}
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
        <div className="space-y-3">
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
          <div className="space-y-3 border-t pt-4">
            <p className=" font-semibold text-gray-900 mb-2 tracking-wide flex items-center gap-1">
              {t("eventDetails.schedule", "Sales Date")}
            </p>
            {event.ticketTypes.map((type) => (
              <div key={type.id} className="border-b pb-1 last:border-0">
                <p className="text-[12px] font-medium text-primary mb-1">
                  {type.tier_name}
                </p>

                {/* Sales Start */}
                <div className="flex items-center justify-between text-sm font-medium gap-4">
                  <div className="flex items-center gap-2">
                    {/*  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-gray-900 font-medium">
                      {t("eventDetails.starts", "Starts")}:
                    </span> */}
                    <span className="text-gray-900 bg-gray-50">
                      {format(new Date(type.sales_start), "MMM dd, yyyy")}
                      <span className="text-gray-900 ml-1">
                        {format(new Date(type.sales_start), "hh:mm a")}
                      </span>
                    </span>
                    -
                    <span className="text-gray-900 bg-gray-50 ">
                      {format(new Date(type.sales_end), "MMM dd, yyyy")}
                      <span className="text-gray-900 ml-1">
                        {format(new Date(type.sales_end), "hh:mm a")}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Sales End
                <div className="flex items-center justify-between text-sm font-medium gap-4 ">
                  <div className="flex items-center gap-2">
                    {/* <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span className="text-gray-900 font-medium">
                      {t("eventDetails.end", "Ends")}:
                    </span>
                  </div>

                </div>*/}
              </div>
            ))}
          </div>
        </div>

        {/* Place */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("common.place", "Venue")}
          </h3>
          <p className="text-gray-900 font-medium break-words">{event.venue.name}</p>
          {!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
            event.venue.address?.trim() || "",
          ) && <p className="text-sm text-gray-600 break-words w-full">{event.venue.address}</p>}
        </div>

        {/* Date */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("common.Event.date", "Event Date")}
          </h3>
          <div className="flex items-center justify-between text-sm font-medium gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 bg-gray-50">
                {format(new Date(event.startDate), "MMM dd, yyyy")}
                <span className="text-gray-900 ml-1">
                  {format(new Date(event.startDate), "hh:mm a")}
                </span>
              </span>
              -
              <span className="text-gray-900 bg-gray-50 ">
                {format(new Date(event.endDate), "MMM dd, yyyy")}
                <span className="text-gray-900 ml-1">
                  {format(new Date(event.endDate), "hh:mm a")}
                </span>
              </span>
            </div>
          </div>
          {/* <div className="flex items-start gap-2 text-gray-900">
            <span className="text-sm font-medium">
              {dateDisplay.start}{" "}
              {dateDisplay.isSameDay ? `- ${dateDisplay.end}` : "-"}
            </span>
            {!dateDisplay.isSameDay && (
              <span className="text-sm font-medium">{dateDisplay.end}</span>
            )}
          </div> */}
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
