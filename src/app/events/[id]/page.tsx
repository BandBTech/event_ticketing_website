
import { EventDetailClient } from "@/components/events/EventDetailClient";
import { eventService } from "@/services/eventService";

export async function generateStaticParams() {
  try {
    const response = await eventService.getPublicEvents({ limit: 100 }); 
    return response.events.map((event) => ({
      id: event.id,
    }));
  } catch (error) {
    console.error('Error during static generation:', error);
    return [];
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  return <EventDetailClient eventId={id} />;
}