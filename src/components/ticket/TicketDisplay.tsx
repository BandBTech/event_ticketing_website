"use client";

import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import type { ViewTicketDetails, TicketItem } from "@/types/ticket";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar, MapPin, Clock, Ticket, User } from "lucide-react";

interface TicketDisplayProps {
  order: ViewTicketDetails;
  onPrint?: () => void;
  isLoading?: boolean;
}

// Single Ticket Card Component
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

  return (
    <div className="relative max-w-md mx-auto print:break-inside-avoid print:mb-8">
      {/* Main Ticket Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/50 print:shadow-none">

        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Top Section - Event Banner */}
        <div className="relative">
          {event.imageUrl ? (
            <div className="relative h-52 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                  {event.title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="h-40 bg-primary flex items-center justify-center p-6">
              <h2 className="text-2xl font-bold text-primary-foreground text-center">
                {event.title}
              </h2>
            </div>
          )}

          {/* Ticket Badge */}
          <div className="absolute top-4 right-4 bg-primary shadow-lg shadow-primary/30 rounded-full px-4 py-2 border-2 border-white/30">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground uppercase tracking-wide">{ticket.tierName}</span>
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative flex items-center justify-between px-0 py-3">
          <div className="w-6 h-10 bg-white rounded-r-full -ml-3" />
          <div className="flex-1 border-t-2 border-dashed border-white/20 mx-2" />
          <div className="w-6 h-10 bg-white rounded-l-full -mr-3" />
        </div>

        {/* QR Code Section */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-center">
            {/* QR Container with glow effect */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-primary rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 print:hidden" />
              <div className="relative bg-white p-4 rounded-xl shadow-inner">
                <QRCodeSVG
                  value={ticket.qrData}
                  size={160}
                  level="M"
                  includeMargin={false}
                  minVersion={1}
                  fgColor="#0f172a"
                />
              </div>
            </div>

            {/* Ticket Number */}
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <p className="font-mono text-sm font-bold text-white/90 tracking-wider">
                {ticket.ticketNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="px-6 pb-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-3">
            {/* Date Row */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                  {t("ticketView.date", "Date")}
                </p>
                <p className="text-sm text-white font-semibold">
                  {format(new Date(event.startDate), "EEEE, MMMM do, yyyy")}
                </p>
              </div>
            </div>

            {/* Time Row */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Clock className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                  {t("ticketView.time", "Time")}
                </p>
                <p className="text-sm text-white font-semibold">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
              </div>
            </div>

            {/* Venue Row */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <MapPin className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                  {t("ticketView.venue", "Venue")}
                </p>
                <p className="text-sm text-white font-semibold">
                  {event.venueName}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  {event.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Organizer Section */}
        {event.organizer && (
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center gap-2 py-4 border-t border-white/10">
              <span className="text-xs text-white/40 uppercase tracking-wider">
                {t("ticketView.organizedBy", "Organized by")}
              </span>
              {event.organizer.logo ? (
                <img
                  src={event.organizer.logo}
                  alt={event.organizer.name}
                  className="h-10 max-w-[150px] object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/80 font-semibold">
                    {event.organizer.name}
                  </span>
                </div>
              )}
              {event.organizer.logo && (
                <span className="text-xs text-white/60 font-medium">
                  {event.organizer.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/70 uppercase tracking-wider">
                {t("ticketView.price", "Price")}
              </p>
              <p className="text-xl font-bold text-primary-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(ticket.price)}
              </p>
            </div>

            {total > 1 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                <p className="text-xs font-bold text-primary-foreground">
                  {index + 1} / {total}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Validity Note */}
        <div className="bg-slate-950 px-6 py-3 text-center">
          <p className="text-xs text-amber-400/80 font-medium">
            ✨ {t("ticketView.validityNotice", "Valid for single entry only")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TicketDisplay({ order, onPrint, isLoading }: TicketDisplayProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl animate-pulse">
          <div className="h-52 bg-slate-700/50 rounded-t-3xl" />
          <div className="p-6 space-y-4">
            <div className="h-40 w-40 bg-slate-700/50 rounded-xl mx-auto" />
            <div className="h-4 w-32 bg-slate-700/50 rounded mx-auto" />
            <div className="space-y-3">
              <div className="h-12 bg-slate-700/50 rounded-lg" />
              <div className="h-12 bg-slate-700/50 rounded-lg" />
              <div className="h-12 bg-slate-700/50 rounded-lg" />
            </div>
          </div>
          <div className="h-16 bg-slate-700/50 rounded-b-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:max-w-none print:w-full print:space-y-0">
      {/* Render each ticket */}
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

      {/* Order Summary */}
      {order.tickets.length > 1 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-center border border-slate-700/50 shadow-lg print:hidden">
          <p className="text-sm text-slate-300">
            <span className="text-white font-bold text-lg">{order.tickets.length}</span>
            <span className="text-slate-400 mx-2">tickets</span>
            <span className="text-slate-600">•</span>
            <span className="text-white font-bold text-lg ml-2">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount)}
            </span>
            <span className="text-slate-400 ml-1">{t("ticketView.total", "Total")}</span>
          </p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Ensure no scaling issues */
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
