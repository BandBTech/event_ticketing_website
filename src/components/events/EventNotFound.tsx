"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { CalendarX } from "@phosphor-icons/react";

interface EventNotFoundProps {
  reason?: "not_found" | "restricted_status" | "api_error";
}

export function EventNotFound({ reason = "not_found" }: EventNotFoundProps) {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const getMessage = () => {
    switch (reason) {
      case "restricted_status":
        return {
          title: t("eventDetails.notFound.restrictedTitle", "Event Not Available"),
          description: t(
            "eventDetails.notFound.restrictedDescription",
            "This event is no longer available for public access."
          ),
        };
      case "api_error":
        return {
          title: t("eventDetails.notFound.errorTitle", "Event Not Found"),
          description: t(
            "eventDetails.notFound.errorDescription",
            "We couldn't find the event you're looking for. It may have been removed or the link may be incorrect."
          ),
        };
      default:
        return {
          title: t("eventDetails.notFound.title", "Event Not Found"),
          description: t(
            "eventDetails.notFound.description",
            "We couldn't find the event you're looking for. It may have been removed or the link may be incorrect."
          ),
        };
    }
  };

  const { title, description } = getMessage();

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <CalendarX size={48} weight="duotone" className="text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 text-base leading-relaxed">{description}</p>
          </div>
          <Button
            onClick={() => router.push("/allevents")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11"
          >
            {t("eventDetails.backtoEvents", "Browse Events")}
          </Button>
        </div>
      </div>
    </div>
  );
}
