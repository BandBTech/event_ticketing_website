"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEventById } from "@/hooks/useEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useRouter } from "next/navigation";
import { EventDescription } from "./event-detail/EventDescription";
import { EventFAQ } from "./event-detail/EventFAQ";
import { EventHero } from "./event-detail/EventHero";
import { EventLocation } from "./event-detail/EventLocation";
import { EventOrganizer } from "./event-detail/EventOrganizer";
import { EventSidebar } from "./event-detail/EventSidebar";
import { EventNotFound } from "./EventNotFound";
import { PageTitle } from "../pagetitle/PageTitle";
import { formatCurrency } from "@/lib/utils";

const RESTRICTED_STATUSES = [
  "pending",
  "rejected",
  "cancelled",
  "cancel_pending",
];

interface EventDetailClientProps {
  eventId: string;
}

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: event, isLoading, isError } = useEventById(eventId);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  const handleFindTickets = () => {
    router.push(`/ticket-purchase?event_id=${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />
        <div className="relative z-10">
          <main className="max-w-7xl mx-auto px-4 py-12">
            <Skeleton className="w-full h-96 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
              </div>
              <div>
                <Skeleton className="h-96" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return <EventNotFound reason="api_error" />;
  }

  const isRestricted =
    RESTRICTED_STATUSES.includes(event.status?.toLowerCase()) ||
    event.sales_status === "stopped" ||
    event.is_cancelled;

  if (isRestricted) {
    return <EventNotFound reason="restricted_status" />;
  }

  // Calculate sales states
  const now = new Date();
  const availableTickets = event
    ? event.ticketTypes.filter((t) => t.isActive && t.available > 0)
    : [];
  const isAvailable = availableTickets.length > 0;

  const willSalesStart = event
    ? event.ticketTypes.some(
        (t) => new Date(t.sales_start) > now && t.isActive,
      )
    : false;

  const lowestAvailablePrice = isAvailable
    ? Math.min(...availableTickets.map((t) => t.price))
    : null;
  const currency = isAvailable ? availableTickets[0].currency : null;

  return (
    <div className="min-h-screen relative">
      <PageTitle title={event.title}/>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />
        <div className="absolute -top-96 -right-96 w-[1800px] h-[800px] rounded-full opacity-30">
          <div
            className="w-full h-full bg-gradient-radial from-orange-300 via-orange-200 to-transparent animate-pulse"
            style={{ filter: "blur(140px)" }}
          />
        </div>
        <div className="absolute -bottom-96 -left-96 w-[1900px] h-[1000px] rounded-full opacity-25">
          <div
            className="w-full h-full bg-gradient-radial from-blue-400 via-blue-300 to-transparent animate-pulse"
            style={{ filter: "blur(140px)", animationDelay: "2s" }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-4 py-12 pb-28 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <EventHero event={event} />
              <div className="border-l-4 border-primary pl-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {event.title}
                </h2>
              </div>
              <EventDescription description={event.description} />
              <EventOrganizer event={event} />
              <EventLocation venue={event.venue} />
              <EventFAQ organizerName={event.organizer.business_name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <EventSidebar
                event={event}
                onShare={handleShare}
                onFindTickets={handleFindTickets}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Bottom Bar for Mobile Screen */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            {isAvailable ? (
              <>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  {t("events.startingFrom", "Starting from")}
                </span>
                <span className="text-xl font-bold text-blue-600 truncate">
                  {lowestAvailablePrice !== null && currency
                    ? formatCurrency(lowestAvailablePrice, currency)
                    : ""}
                </span>
              </>
            ) : willSalesStart ? (
              <>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  {t("eventDetails.status", "Status")}
                </span>
                <span className="text-base font-bold text-amber-600 truncate">
                  {t("events.upcoming", "Upcoming")}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  {t("eventDetails.status", "Status")}
                </span>
                <span className="text-base font-bold text-red-600 truncate">
                  {t("eventDetails.button.ticketSalesEnded", "Sales Ended")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAvailable ? (
              <button
                onClick={handleFindTickets}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/25"
              >
                {t("eventDetails.button.findTickets", "Buy Tickets")}
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-3 bg-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
              >
                {willSalesStart
                  ? t("events.upcoming", "Upcoming")
                  : t("eventDetails.button.ticketSalesEnded", "Sales Ended")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
