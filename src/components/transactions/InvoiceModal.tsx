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

        <div id="invoice-content" className="p-4 space-y-4">
          {/* Company & Invoice Header */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">
                    {invoiceInfo.company_name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {invoiceInfo.company_address}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />{" "}
                    {invoiceInfo.company_phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {invoiceInfo.company_email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> VAT:{" "}
                    {invoiceInfo.tax_number}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </p>
                  <p className="font-mono font-bold text-blue-700 text-lg mt-1">
                    {invoiceInfo.invoice_number}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Payment Information */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-[#E7F7EF] rounded-lg">
                  <CreditCard className="h-4 w-4 text-[#0FAF62]" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  Payment Information
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Transaction ID</span>
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded-lg">
                    {transaction.id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Payment Gateway</span>
                  <span className="font-medium capitalize flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" />{" "}
                    {invoiceInfo.payment_gateway}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Issue Date</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />{" "}
                    {formatDate(invoiceInfo.issue_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    Transaction Reference
                  </span>
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded-lg">
                    {invoiceInfo.transaction_ref || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-[#FEF3EB] rounded-lg">
                  <User className="h-4 w-4 text-[#F38C39]" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  Customer Information
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Customer Name</span>
                  <span className="font-medium">{transaction.user_name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Email Address</span>
                  <span className="text-sm">{transaction.customer_email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Event</span>
                  <span className="font-medium text-blue-600">
                    {transaction.event_title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tickets</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Ticket className="h-3.5 w-3.5 text-gray-400" />{" "}
                    {transaction.ticket_count}{" "}
                    {transaction.ticket_count === 1 ? "ticket" : "tickets"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-semibold text-gray-900">Invoice Items</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr className="border-b">
                    <th className="text-left px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                      Item Description
                    </th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-sm text-gray-900">
                          {transaction.event_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ticket Purchase
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-sm">
                      {transaction.ticket_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invoiceInfo.currency}{" "}
                      {(
                        invoiceInfo.subtotal / transaction.ticket_count
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-sm">
                      {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  {transaction.tiers && transaction.tiers.length > 0 && (
                    <tr className="bg-gray-50/30">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm font-sm text-gray-600"
                      >
                        Subtotal:
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {invoiceInfo.currency} {invoiceInfo.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {invoiceInfo.tax_amount > 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm text-gray-600"
                      >
                        Tax (
                        {(
                          (invoiceInfo.tax_amount / invoiceInfo.subtotal) *
                          100
                        ).toFixed(0)}
                        %):
                      </td>
                      <td className="px-4 py-2 text-right">
                        {invoiceInfo.currency}{" "}
                        {invoiceInfo.tax_amount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">
                      <span className="text-md text-gray-900">
                        Total Amount
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-md text-blue-600">
                        {invoiceInfo.currency}{" "}
                        {invoiceInfo.total_amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Status & Footer */}
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

          {/* Footer Note */}
          <div className="text-center pt-3 border-t">
            <p className="text-xs text-gray-400">
              Thank you for your business!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}