"use client";

import Image from "next/image";
import FeaturedBadge from "../FeaturedBadge";
import { Event } from "@/types/event";

interface EventHeroProps {
  event: Event;
}

export const EventHero = ({ event }: EventHeroProps) => {
  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-2xl">
        <Image
          src={event.bannerImageUrl || event.imageUrl}
          alt={event.title}
          width={1200}
          height={675}
          sizes="100vw"
          className="w-full h-auto"
          priority
        />
        {event.is_featured && (
          <div className="absolute top-3 right-3">
            <FeaturedBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    </>
  );
};
