"use client";

import React from "react";
import {
  ChevronLeft,
  Calendar,
  Hash,
  Info,
  CreditCard,
  Ticket,
  User,
  Building2,
  CalendarDays,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { cn, formatTransactionDate } from "@/lib/utils";
import { Refund, RefundDetailData } from "@/types/refund";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PageTitle } from "../pagetitle/PageTitle";

interface RefundDetailProps {
  data?: RefundDetailData;
  isLoading: boolean;
  onBack: () => void;
}

export function RefundDetail({ data, isLoading, onBack }: RefundDetailProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (isLoading)
    return <div className="py-20 text-center animate-pulse">Loading...</div>;

  if (!data)
    return (
      <div className="py-20 text-center">
        <p>{t("refunds.details.nofound", "Refund details not found.")}</p>
        <button onClick={onBack} className="text-blue-500 underline mt-2">
          {t("refunds.details.back", "Go Back")}
        </button>
      </div>
    );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-6">
      <PageTitle title={t("refund.title","My Refunds" )}/>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          {t("refunds.details.goback", "Back to list")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.02] text-slate-900 pointer-events-none">
              <Hash size={140} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {t("refunds.deatils.total", "Total Refunded")}
            </p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {data.event?.symbol || "$"} {Number(data.amount || 0).toFixed(2)}
            </h2>

            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm",
                data.status === "succeeded" &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                (data.status === "pending" || data.status === "processing") &&
                  "bg-amber-50 text-amber-700 border-amber-200/60",
                data.status === "rejected" &&
                  "bg-rose-50 text-rose-700 border-rose-200/60",
              )}
            >
              {t(`status.${data.status?.toLowerCase()}`, data.status)}
            </span>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden divide-y divide-slate-50">
            <div className="p-4 space-y-4">
              <DetailRow
                icon={<Hash />}
                label={t("refunds.details.label.refundnumber", "Refund Number")}
                value={data.refund_number}
              />
              <DetailRow
                icon={<Calendar />}
                label={t(
                  "refunds.details.label.daterequested",
                  "Date Requested",
                )}
                value={formatTransactionDate(data.created_at, locale || "en")}
              />
            </div>

            <div className="p-4 space-y-4">
              <DetailRow
                icon={<CreditCard />}
                label={t("refunds.detilas.label.provider", "Gateway Provider")}
                value={t(
                  `payment.${data.transaction?.gateway?.toLowerCase()}`,
                  data.transaction?.gateway || "—",
                )}
                className="capitalize"
              />
              <DetailRow
                icon={<CalendarDays />}
                label={t("refunds.details.label.txdate", "Purchase Date")}
                value={formatTransactionDate(
                  data.transaction?.created_at,
                  locale || "en",
                )}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-50">
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                {t("refunds.details.refundrequest", "Refund Requested By")}
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <DetailRow
                icon={<User />}
                label={t("refunds.details.label.user_name", "Full Name")}
                value={data.initiated_by?.name}
              />
              <DetailRow
                icon={<Mail />}
                label={t("refunds.details.label.user_email", "Email Address")}
                value={data.initiated_by?.email}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-50">
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                {t(
                  "refunds.details.sections.event",
                  "Event & Organizer Details",
                )}
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <DetailRow
                icon={<Building2 />}
                label={t("refunds.details.label.eventtitle", "Event Name")}
                value={data.event?.title}
                className="text-base font-bold text-slate-800"
              />
              <DetailRow
                icon={<User />}
                label={t("refunds.details.label.organizer", "Organizer Name")}
                value={data.organizer?.name}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-50 flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-md shrink-0">
                <Info className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                {t("refunds.details.reason", "Refund Reason")}
              </h4>
            </div>
            <div className="p-5">
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-sm text-slate-600 leading-relaxed italic font-medium break-words">
                {data.reason ||
                  t(
                    "refunds.details.noreason",
                    "No specific reason was provided.",
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactElement;
  label: string;
  value: string | number | undefined;
  className?: string;
}

function DetailRow({ icon, label, value, className = "" }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 p-1">
      <div className="text-gray-400">
        {React.cloneElement(icon, {
          size: 18,
        } as React.SVGProps<SVGSVGElement>)}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-semibold text-gray-800 break-all",
            className,
          )}
        >
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
