"use client";

import React from "react";
import { ChevronLeft, Calendar, Hash, Info, CreditCard, Ticket } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Refund } from "@/types/refund"; 
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface RefundDetailProps {
  data?: Refund;
  isLoading: boolean;
  onBack: () => void;
}

export function RefundDetail({ data, isLoading, onBack }: RefundDetailProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

if (isLoading) return <div className="py-20 text-center animate-pulse">Loading...</div>;

  if (!data) return (
    <div className="py-20 text-center">
      <p>{t("refunds.details.nofound","Refund details not found.")}</p>
      <button onClick={onBack} className="text-blue-500 underline mt-2">{t("refunds.details.back","Go Back")}</button>
    </div>
  );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("refunds.details.goback","Back to list")}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t("refunds.deatils.total","Total Refunded")}</p>
            <h2 className="text-3xl font-black text-gray-900">
              {data.Currency} {(data.Amount / 100).toLocaleString()}
            </h2>
            <div className={cn(
              "inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase",
              data.Status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            )}>
              {data.Status}
            </div>
          </div>

          <div className="space-y-4">
            <DetailRow icon={<Hash />} label={t("refunds.details.label.refundnumber","Refund Number")} value={data.RefundNumber} />
            {/* <DetailRow icon={<Ticket />} label="Order ID" value={data.order_id} /> */}
            <DetailRow icon={<CreditCard />} label={t("refunds.detilas.label.provider","Provider" )}value={data.PaymentProvider} className="capitalize" />
            <DetailRow 
              icon={<Calendar />} 
              label={t("refunds.details.label.daterequested","Date Requested" )}
              value={format(new Date(data.CreatedAt), "PPP p")} 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t("refunds.details.reason","Refund Reason")}</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {data.Reason || "No specific reason was provided."}
                </p>
              </div>
            </div>

            {data.RejectionReason && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl mt-4">
                <h4 className="text-sm font-bold text-red-700">{t("refunds.details.rejection","Rejection Note")}</h4>
                <p className="text-xs text-red-600 mt-1">{data.RejectionReason}</p>
              </div>
            )}
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
        {React.cloneElement(icon, { size: 18 } as React.SVGProps<SVGSVGElement>)}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">{label}</p>
        <p className={cn("text-sm font-semibold text-gray-800 break-all", className)}>{value || "N/A"}</p>
      </div>
    </div>
  );
}