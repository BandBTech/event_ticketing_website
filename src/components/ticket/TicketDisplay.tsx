"use client";

import { format } from "date-fns";
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ViewTicketDetails, TicketItem } from "@/types/ticket";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar, MapPin, Ticket, User, Building2 } from "lucide-react";

interface TicketDisplayProps {
  order: ViewTicketDetails;
  onPrint?: () => void;
  onDownload?: () => void;
  isLoading?: boolean;
}

function ClientQRCode({ value }: { value: string }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[100px] h-[100px] bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <QRCodeSVG
      value={value}
      size={100}
      level="M"
      includeMargin={false}
      minVersion={1}
      fgColor="#0f172a"
    />
  );
}

// Single Ticket Card Component - Compact White Design
function SingleTicketCard({
  ticket,
  event,
  currency,
  company,
  index,
  total
}: {
  ticket: TicketItem;
  event: ViewTicketDetails['event'];
  currency: string;
  company?: ViewTicketDetails['company'];
  index: number;
  total: number;
}) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Combined date and time format
  const dateTimeString = format(new Date(event.startDate), "EEE, MMM d, yyyy • h:mm a");

  return (
    <div className="relative print:break-inside-avoid print:mb-4">
      {/* Main Ticket Container - White Background */}
      <div className="relative max-w-xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 print:shadow-none print:border">

        {/* Top Section - Event Banner (Compact) */}
        <div className="relative">
          {event.imageUrl ? (
            <div className="relative w-full aspect-16/9 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-lg font-bold text-white drop-shadow-lg line-clamp-1">
                  {event.title}
                </h2>
              </div>
            </div>
          ) : (
              <div className="h-24 bg-primary flex items-center justify-center p-4">
                <h2 className="text-lg font-bold text-primary-foreground text-center line-clamp-1">
                {event.title}
              </h2>
            </div>
          )}

          {/* Ticket Badge */}
          <div className="absolute top-2 right-2 bg-primary shadow-md rounded-full px-3 py-1">
            <div className="flex items-center gap-1.5">
              <Ticket className="w-3 h-3 text-primary-foreground" />
              <span className="text-xs font-bold text-primary-foreground uppercase tracking-wide">{ticket.tierName.name}</span>
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative flex items-center justify-between px-0 py-2">
          <div className="w-4 h-8 bg-gray-100 rounded-r-full -ml-2" />
          <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />
          <div className="w-4 h-8 bg-gray-100 rounded-l-full -mr-2" />
        </div>

        {/* Content Section */}
        <div className="pb-3">
          {/* QR Code + Details Side by Side */}
          <div className="flex flex-col items-center gap-4">
            {/* QR Code - Smaller */}
            <div className="flex-shrink-0 px-4">
              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm min-h-[116px] min-w-[116px] flex items-center justify-center">
                <ClientQRCode value={ticket.qrData} />
              </div>
              <p className="font-mono text-[10px] text-gray-500 text-center mt-2 tracking-wider bg-gray-100 py-1 px-2 rounded-md border border-gray-20 ">
                {ticket.ticketNumber}
              </p>
            </div>

            {/* Event Details - Compact */}
            <div className="flex-1 space-y-3 bg-gray-500/5 p-4 border-y border-gray-200 w-full">
              {/* Combined Date & Time Row */}
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="size-9 text-primary bg-primary/10 p-2.5 rounded-md" />
                <div className="flex-1">
                  <p className="text-[10px] text-black/50 font-medium uppercase tracking-wider">
                    {t("ticketView.dateTime", "Date & Time")}
                  </p>
                  <div className="flex gap-2">
                    <p className="text-sm font-semibold">
                      {dateTimeString}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Row */}
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="size-9 text-primary bg-primary/10 p-2.5 rounded-md" />
                <div className="flex-1">
                  <p className="text-[10px] text-black/50 font-medium uppercase tracking-wider">
                    {t("ticketView.venue", "Venue")}
                  </p>
                  <div className="flex gap-2">
                    <p className="text-sm font-semibold">
                      {event.venueName},
                    </p>
                    <p className="text-sm text-black/60">
                      {event.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer & Supported By Section - Compact Row */}
          <div className="pt-3 px-4 flex justify-around gap-4">
            {/* Organizer */}
            {event.organizer && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {t("ticketView.organizedBy", "Organized by")}:
                </span>
                <div className="flex items-center gap-1.5">
                  {event.organizer.logo && (
                    <img
                      src={event.organizer.logo}
                      alt={event.organizer.name}
                      className="h-6 max-w-[32px] object-contain"
                    />
                  )}
                  <span className="text-xs text-gray-600 font-medium line-clamp-1">
                    {event.organizer.name}
                  </span>
                </div>
              </div>
            )}

            {/* Supported By (Company) */}
            {company && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {t("ticketView.supportedBy", "Supported by")}:
                </span>
                <div className="flex items-center gap-1.5">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-6 max-w-[32px] object-contain"
                    />
                  ) : (
                    <Building2 className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600 font-medium line-clamp-1">
                    {company.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validity Notice - Slim Footer */}
        <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-500">
            ✨ {t("ticketView.validityNotice", "Valid for single entry only")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TicketDisplay({ order, onPrint, onDownload, isLoading }: TicketDisplayProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl animate-pulse border border-gray-200">
            <div className="h-32 bg-gray-200 rounded-t-2xl" />
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="ticket-container" className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 print:space-y-0">
      {/* 3-Column Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {order.tickets.map((ticket, index) => (
          <SingleTicketCard
            key={ticket.ticketId}
            ticket={ticket}
            event={order.event}
            currency={order.currency}
            company={order.company}
            index={index}
            total={order.tickets.length}
          />
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
