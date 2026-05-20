"use client";

import { EventDetailClient } from "@/components/events/EventDetailClient";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EventDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();

  if (!id) {
    return (
      <>
      <PageTitle title={t("eventdetail.title", "EventDetail")}/>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("eventDetails.eventNotFound")}
          </h1>
          <p className="text-gray-600">{t("eventDetails.noEventId")}</p>
          <Button onClick={() => router.push("/allevents")}>
            {t("eventDetails.backtoEvents")}
          </Button>
        </div>
      </div>
      </>
    );
  }

  return <EventDetailClient eventId={id} />;
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <EventDetailContent />
    </Suspense>
  );
}
