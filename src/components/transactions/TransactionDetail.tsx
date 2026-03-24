"use client";

import React from "react";
import { 
  User, 
  CreditCard, 
  Ticket as TicketIcon, 
  Download,
  Calendar,
  ArrowLeft,
  Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { TransactionDetailApiResponse } from "@/types/transaction";



interface TransactionDetailViewProps {
  data?: TransactionDetailApiResponse;
  isLoading: boolean;
  onBack: () => void;
}

export function TransactionDetail({ data, isLoading, onBack }: TransactionDetailViewProps) {

  const tx = data?.data;
  const inv = tx?.invoice_info;

  if (isLoading) {
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
        <p className="text-muted-foreground mb-4">Transaction details not found.</p>
        <Button onClick={onBack}>Back to Transactions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 text-gray-600 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
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

      <h1 className="text-3xl font-bold text-gray-900">Transaction Detail</h1>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#E7F7EF] rounded-lg"><User className="h-5 w-5 text-[#0FAF62]" /></div>
            <h3 className="font-bold">Buyer</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">User Name</span><span className="font-semibold">{tx.user_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{tx.customer_email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Event Name</span><span className="font-semibold">{tx.event_title}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-semibold">{tx.ticket_count} {tx.ticket_count === 1 ? "ticket" : "tickets"}</span></div>
            {/* <div className="flex justify-between"><span className="text-gray-500">Ticket</span><span className="font-semibold">{tx.tier_name} Ticket</span></div>
          */}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#FEF3EB] rounded-lg"><CreditCard className="h-5 w-5 text-[#F38C39]" /></div>
            <h3 className="font-bold">Payment</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Gateway</span><span className="font-semibold capitalize">{tx.payment_gateway}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created At</span><span className="font-semibold">{formatDate(tx.created_at)}</span></div>
            <div className="mt-6 p-4 bg-[#F8F9FB] rounded-lg flex justify-between items-center">
              <span className="text-gray-500 text-xs">Total Amount</span>
              <span className="text-xl font-bold">${tx.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-end">
        <Button className="gap-2 bg-[#635BFF] hover:bg-[#5249E0] px-8 h-12">
          <Download className="h-4 w-4" /> Download PDF Invoice
        </Button>
      </div> */}
    </div>
  );
}