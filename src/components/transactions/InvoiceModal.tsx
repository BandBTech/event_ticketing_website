"use client";

import React, { useRef } from "react";
import {
  X,
  Download,
  Phone,
  Mail,
  Hash,
  Calendar,
  CreditCard,
  Receipt,
  Building2,
  User,
  Ticket,
  Printer,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InvoiceInfo, TransactionDetail } from "@/types/transaction";
import { formatDate } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceInfo?: InvoiceInfo;
  transaction?: TransactionDetail;
}

export function InvoiceModal({
  open,
  onOpenChange,
  invoiceInfo,
  transaction,
}: InvoiceModalProps) {
  if (!invoiceInfo || !transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl"
        onInteractOutside={() => onOpenChange(false)}
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        {/* Simple Header */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Receipt className="h-5 w-5 text-blue-600" />
              Invoice Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div
          id="invoice-preview"
          className="p-8 bg-white shadow-inner mx-auto my-4 max-w-[700px] border"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-10">
            <div className="text-blue-600 font-bold tracking-widest text-sm">
              TIMRO TICKET
            </div>
            <div className="text-gray-500 text-xs">
              NO. {invoiceInfo.invoice_number}
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl font-bold text-slate-900 mb-2 tracking-tighter">
            INVOICE
          </h1>
          <div className="text-sm text-slate-500 mb-10">
            <span className="font-bold text-slate-900">Date:</span>{" "}
            {formatDate(invoiceInfo.issue_date)}
          </div>

          {/* Address Grid */}
          <div className="grid grid-cols-2 gap-10 mb-12">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">
                Billed to:
              </h3>
              <p className="font-bold text-slate-900">
                {transaction.user_name}
              </p>
              <p className="text-sm text-slate-500">
                {transaction.customer_email}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">
                From:
              </h3>
              <p className="font-bold text-slate-900">
                {invoiceInfo.company_name}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                {invoiceInfo.company_address}
              </p>
              <p className="text-sm text-slate-500">
                {invoiceInfo.company_email}
              </p>
            </div>
          </div>

          {/* Table Area */}
          <div className="w-full mb-8">
            <div className="grid grid-cols-12 bg-slate-50 p-3 rounded text-[10px] font-bold text-slate-500 uppercase">
              <div className="col-span-6">Item Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="grid grid-cols-12 p-4 border-b border-slate-100 items-center">
              <div className="col-span-6">
                <p className="font-bold text-slate-900">
                  {transaction.event_title}
                </p>
                <p className="text-xs text-slate-400">Standard Ticket Entry</p>
              </div>
              <div className="col-span-2 text-center text-sm">
                {transaction.ticket_count}
              </div>
              <div className="col-span-2 text-right text-sm">
                {invoiceInfo.currency}{" "}
                {(invoiceInfo.subtotal / transaction.ticket_count).toFixed(2)}
              </div>
              <div className="col-span-2 text-right font-bold">
                {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex justify-end mb-20">
            <div className="w-48 border-t-2 border-blue-600 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                {invoiceInfo.currency} {invoiceInfo.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Decorative Footer Mockup (Optional for Modal) */}
          <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
            <strong>Payment method:</strong> {invoiceInfo.payment_gateway}
            <p>Note: Thank you for choosing Timro Ticket</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#E7F7EF] text-[#0FAF62] hover:bg-[#E7F7EF] border-none px-3 py-1.5">
                {transaction.status === "completed"
                  ? "✓ Payment Completed"
                  : transaction.status}
              </Badge>
            </div>
            <div className="flex gap-3">
              <PDFDownloadLink
                document={
                  <InvoicePDF
                    invoiceInfo={invoiceInfo}
                    transaction={transaction}
                  />
                }
                fileName={`invoice-${invoiceInfo.invoice_number}.pdf`}
              >
                {({ loading, error }) => {
                  if (error) {
                    console.error("PDF Error:", error);
                    return (
                      <Button className="gap-2 bg-red-600 hover:bg-red-700">
                        Error: {error.message}
                      </Button>
                    );
                  }

                  return (
                    <Button
                      disabled={loading}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  );
                }}
              </PDFDownloadLink>
            </div>
            </div>
        </div>
        

      </DialogContent>
    </Dialog>
  );
}
