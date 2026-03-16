"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { COMMON_FAQS } from "@/data/commonFAQs";

interface EventFAQProps {
  organizerName: string;
}

export const EventFAQ = ({ organizerName }: EventFAQProps) => {
  const [showFAQ, setShowFAQ] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
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
        <div className="px-6 py-4 space-y-0 divide-y divide-gray-100">
          {COMMON_FAQS.map((faq, index) => (
            <div key={index} className="py-4 first:pt-0 last:pb-0">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-blue-500 font-bold">Q:</span>
                {faq.question}
              </h3>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 font-bold">A:</span>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
          {/* Still have questions? */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-blue-50/50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h4 className="text-sm font-bold text-gray-900">
                  {t(
                    "eventDetails.faq.stillQuestions",
                    "Still have questions?",
                  )}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {t("eventDetails.faq.contactPrefix", "Contact")}{" "}
                  <span className="font-bold text-blue-600">
                    {organizerName}
                  </span>{" "}
                  {t(
                    "eventDetails.faq.contactSuffix",
                    "for specific event inquiries.",
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-gray-200 text-blue-600 font-semibold"
                onClick={() => { }}
              >
                {t(
                  "eventDetails.button.contactOrganizer",
                  "Contact Organizer",
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
