import Image from "next/image";
import Link from "next/link";
import { CalendarDotsIcon, MapPinIcon } from "@phosphor-icons/react";
import { Event } from "@/types/event";
import FeaturedBadge from "./FeaturedBadge";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { EventStatusBadge } from "./EventStatusBadge";

interface EventCardProps {
  event: Event;
}

export function HomeEvent({ event }: EventCardProps) {
  return (
<Link href={`/events/detail?id=${event.id}`} key={event.id}>
  <div className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300">
    <div className="aspect-video relative overflow-hidden">
      <Image
        src={event.imageUrl}
        alt={event.title}
        width={400}
        height={225}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-2 left-2">
            {/* {event.status?.toLowerCase().replace(" ", "_") === "on_sale" && event.sales_status !== "active" ? (
              <SalesStatusBadge status={event.sales_status} />
            ) : (
              <EventStatusBadge status={event.status} />
            )} */}
            <EventStatusBadge status={event.status} />
          </div>
      {/* Featured Badge - Positioned inside the image container */}
      {event.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <FeaturedBadge />
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-1 flex-shrink-0">
            <CalendarDotsIcon weight="duotone" size={16} />
            <span>
              {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <MapPinIcon className="shrink-0" weight="duotone" size={16} />
            <span className="truncate" title={`${event.venue.name}, ${event.venue.country}`}>
              {event.venue.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Link>
  );
}