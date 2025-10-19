import { EventDetailClient } from "@/components/events/EventDetailClient";
import { mockEvents } from "@/data/mockEvents";

export async function generateStaticParams() {
  // Generate paths for all events
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <EventDetailClient eventId={params.id} />;
}
