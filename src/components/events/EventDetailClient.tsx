"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  CaretDownIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Event, TicketType } from "@/types/event";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService } from "@/services/eventService";
import DOMPurify from "dompurify";
import { TierSection } from "@/components/events/TierSection";
import { toast } from "@/lib/toast";

interface EventDetailClientProps {
  eventId: string;
}

interface SelectedTier extends TicketType {
  selectedQuantity: number;
}
export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [selectedTier, setSelectedTier] = useState<SelectedTier | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const updateTierQuantity = (tier: TicketType) => {
    setSelectedTier((prev) => {
      if (prev?.id === tier.id) return null;
      return { ...tier, selectedQuantity: 1 };
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      const parsed = raw ? JSON.parse(raw) : null;

      setIsLoggedIn(parsed?.state?.isAuthenticated === true);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const cartItems = selectedTier ? [selectedTier] : [];
  const totalAmount = selectedTier ? selectedTier.price : 0;
  const totalTickets = selectedTier ? 1 : 0;
  const eventCurrency = event?.ticketTypes[0]?.currency ?? "NPR";

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

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
  const handleGuestPurchase = () => {
    if (cartItems.length === 0) {
      toast.error("Please select at least one ticket.");
      return;
    }
    const eventData = {
      id: eventId,
      title: event?.title,
      image: event?.bannerImageUrl || event?.imageUrl,
      date: event?.startDate,
      venue: event?.venue.name,
      city: event?.venue.city,
      address: event?.venue.address,
      tier: cartItems,
      totalAmount: totalAmount,
      totalTickets: totalTickets,
    };

    if (!isLoggedIn) {
      localStorage.setItem("guestPurchase_event", JSON.stringify(eventData));
      router.push("/guest-purchase");
    } else {
      localStorage.setItem("userPurchase_event", JSON.stringify(eventData));
      router.push("/user-purchase");
    }
  };

  const handleLoginRedirect = () => {
    if (cartItems.length > 0) {
      const cartState = {
        eventId,
        selectedTier,
        totalAmount,
        totalTickets,
        eventData: {
          id: eventId,
          title: event?.title,
          image: event?.bannerImageUrl || event?.imageUrl,
          date: event?.startDate,
          venue: event?.venue.name,
          city: event?.venue.city,
          address: event?.venue.address,
          minPrice: minPrice,
        },
      };
      localStorage.setItem("pending_purchase", JSON.stringify(cartState));
    }

    const returnUrl = encodeURIComponent(`/event/${eventId}`);
    router.push(`/login?returnUrl=${returnUrl}`);
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
                {t("eventDetails.eventNotFound")}
              </h1>
              <Button onClick={() => router.push("/allevents")}>
                {t("eventDetails.backtoEvents")}
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
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
                      {isDescriptionExpanded ? "Read less" : "Read more"}
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
                  {/* <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Follow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Contact
                    </Button>
                  </div> */}
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
              {/* Price & Actions */}
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                <div className="space-y-4">
                  {/* Price */}
                  {/* <div>
                    <p className="text-sm text-gray-600 mb-1">From</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formattedPrice}
                    </p>
                  </div> */}

                  {/* Ticket Tiers */}
                  <div className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Choose Your Tickets
                    </h3>

                    <TierSection
                      tiers={event.ticketTypes}
                      
                      selectedTiersMap={
                        selectedTier ? { [selectedTier.id]: selectedTier } : {}
                      }
                      onAdd={(tier) => updateTierQuantity(tier)}
                      onRemove={(tier) => updateTierQuantity(tier)} 
                      isCancelled={event.is_cancelled}
                      salesStatus={event.sales_status}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <Button
                        onClick={handleGuestPurchase}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                      >
                        {
                          isLoggedIn
                            ? t("eventDetails.button.buyTickets") // "Buy Tickets" for logged-in users
                            : t("eventDetails.button.buyTicketsGuest") // "Buy as Guest" for non-logged-in
                        }
                      </Button>
                      {!isLoggedIn && (
                        <Button
                          onClick={handleLoginRedirect}
                          className="w-full h-12 bg-green-600 hover:bg-green-800 text-white font-medium rounded-lg"
                        >
                          {t("eventDetails.button.loginToBuy")}
                        </Button>
                      )}

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

                  {/* Participants */}
                  {/* <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        Participants
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        See more →
                      </button>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div> */}

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
