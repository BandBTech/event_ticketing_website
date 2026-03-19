"use client";

import React from "react";
import { Receipt, Calendar, User, Mail, Download, Globe, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { TransactionDetailApiResponse } from "@/types/transaction";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TransactionDetailApiResponse; 
  isLoading: boolean;
}

export function TransactionDetail({ 
  isOpen, 
  onClose, 
  data, 
  isLoading 
}: TransactionDetailModalProps) {
    if (!isOpen) return null;
  const tx = data?.data;
  const inv = tx?.invoice_info;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-white rounded-lg border shadow-sm">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            {!isLoading && tx && (
              <Badge className={tx.status === "completed" ? "bg-green-100 text-green-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                {tx.status}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold mt-4">
            {isLoading ? <Skeleton className="h-7 w-32" /> : `Transaction Detail`}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-48 mt-1" /> : inv?.invoice_number}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (tx && inv) ? (
            <>
              {/* Event & Tier Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{tx.event_title}</h4>
                    <p className="text-xs text-muted-foreground">{tx.tier_name} × {tx.ticket_count} Tickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${tx.amount} {tx.currency}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(tx.created_at)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 justify-end text-right">
                    <Globe className="h-3.5 w-3.5" />
                    {tx.payment_gateway.toUpperCase()}
                  </div>
                </div>
              </div>

              <Separator className="border-dashed" />

              {/* Customer Info */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Billing To</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.user_name}</p>
                    <p className="text-xs text-muted-foreground">{tx.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${inv.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>${inv.tax_amount}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>${inv.total_amount} {inv.currency}</span>
                </div>
              </div>

              <Button className="w-full gap-2" variant="outline" size="lg">
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Failed to load details.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}