"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Download,
  Trash2,
  TrendingDown,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { BillingService } from "@/lib/billingService";
import { PaymentMethod, Transaction, Invoice } from "@/types/billing";
import { format } from "date-fns";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<
    "methods" | "transactions" | "invoices"
  >("methods");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [methods, trans, inv] = await Promise.all([
        BillingService.getPaymentMethods("user1"),
        BillingService.getTransactions("user1"),
        BillingService.getInvoices("user1")
      ]);
      setPaymentMethods(methods);
      setTransactions(trans);
      setInvoices(inv);
    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await BillingService.deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    } catch (error) {
      console.error("Failed to delete payment method:", error);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await BillingService.setDefaultPaymentMethod("user1", id);
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          isDefault: pm.id === id,
        }))
      );
    } catch (error) {
      console.error("Failed to set default payment method:", error);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      const url = await BillingService.downloadInvoice(id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const getPaymentMethodIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-5 w-5" />;
      case "paypal":
        return <span className="text-xs font-bold">PP</span>;
      case "apple_pay":
        return <span className="text-xs">🍎</span>;
      case "google_pay":
        return <span className="text-xs">G</span>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTransactionStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          Billing & Payments
        </h1>
        <p className="text-sm text-gray-600">
          Manage your payment methods and view transaction history
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {(["methods", "transactions", "invoices"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "methods" ? "Payment Methods" : tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Payment Methods Tab */}
              {activeTab === "methods" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Payment Methods</h2>
                    {/* <Button onClick={() => setShowAddPaymentDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </Button> */}
                  </div>

                  <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                      <Card key={method.id}>
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-accent rounded-lg">
                              {getPaymentMethodIcon(method.type)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {method.brand && `${method.brand} `}
                                {method.last4 && `•••• ${method.last4}`}
                                {method.email}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {method.expiryMonth &&
                                  method.expiryYear &&
                                  `Expires ${method.expiryMonth}/${method.expiryYear}`}
                                {method.type === "paypal" && "PayPal Account"}
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!method.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSetDefaultPaymentMethod(method.id)
                                }
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeletePaymentMethod(method.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "transactions" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Transaction History
                  </h2>
                  {transactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "purchase"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {transaction.type === "purchase" ? (
                                <DollarSign className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {transaction.description}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(
                                  new Date(transaction.createdAt),
                                  "MMM dd, yyyy • hh:mm a"
                                )}
                                {transaction.last4 &&
                                  ` • •••• ${transaction.last4}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                {transaction.type === "refund" && "-"}$
                                {transaction.amount.toFixed(2)}
                              </div>
                              <Badge
                                variant="secondary"
                                className={getTransactionStatusColor(
                                  transaction.status
                                )}
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                            {transaction.receiptUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(transaction.receiptUrl, "_blank")
                                }
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Invoices</h2>
                  {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(
                                new Date(invoice.createdAt),
                                "MMM dd, yyyy"
                              )}
                              {invoice.paidDate &&
                                ` • Paid ${format(
                                  new Date(invoice.paidDate),
                                  "MMM dd, yyyy"
                                )}`}
                            </div>
                            <div className="mt-2">
                              {invoice.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="text-sm text-muted-foreground"
                                >
                                  {item.description} x {item.quantity}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                ${invoice.total.toFixed(2)}
                              </div>
                              <Badge
                                variant={
                                  invoice.status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
