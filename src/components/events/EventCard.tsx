'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDots, MapPin } from '@phosphor-icons/react/dist/ssr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FigmaButton } from '@/components/ui/figma-button';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface EventCardProps {
  event: Event;
  className?: string;
}

const getStatusColor = (status: string) => {

  switch (status) {
    case 'On Sale':
      return 'bg-green-500/75 text-white border-white/50';
    case 'Sale on Hold':
      return 'bg-yellow-500/75 text-white border-white/50';
    case 'Sold Out':
      return 'bg-red-500/75 text-white border-white/50';
    default:
      return 'bg-gray-500/75 text-white border-white/50';
  }
};


export function EventCard({ event, className }: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  
  // const availableTickets = event.ticketTypes.reduce(
  //   (total, ticket) => {
  //     const sold = ticket.sold || 0;
  //     const quantity = ticket.quantity || 0;
  //     console.log(`🎫 Ticket ${ticket.name}: quantity=${quantity}, sold=${sold}, available=${quantity - sold}`);
  //     return total + (quantity - sold);
  //   },
  //   0
  // ); 


  return (
    <Link href={`/events/detail?id=${event.id}`} className="block">
      <Card className={cn(
        "group overflow-hidden bg-white/60 backdrop-blur-[20px]",
        "border border-white/10 border-gradient-to-r from-white/0 via-white/100 to-white/100",
        "shadow-[0px_8px_8px_0px_rgba(0,0,0,0.05),0px_4px_4px_0px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.03)]",
        "hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
        "rounded-[10px] cursor-pointer",
        className
      )}>
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={225}
          className="w-full h-[225px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            className={cn(
              "backdrop-blur-[8px] border font-medium text-xs px-1 py-0.5 rounded-2xl",
              "flex items-center gap-1",
              getStatusColor(event.status)
            )}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-20" />
              <div className="w-1 h-1 bg-white rounded-full absolute" />
            </div>
            {event.status.toUpperCase()}
          </Badge>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-30" />
      </div>

      {/* Content Section */}
      <CardContent className="p-2.5 space-y-2.5">
        {/* Category Tags */}
        <div className="flex flex-wrap gap-1">
          {event.categories.slice(0, 3).map((category) => (
            <Badge
              key={category.id}
              className="text-xs bg-blue-500/5 text-gray-600 border-gray-100/10 px-1 py-0.5 rounded-2xl backdrop-blur-[8px]"
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Event Title */}
        <h3 className="font-medium text-lg text-gray-900 leading-[1.5] line-clamp-2">
          {event.title}
        </h3>

        {/* Date and Location */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-sm">
            <CalendarDots size={20} className="text-gray-600 flex-shrink-0" />
            <span className="text-gray-600 text-[13px] leading-[1.54]">
              {format(new Date(event.startDate), 'yyyy-MM-dd hh:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin size={20} className="text-gray-600 flex-shrink-0" />
            <span className="text-gray-600 text-[13px] leading-[1.54] truncate">
              {event.venue.name}, {event.venue.country}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-900/10 rounded-[10px]" />

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2.5">
          {/* View Detail Button with Glow Effect */}
          <FigmaButton
            variant="glass"
            size="sm"
            showGlow={true}
            disabled={false}
          >
            {t('common.viewDetails')}
       <ArrowRightIcon size={16} />
          </FigmaButton>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
