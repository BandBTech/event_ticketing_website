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

const RESTRICTED_STATUSES = [
  "pending",
  "live",
  "completed",
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

  // const isRestricted =
  //   RESTRICTED_STATUSES.includes(event.status?.toLowerCase()) ||
  //   event.sales_status === "stopped" ||
  //   event.is_cancelled;

  // if (isRestricted) {
  //   return <EventNotFound reason="restricted_status" />;
  // }

  return (
    <div className="min-h-screen relative">
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
        <main className="max-w-7xl mx-auto px-4 py-12">
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
    </div>
  );
}
