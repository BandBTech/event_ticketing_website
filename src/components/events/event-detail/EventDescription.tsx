"use client";

import { useState } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface EventDescriptionProps {
  description: string;
}

export const EventDescription = ({ description }: EventDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {t("eventDetails.description.title")}
      </h2>
      <div className={cn("text-gray-700 space-y-4")}>
        <div
          className={cn(
            "prose prose-sm max-w-none",
            !isExpanded && "line-clamp-4",
          )}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description),
          }}
        />

        {description.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {isExpanded
              ? t("eventDetails.description.readLess", "Read Less")
              : t("eventDetails.description.readMore", "Read More")}
          </button>
        )}
      </div>
    </div>
  );
};
