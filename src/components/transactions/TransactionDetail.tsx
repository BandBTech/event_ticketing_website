"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  CreditCard, 
  Ticket as TicketIcon, 
  Download,
  Calendar,
  ArrowLeft,
  Receipt,
  Eye,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { TransactionDetailApiResponse } from "@/types/transaction";
import { InvoiceModal } from "./InvoiceModal";
import { InvoicePDF } from "./InvoicePDF";
import { pdf } from "@react-pdf/renderer";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface TransactionDetailViewProps {
  data?: TransactionDetailApiResponse;
  isLoading: boolean;
  onBack: () => void;
}

export function TransactionDetail({ data, isLoading, onBack }: TransactionDetailViewProps) {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const tx = data?.data;
  const inv = tx?.invoice_info;
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const handleViewInvoice = async () => {
    if (!inv || !tx) return;
    
    try {
      setIsPdfGenerating(true);
      // Generate PDF blob
      const blob = await pdf(<InvoicePDF invoiceInfo={inv} transaction={tx}  />).toBlob();
      // Create URL for the blob
      const url = URL.createObjectURL(blob);
      // Open in new window
      window.open(url, "_blank");
      // Clean up URL after a delay to allow the window to load
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

if (isLoading || !data || !tx) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

if (!tx || !inv) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
      <p className="text-muted-foreground mb-4">{t("setting.menu.transaction.nodetails","Transaction details not found.")}</p>
      <Button onClick={onBack}>{t("setting.menu.transaction.button.back","Back to Transactions")}</Button>
    </div>
  );
}

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 text-gray-600 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("setting.menu.transaction.button.backhistory","Back to History")}
        </Button>
        <div className="flex gap-2">
          <Badge className="bg-[#E7F7EF] text-[#0FAF62] hover:bg-[#E7F7EF] border-none px-3 py-1 capitalize">
            {tx.status}
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1">
            {tx.payment_gateway}
          </Badge>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">{t("setting.menu.transaction.detail","Transaction Detail")}</h1>
      
      {/* Event Hero Section */}
      <div className="relative h-40 w-full rounded-2xl overflow-hidden border shadow-sm">
        <img 
          src={tx.event.banner_image} 
          alt={tx.event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {tx.event.title}
          </h1>
        </div>
      </div>
      
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#E7F7EF] rounded-lg"><User className="h-5 w-5 text-[#0FAF62]" /></div>
            <h3 className="font-bold">{t("setting.menu.transaction.buyer.title","Buyer")}</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.name","User Name")}</span><span className="font-semibold">{tx.user.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.email","Email")}</span><span className="font-semibold">{tx.user.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.EventName","Event Name")}</span><span className="font-semibold">{tx.event.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.quantity","Quantity")}</span><span className="font-semibold">{tx.ticket_count} {tx.ticket_count === 1 ? "ticket" : "tickets"}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#FEF3EB] rounded-lg"><CreditCard className="h-5 w-5 text-[#F38C39]" /></div>
            <h3 className="font-bold">{t("setting.menu.transaction.buyer.payment","Payment")}</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.gateway","Gateway")}</span><span className="font-semibold capitalize">{tx.payment_gateway}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t("setting.menu.transaction.buyer.created","Created At")}</span><span className="font-semibold">{formatDate(tx.created_at)}</span></div>
            <div className="mt-6 p-4 bg-[#F8F9FB] rounded-lg flex justify-between items-center">
              <span className="text-gray-500 text-xs">{t("setting.menu.transaction.buyer.total","Total Amount")}</span>
              <span className="text-xl font-bold">{tx.currency} {tx.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={handleViewInvoice}
          disabled={isPdfGenerating}
          className="gap-2"
        >
          {isPdfGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
         {t("setting.menu.transaction.buyer.invoice","View Invoice")} 
        </Button>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        invoiceInfo={inv}
        transaction={tx}
      />
    </div>
  );
}