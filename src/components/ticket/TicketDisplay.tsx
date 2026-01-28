"use client";

import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import type { ViewTicketDetails, TicketItem } from "@/types/ticket";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

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
    <div className="bg-white max-w-2xl mx-auto rounded-lg shadow-xl overflow-hidden border border-neutral-200 print:shadow-none print:border-neutral-300 print:break-inside-avoid print:overflow-visible print:mb-8">
      {/* Event Banner */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-red-600 to-red-800 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <h2 className="text-3xl font-black text-white text-center px-4">
              {event.title}
            </h2>
          </div>
        )}
      </div>

      {/* Event Pass Header */}
      <div className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-neutral-300" />
          <h3 className="text-2xl font-bold text-neutral-900 tracking-wide">
            Event Pass
          </h3>
          <div className="flex-1 h-px bg-neutral-300" />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="px-4 pb-4 text-center">
        <p className="text-neutral-600 text-sm leading-relaxed">
          Dear Sir/Ma&apos;am,
        </p>
        <p className="text-neutral-600 text-sm leading-relaxed mt-1">
          We are pleased to invite you to the event. Please show this QR at the entrance to verify the pass.
        </p>
      </div>

      {/* QR Code Section */}
      <div className="py-4 flex flex-col items-center">
        <div className="bg-white p-4 border-2 border-neutral-200 rounded-lg">
          <QRCodeSVG
            value={ticket.qrData}
            size={180}
            level="M"
            includeMargin={false}
            minVersion={1}
          />
        </div>
        {/* Ticket Number */}
        <p className="mt-4 font-mono text-lg font-bold text-neutral-800 tracking-tight">
          {ticket.ticketNumber}
        </p>
      </div>

      {/* Tier & Event Info */}
      <div className="py-6 px-6 text-center border-t border-neutral-100">
        <p className="text-3xl font-black text-neutral-900 mb-3">
          {ticket.tierName}
        </p>
        <p className="text-neutral-600 text-sm">
          Venue: {event.venueName}, {event.address}
        </p>
        <p className="text-neutral-600 text-sm mt-1">
          Date: {format(new Date(event.startDate), "do MMMM, yyyy")}
        </p>
        <p className="text-neutral-500 text-xs mt-1">
          {format(new Date(event.startDate), "h:mm a")}
        </p>
      </div>

      {/* Organizer Info */}
      {event.organizer && (
        <div className="py-4 px-6 text-center border-t border-neutral-100 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Organized by
          </p>
          {event.organizer.logo ? (
            <img
              src={event.organizer.logo}
              alt={event.organizer.name}
              className="h-8 mx-auto object-contain"
            />
          ) : event.organizer.name ? (
            <p className="text-lg font-bold text-neutral-700">
              {event.organizer.name}
            </p>
          ) : null}
        </div>
      )}

      {/* Footer with Branding */}
      <div className="bg-neutral-800 text-white py-6 px-6 text-center">
        {/* Company Logo/Name */}
        {company?.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            className="h-10 mx-auto mb-4 object-contain"
          />
        ) : (
          <p className="text-xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            {company?.name || "TIMRO TICKET"}
          </p>
        )}

        {/* Price */}
        <p className="text-sm text-neutral-300 mb-2">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(ticket.price)}
        </p>

        {/* Validity Notice */}
        <p className="text-xs text-amber-400 font-medium mt-4">
          Validity: This Pass is valid for a single individual only.
        </p>
      </div>

      {/* Ticket Counter for multiple tickets */}
      {total > 1 && (
        <div className="bg-neutral-900 text-white text-center py-2 text-xs font-bold">
          Ticket {index + 1} of {total}
        </div>
      )}
    </div>
  );
}

export function TicketDisplay({ order, onPrint, isLoading }: TicketDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl animate-pulse aspect-[3/5]" />
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
        <div className="bg-neutral-100 rounded-lg p-4 text-center print:hidden">
          <p className="text-sm text-neutral-600">
            <span className="font-bold">{order.tickets.length}</span> tickets •
            <span className="font-bold ml-1">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount)}
            </span> total
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
