"use client";

import { EventDetailClient } from "@/components/events/EventDetailClient";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EventDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
                <p className="text-gray-600">No event ID provided in the URL.</p>
            </div>
        </div>
    );
  }

  return <EventDetailClient eventId={id} />;
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EventDetailContent />
    </Suspense>
  );
}
