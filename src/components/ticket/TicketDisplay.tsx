"use client";

import { useRef } from "react";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Printer,
  Ticket as TicketIcon,
  CheckCircle,
  Download,
  ShareNetwork,
  Info
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewTicketDetails } from "@/types/ticket";
import { useTranslations } from "next-intl";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface TicketDisplayProps {
  ticket: ViewTicketDetails;
  onPrint?: () => void;
  isLoading?: boolean;
}

export function TicketDisplay({ ticket, onPrint, isLoading }: TicketDisplayProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const qrCodeUrl = ticket.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(ticket.ticket_number)}`;

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl animate-pulse aspect-[3/4]" />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Printable Area */}
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-100 print:shadow-none print:border-neutral-200 relative group"
      >
        {/* Top Section: Event Hero */}
        <div className="relative h-72 sm:h-80 bg-neutral-900 overflow-hidden">
          {ticket.event.imageUrl ? (
            <img
              src={ticket.event.imageUrl}
              alt={ticket.event.title}
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 sm:p-10 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                {t("ticketView.title")}
              </span>
              <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/20">
                <CheckCircle weight="fill" size={14} />
                {t("ticketView.verifiedPurchase")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {ticket.event.title}
            </h1>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-12">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Details Column */}
            <div className="space-y-10">
              <div className="space-y-8">
                <div className="flex gap-4 items-start translate-x-0">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                    <Calendar weight="duotone" size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t("ticketView.dateTime")}</p>
                    <p className="text-xl font-black text-neutral-900 leading-tight">
                      {format(new Date(ticket.event.startDate), "EEEE, MMM dd, yyyy")}
                    </p>
                    <p className="text-neutral-500 font-bold bg-neutral-100 self-start px-2 py-0.5 rounded text-sm">
                      {format(new Date(ticket.event.startDate), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50/50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                    <MapPin weight="duotone" size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t("ticketView.venue")}</p>
                    <p className="text-xl font-black text-neutral-900 leading-tight">
                      {ticket.event.venue?.name || "TBA"}
                    </p>
                    <p className="text-neutral-500 font-bold text-sm">
                      {ticket.event.venue?.address || ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50/50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                    <TicketIcon weight="duotone" size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t("ticketView.ticketType")}</p>
                    <p className="text-xl font-black text-neutral-900 leading-tight">
                      {ticket.tier?.name || "General Admission"}
                    </p>
                    <p className="text-purple-600 font-black text-sm">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticket.tier?.currency || 'USD' }).format(ticket.tier?.price || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pass Holder Info */}
              <div className="pt-8 border-t border-neutral-100">
                <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">{t("ticketView.passHolder")}</p>
                    <p className="text-2xl font-black text-neutral-900 tracking-tight">
                      {ticket.guest?.first_name} {ticket.guest?.last_name}
                    </p>
                    <p className="text-sm text-neutral-500 font-bold mt-1 opacity-70">
                      {ticket.guest?.email}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info weight="fill" size={60} />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Column */}
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="relative group/qr p-6 bg-white border-4 border-dashed border-neutral-100 rounded-[3rem] transition-all duration-500 hover:border-blue-200 hover:scale-[1.02] active:scale-95">
                <div className="bg-white p-4 rounded-[2.5rem] shadow-inner">
                  <img
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-48 h-48 sm:w-60 sm:h-60 mix-blend-multiply"
                  />
                </div>
                {/* QR HUD */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-5 py-2 rounded-full border border-white/20 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t("ticketView.scanAtEntrance")}</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t("ticketView.ticketId")}</p>
                <p className="font-mono text-xl font-black tracking-tighter bg-blue-50 text-blue-800 px-6 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
                  {ticket.ticket_number}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Section: Notes / Branding */}
          <div className="pt-12 border-t border-neutral-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-6">
                <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {t("ticketView.instructions.present")}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {t("ticketView.instructions.noShare")}
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">{t("ticketView.serviceProvider")}</p>
                <p className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  TIMRO TICKET
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Perforation Pattern */}
        <div className="absolute bottom-[28%] left-0 -translate-x-1/2 flex flex-col gap-2 print:hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-neutral-50 border border-neutral-100 shadow-inner" />
          ))}
        </div>
        <div className="absolute bottom-[28%] right-0 translate-x-1/2 flex flex-col gap-2 print:hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-neutral-50 border border-neutral-100 shadow-inner" />
          ))}
        </div>
      </div>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 0;
            size: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
