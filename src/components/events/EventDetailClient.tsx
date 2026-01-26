"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import DOMPurify from "dompurify";
import { useEventById } from "@/hooks/useEvents";

interface EventDetailClientProps {
  eventId: string;
}

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: event, isLoading } = useEventById(eventId);

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
          <main className="max-w-7xl mx-auto px-4 py-8">
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

  if (!event) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />
        <div className="relative z-10">
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t("eventDetails.eventNotFound", "Event Not Found")}
              </h1>
              <Button onClick={() => router.push("/allevents")}>
                {t("eventDetails.backtoEvents", "Back to Events")}
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const eventDate = new Date(event.startDate);
  const formattedDate = format(eventDate, "dd MMM yyyy 'at' HH:mm");

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
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Image */}
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <Image
              src={event.bannerImageUrl || event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("eventDetails.description.title")}
                </h2>
                <div className={cn("text-gray-700 space-y-4")}>
                  <div
                    className={cn(
                      "prose prose-sm max-w-none",
                      !isDescriptionExpanded && "line-clamp-4",
                    )}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(event.description),
                    }}
                  />

                  {event.description.length > 200 && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {isDescriptionExpanded ? t("eventDetails.description.readLess", "Read Less") : t("eventDetails.description.readMore", "Read More")}
                    </button>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t("common.organizer")}
                </h2>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {event.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Event Organizer
                      </h3>
                      <p className="text-sm text-gray-600">Event organizer</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mt-4">
                  {event.venue.name} is a premier venue located at{" "}
                  {event.venue.address}, {event.venue.city}. With a capacity of{" "}
                  {event.venue.capacity.toLocaleString()} guests, we host
                  amazing events.
                </p>
              </div>

              {/* Location */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowLocationMap(!showLocationMap)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("common.location")}
                  </h2>
                  <CaretDownIcon
                    size={24}
                    className={cn(
                      "text-gray-600 transition-transform",
                      showLocationMap && "rotate-180",
                    )}
                  />
                </button>
                {showLocationMap && (
                  <div className="px-6 pb-6">
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPinIcon size={48} className="text-gray-400" />
                      <span className="ml-2 text-gray-600">
                        Map placeholder
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700">
                        {event.venue.address}, {event.venue.city},{" "}
                        {event.venue.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* FAQ */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("common.faq")}
                  </h2>
                  <CaretDownIcon
                    size={24}
                    className={cn(
                      "text-gray-600 transition-transform",
                      showFAQ && "rotate-180",
                    )}
                  />
                </button>
                {showFAQ && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        What is the refund policy?
                      </h3>
                      <p className="text-gray-700">
                        Refunds are available up to 48 hours before the event.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Is parking available?
                      </h3>
                      <p className="text-gray-700">
                        Yes, free parking is available at the venue.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                <div className="space-y-4">
                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <Button
                        onClick={handleFindTickets}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                      >
                        {t("eventDetails.button.findTickets", "Find Tickets")}
                      </Button>

                      <Button
                        onClick={handleShare}
                        variant="outline"
                        className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">
                          {t("eventDetails.button.share")}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFavorite(!isFavorite);
                          }}
                        >
                          <HeartIcon
                            size={24}
                            weight={isFavorite ? "fill" : "regular"}
                            className={cn(
                              "transition-colors",
                              isFavorite ? "text-red-500" : "text-gray-600",
                            )}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* Place */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("common.place")}
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {event.venue.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.venue.address}, {event.venue.city}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("common.date")}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-900">
                      <CalendarIcon size={20} />
                      <span>{formattedDate}</span>
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
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
