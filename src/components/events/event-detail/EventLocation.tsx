"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Venue } from "@/types/event";

interface EventLocationProps {
  venue: Venue;
}

export const EventLocation = ({ venue }: EventLocationProps) => {
  const [showMap, setShowMap] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const isCoord = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(venue.address.trim());
  const mapQuery = isCoord
    ? venue.address.trim()
    : `${venue.name}, ${venue.address}`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setShowMap(!showMap)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {t("common.location")}
        </h2>
        <CaretDownIcon
          size={24}
          className={cn(
            "text-gray-600 transition-transform",
            showMap && "rotate-180",
          )}
        />
      </button>
      {showMap && (
        <div className="px-6 pb-6">
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
              title={`${venue.name} location`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4">
            <p className="text-gray-700">
              {isCoord ? venue.name : venue.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
