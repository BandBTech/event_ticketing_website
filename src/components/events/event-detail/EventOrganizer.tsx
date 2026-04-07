"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Event } from "@/types/event";

interface EventOrganizerProps {
  event: Event;
}

export const EventOrganizer = ({ event }: EventOrganizerProps) => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t("common.organizer")}
      </h2>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {event.organizer.business_logo ? (
              <img
                src={event.organizer.business_logo}
                alt={event.organizer.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {event.title.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {event.organizer.business_name}
           
            </h3>
            <p className="text-sm text-gray-600">Event organizer</p>
          </div>
        </div>
      </div>
      <p className="text-gray-700 mt-4">
        {/* {event.venue.name} is a premier venue located at{" "}
        {event.venue.address}, {event.venue.city}. With a capacity of{" "}
        {event.venue.capacity.toLocaleString()} guests, we host
        amazing events. */}
        {event.organizer.business_description}
      </p>
    </div>
  );
};
