"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket as TicketIcon,
  QrCode,
  Download,
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronLeftIcon,
  ChevronRightIcon,
  Eraser,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketItems, ViewTicketDetails } from "@/types/ticket";
import { useTransactionDetails, useUserTickets } from "@/hooks/useTickets";
import { QRCodeSVG } from "qrcode.react";
import { cn, formatDate, formatTime } from "@/lib/utils";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { CancelTicketDialog } from "@/components/tickets/CancelTicketDialog";
import { useCancelTicket } from "@/hooks/useTickets";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { TicketDisplay } from "@/components/tickets/TicketDisplay";
import { ticketService } from "@/services/ticketService";
import { TicketPDFDownload } from "@/components/tickets/TicketPDFDownload";

// Check if event is upcoming (start date is in the future)
const isUpcoming = (startDate: string) => {
  return new Date(startDate) > new Date();
};

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allTickets, setAllTickets] = useState<ViewTicketDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicketForQR, setSelectedTicketForQR] =
    useState<TicketItems | null>(null);
  const [currentTicketQR, setCurrentTicketQR] = useState<number>(0);
  const [modalTicketsList, setModalTicketsList] = useState<TicketItems[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<
    string | null
  >(null);
  const [selectedTicketForCancel, setSelectedTicketForCancel] = useState<
    string | null
  >(null);
  const [printData, setPrintData] = useState<ViewTicketDetails | null>(null);

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const cancelMutation = useCancelTicket();

  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("id");

  // const [view, setView] = useState<"list" | "detail">(
  //   selectedOrderId ? "detail" : "list");

  //   const [selectedOrder, setSelectedOrder] = useState<ViewTicketDetails | null>(
  //   null,
  // );

  const {
    data: detailTickets,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useTransactionDetails(selectedOrderId ?? undefined);
  // Use the existing query hook
  const {
    data: responseData,
    isLoading,
    isFetching,
    error,
  } = useUserTickets(currentPage, statusFilter, searchQuery);
  const ticketsArray = responseData?.tickets || [];
  const pagination = responseData?.pagination;
  const view = selectedOrderId ? "detail" : "list";
  // Filter tickets based on active tab and search
  const filteredTickets = allTickets.filter((order: ViewTicketDetails) => {
    const eventDate = order.event.startDate;
    const isEventUpcoming = isUpcoming(eventDate);

    // Tab filter
    if (activeTab === "upcoming" && !isEventUpcoming) return false;
    if (activeTab === "past" && isEventUpcoming) return false;

    // Status filter
    if (statusFilter !== "all") {
      const hasMatchingStatus = order.tickets.some((t) =>
        t.checkedIn ? statusFilter === "used" : statusFilter === "active",
      );
      if (!hasMatchingStatus) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (order.event?.title?.toLowerCase() ?? "").includes(query) ||
        (order.event?.venueName?.toLowerCase() ?? "").includes(query) ||
        order.tickets?.some((t) =>
          (t.ticketNumber?.toLowerCase() ?? "").includes(query),
        )
      );
    }

    return true;
  });

  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  const handleViewTickets = (order: ViewTicketDetails) => {
    router.push(`${pathname}?id=${order.orderId}`);
  };
  const handleBackToList = () => {
    router.push(pathname);
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderForCancel(orderId);
    setSelectedTicketForCancel(null);
    setShowCancelDialog(true);
  };

  const handleCancelTicket = (ticketId: string) => {
    setSelectedTicketForCancel(ticketId);
    setSelectedOrderForCancel(null);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedOrderForCancel && !selectedTicketForCancel) return;

    try {
      // Cancel specific ticket if selected
      if (selectedTicketForCancel) {
        await cancelMutation.mutateAsync({
          ticketId: selectedTicketForCancel,
          data: { reason },
        });
      } else if (selectedOrderForCancel && detailTickets) {
        // Cancel all active tickets in the order
        const activeTickets = detailTickets.tickets.filter(
          (t) => !t.is_checked_in,
        );

        for (const ticket of activeTickets) {
          await cancelMutation.mutateAsync({
            ticketId: ticket.ticketId,
            data: { reason },
          });
        }
      }

      // Close dialog on success
      setShowCancelDialog(false);
      setSelectedOrderForCancel(null);
      setSelectedTicketForCancel(null);
    } catch (error) {
      // Error toast is shown by apiClient, just close the dialog
      setShowCancelDialog(false);
      setSelectedOrderForCancel(null);
      setSelectedTicketForCancel(null);
    }
  };

  const handleNextQR = () => {
    if (currentTicketQR < modalTicketsList.length - 1) {
      const nextIndex = currentTicketQR + 1;
      setCurrentTicketQR(nextIndex);
      setSelectedTicketForQR(modalTicketsList[nextIndex]);
    }
  };

  const handlePrevQR = () => {
    if (currentTicketQR > 0) {
      const prevIndex = currentTicketQR - 1;
      setCurrentTicketQR(prevIndex);
      setSelectedTicketForQR(modalTicketsList[prevIndex]);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.has_next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (responseData?.tickets) {
      setAllTickets((prev) => {
        if (currentPage === 1) return responseData.tickets;
        const existingIds = new Set(prev.map((t) => t.orderId));
        const newUnique = responseData.tickets.filter(
          (t) => !existingIds.has(t.orderId),
        );
        return [...prev, ...newUnique];
      });
    }
  }, [responseData, currentPage]);

  useEffect(() => {
    if (error) console.error("User Tickets Error:", error);
    if (isDetailError) console.error("Detail Tickets Error:", isDetailError);
  }, [error, isDetailError]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t("setting.menu.tickets.title")}
        </h1>
        <Card>
          <CardContent className="text-center py-12">
            <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("setting.menu.tickets.error", "Error loading tickets")}
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : t(
                    "setting.menu.tickets.messageError",
                    "Failed to load tickets. Please try again.",
                  )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reusable PDF generation function
  const generateTicketPDF = async (
    order: ViewTicketDetails,
    ticketId: string,
  ): Promise<Blob> => {
    const ticket = order.tickets.find((t) => t.ticketId === ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const singleTicketDetails = {
      ...order,
      tickets: [ticket],
    };

    setPrintData(singleTicketDetails);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const element = document.getElementById("pdf-hidden-container");
    if (!element) throw new Error("Container not found");

    const dataUrl = await toPng(element, {
      backgroundColor: "white",
      pixelRatio: 2,
      quality: 0.95,
      cacheBust: true,
    });
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    return pdf.output("blob");
  };

  const handleDownloadFromList = async (
    transactionId: string,
    ticketId: string,
  ) => {
    const loadingToastId = "download-ticket";

    try {
      toast.loading("Generating PDF...", { id: loadingToastId });

      const fullDetails = await ticketService.getTransactionById(transactionId);
      const pdfBlob = await generateTicketPDF(fullDetails, ticketId);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Ticket-${ticketId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: loadingToastId });

      setTimeout(() => setPrintData(null), 2000);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to generate PDF", { id: loadingToastId });
      setPrintData(null);
    }
  };

  const handleShareTicket = async (
    order: ViewTicketDetails,
    ticketId: string,
  ) => {
    const loadingToastId = "share-ticket";

    try {
      toast.loading("Preparing ticket for sharing...", { id: loadingToastId });

      const ticket = order.tickets.find((t) => t.ticketId === ticketId);
      if (!ticket) throw new Error("Ticket not found");

      // Create a single ticket version
      const singleTicketDetails = {
        ...order,
        tickets: [ticket],
      };

      setPrintData(singleTicketDetails);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const element = document.getElementById("pdf-hidden-container");
      if (!element) throw new Error("Container not found");

      // Generate PDF as blob
      const dataUrl = await toPng(element, {
        backgroundColor: "white",
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
      });
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], `Ticket-${ticket.ticketNumber}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({
          title: `${order.event.title} Ticket`,
          text: `My ticket for ${order.event.title} on ${formatDate(order.event.startDate)}`,
          files: [pdfFile],
        });
        toast.success("Ticket shared successfully!", { id: loadingToastId });
      } else {
        toast.error(
          "Your browser doesn't support sharing. Please download and share manually.",
          {
            id: loadingToastId,
          },
        );
      }

      setTimeout(() => setPrintData(null), 2000);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
        toast.error("Could not share ticket. Please try again.", {
          id: loadingToastId,
        });
      } else {
        toast.dismiss(loadingToastId);
      }
      setPrintData(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t("setting.menu.tickets.title", "My Tickets")}
        </h1>
        <p className="text-sm text-gray-600">
          {t(
            "setting.menu.tickets.subtitle",
            "Manage and view all your event tickets",
          )}
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          {/* Search and Filters */}
          {/* Search and Filters - Synchronized with Transaction UI */}
          {view === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
              {/* Search Bar - Spans 7 columns on desktop */}
              <div className="relative md:col-span-7 lg:col-span-8">
                <Search
                  className={cn(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                    isSearchFocused ? "text-blue-500" : "text-gray-400",
                  )}
                />
                <input
                  type="text"
                  placeholder={t(
                    "setting.menu.tickets.search",
                    "Search tickets...",
                  )}
                  className="w-full h-[42px] pl-10 pr-10 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status & Clear Button Group - Spans 5 columns on desktop */}
              <div className="flex md:col-span-5 lg:col-span-4 gap-2">
                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full h-[42px] bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t(
                          "setting.menu.tickets.selectValue.allStatus",
                          "All Status",
                        )}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("setting.menu.tickets.selectValue.active", "Active")}
                      </SelectItem>
                      <SelectItem value="used">
                        {t("setting.menu.tickets.selectValue.used", "Used")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Button - Only shows if filters are active */}
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="flex items-center justify-center px-3 h-[42px] bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all text-red-600 active:scale-95 shrink-0"
                    title="Clear Filters"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tabs
          <div className="flex gap-4 mb-6 border-b">
            {(['upcoming', 'past', "all"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "All Tickets" : `${tab} Events`}
              </button>
            ))}
          </div>
          */}
          {view === "detail" && (
            <Button
              variant="ghost"
              className="-ml-2 text-gray-600 hover:text-primary"
              onClick={handleBackToList}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              {t("setting.menu.tickets.button.back", "Back to ticket list")}
            </Button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="pb-2 px-1 text-3xl font-bold text-gray-900">
                {view === "list" ? "All Tickets" : "Ticket Details"}
              </h1>

              <p className="text-sm text-gray-600">{view === "list"}</p>
            </div>
            {/*{view === "detail" &&
              detailTickets &&
              detailTickets.tickets?.some((t) => !t.checkedIn) && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-red-50!"
                  onClick={() => handleCancelOrder(detailTickets.orderId)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending
                    ? t(
                        "cancelTicket.confirmationDialog.cancelling",
                        "Cancelling...",
                      )
                    : t("cancelTicket.button.cancelOrder", "Cancel Order")}
                </Button>
              )}*/}
          </div>

          {/* Tickets list */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="w-full group overflow-hidden transition-all duration-300 bg-white/60 backdrop-blur-[20px] border border-white/10 shadow-[0px_8px_8px_0px_rgba(0,0,0,0.05)] rounded-[10px]"
                >
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    {/* Image Skeleton */}
                    <div className="w-full h-48 md:w-48 md:h-auto shrink-0 bg-gray-200 animate-pulse" />

                    {/* Content Skeleton */}
                    <div className="flex-1 flex flex-col sm:flex-row justify-between p-5 gap-6">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2 col-span-full">
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Right Side Skeleton */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:min-w-[150px] pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-6 border-gray-100">
                        <div className="sm:text-right space-y-1">
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("setting.menu.tickets.notickets", "No Tickets Found")}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming events"
                    : activeTab === "past"
                      ? "You don't have any past events"
                      : "No tickets match your search criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {view === "list" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                  {filteredTickets.map((order: ViewTicketDetails) => (
                    <Card
                      key={order.orderId}
                      onClick={() => handleViewTickets(order)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleViewTickets(order);
                        }
                      }}
                      className={cn(
                        "w-full group overflow-hidden transition-all duration-300",
                        "hover:scale-[1.01] hover:shadow-lg hover:border-primary/20",
                        "bg-white/60 backdrop-blur-[20px]",
                        "border border-white/10 shadow-[0px_8px_8px_0px_rgba(0,0,0,0.05)]",
                        "rounded-[10px] cursor-pointer",
                      )}
                    >
                      <CardContent className="p-0 flex flex-col md:flex-row">
                        {/* 1. Image: Full width on mobile, fixed width on desktop */}
                        <div
                          className="w-full h-48 md:w-48 md:h-auto shrink-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${order.event.imageUrl})`,
                          }}
                        />

                        {/* 2. Main Wrapper: Spreads content and status apart */}
                        <div className="flex-1 flex flex-col sm:flex-row justify-between p-5 gap-6">
                          {/* Left Side: Event Details */}
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-xl text-gray-900 leading-tight line-clamp-1">
                                {order.event.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary shrink-0"
                              >
                                <TicketIcon className="w-3 h-3 mr-1" />
                                {order.ticketCount}{" "}
                                {order.ticketCount === 1 ? "Ticket" : "Tickets"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">
                                  {formatDate(order.event.startDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary shrink-0" />
                                <span>{formatTime(order.event.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 col-span-full">
                                <MapPin className="h-4 w-4 text-primary shrink-0" />
                                <span className="line-clamp-1">
                                  {order.event.venueName}, {order.event.address}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Status & Action */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:min-w-[150px] pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-6 border-gray-100">
                            <div className="sm:text-right">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                                Payment Status
                              </p>
                              <div className="flex items-center sm:justify-end gap-1.5">
                                {order.transactionStatus === "completed" && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                )}
                                <p
                                  className={cn(
                                    "font-bold text-sm capitalize",
                                    order.transactionStatus === "completed"
                                      ? "text-green-600"
                                      : "text-amber-600",
                                  )}
                                >
                                  {order.transactionStatus}
                                </p>
                              </div>
                            </div>

                            <Button
                              size="default"
                              className="px-6 bg-primary hover:bg-primary/90 w-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTickets(order);
                              }}
                            >
                              View Tickets
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pagination?.has_next && (
                    <div className="text-center py-4">
                      <Button
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        className="min-w-[160px]"
                      >
                        {isFetching ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            Loading...
                          </span>
                        ) : (
                          "Load More"
                        )}
                      </Button>

                      {pagination && (
                        <p className="text-gray-500 text-sm mt-3">
                          Showing {allTickets.length} of {pagination.total}{" "}
                          tickets
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* --- DETAIL VIEW --- */}
          {view === "detail" && detailTickets && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Header with Event Summary */}
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row gap-6">
                {/* Event Image */}
                <div className="relative shrink-0 w-48 h-48">
                  <Image
                    src={
                      detailTickets?.event.imageUrl || "/placeholder-event.jpg"
                    }
                    fill
                    alt="Event"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md border-2 border-white"
                  />
                  {/* {detailTickets.event.timezone && (
                    <Badge
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 text-[10px] bg-white shadow-sm"
                    >
                      {detailTickets.event.timezone}
                    </Badge>
                  )}  */}
                </div>

                {/* Event Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                        {detailTickets.event.title}
                      </h2>
                    </div>

                    {/* Date & Time Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground uppercase font-bold mr-1">
                          Starts:
                        </span>
                        {formatDate(detailTickets.event.startDate)}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        {formatTime(detailTickets.event.startDate)}
                      </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700 opacity-80">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground uppercase font-bold mr-1">
                          Ends:
                        </span>
                        {formatDate(detailTickets.event.endDate)}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        {formatTime(detailTickets.event.endDate)}
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold flex items-start gap-1.5 text-gray-800">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      {detailTickets.event.venueName}
                    </p>
                    <p className="text-xs text-muted-foreground ml-5 italic">
                      {detailTickets.event.address}
                    </p>
                  </div>

                  {/* Metadata: Order ID & Status */}
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-primary/10">
                    <Badge
                      variant="outline"
                      className="bg-white/50 text-[10px] uppercase tracking-wider"
                    >
                      Payment Status: {detailTickets.transactionStatus}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-white/50 text-[10px] uppercase tracking-wider"
                    >
                      Purchased: {formatDate(detailTickets.purchaseDate)}
                      <Clock className="h-4 w-4 text-primary" />{" "}
                      {formatTime(detailTickets.purchaseDate)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              {isDetailLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : detailTickets && detailTickets.tickets?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {detailTickets?.tickets.map((ticket) => (
                    <Card
                      key={ticket.ticketId}
                      className="border-none shadow-sm overflow-hidden bg-white border-l-4 border-l-primary"
                    >
                      <CardContent className="p-0 flex flex-col md:flex-row">
                        {/* Ticket Data */}
                        <div className="flex-1 p-6 border-r border-dashed border-gray-100">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Badge variant="secondary" className="mb-1">
                                {ticket.tierName?.name || "General"}
                              </Badge>
                              <p className="text-xl font-mono font-bold">
                                Ticket Number : {ticket.ticketNumber}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                ticket.is_checked_in
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700",
                              )}
                            >
                              {ticket.is_checked_in ? "Used" : "Active"}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                handleDownloadFromList(
                                  detailTickets.orderId,
                                  ticket.ticketId,
                                )
                              }
                            >
                              <Download className="h-3.5 w-3.5 mr-1" /> Download
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                handleShareTicket(
                                  detailTickets,
                                  ticket.ticketId,
                                )
                              }
                            >
                              <QrCode className="h-3.5 w-3.5 mr-1" /> Share
                            </Button>
                            {!ticket.is_checked_in && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-red-50 border-destructive/20"
                                onClick={() =>
                                  handleCancelTicket(ticket.ticketId)
                                }
                                disabled={cancelMutation.isPending}
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* QR/Barcode Side */}
                        <div className="w-full md:w-48 bg-gray-50 p-6 flex flex-col items-center justify-center gap-3">
                          <QRCodeSVG
                            value={ticket.qrData}
                            size={100}
                            level="H"
                            includeMargin
                          />{" "}
                          <Button
                            className="w-full text-xs h-8"
                            onClick={() => {
                              const ticketIndex =
                                detailTickets.tickets.findIndex(
                                  (t) => t.ticketId === ticket.ticketId,
                                );
                              setModalTicketsList(detailTickets.tickets);
                              setCurrentTicketQR(ticketIndex);
                              setSelectedTicketForQR(ticket);
                              setShowQRModal(true);
                            }}
                          >
                            View QR Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">
                    No individual tickets found in this transaction.
                  </p>
                  <p className="text-xs text-gray-400">ID:</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {ticketsArray.find((order) =>
                order.tickets.some(
                  (t) => t.ticketId === selectedTicketForQR?.ticketId,
                ),
              )?.event.title || "Ticket QR Code"}
            </DialogTitle>
            <DialogDescription>
              Ticket Number: #{selectedTicketForQR?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTicketForQR && (
            <div className="relative flex flex-col items-center py-6">
              {/* Navigation Buttons */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full bg-white/80 shadow-md pointer-events-auto transition-opacity",
                    currentTicketQR === 0
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100",
                  )}
                  onClick={handlePrevQR}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full bg-white/80 shadow-md pointer-events-auto transition-opacity",
                    currentTicketQR === modalTicketsList.length - 1
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100",
                  )}
                  onClick={handleNextQR}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </Button>
              </div>

              {/* QR Code Wrapper */}
              <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 animate-in zoom-in-95 duration-200">
                <QRCodeSVG
                  value={selectedTicketForQR.qrData}
                  size={240}
                  level="H"
                  includeMargin={true}
                  fgColor="#0f172a"
                />
              </div>

              <div className="mt-6 text-center space-y-1">
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedTicketForQR.tierName?.name}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Present this QR code at the venue entrance
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Ticket Dialog */}
      <CancelTicketDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        ticket={
          (selectedOrderForCancel || selectedTicketForCancel) && detailTickets
            ? detailTickets
            : null
        }
        ticketId={selectedTicketForCancel}
        onCancelConfirm={handleCancelConfirm}
        isPending={cancelMutation.isPending}
      />

      {/* PDF generation */}

      <div
  style={{
    position: "fixed",
    left: "-9999px",
    top: "0",
    pointerEvents: "none",
    visibility: "hidden",
  }}
>
  <div id="pdf-hidden-container">
    {printData && (
      <TicketPDFDownload
        ticket={printData.tickets[0]}
        detailTickets={printData}
      />
    )}
  </div>
</div>
    </div>
  );
}
