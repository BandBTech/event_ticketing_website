"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { TicketItem, TicketItems, ViewTicketDetails } from "@/types/ticket";
import {
  useEventTickets,
  useTransactionDetails,
  useUserTickets,
} from "@/hooks/useTickets";
import { QRCodeSVG } from "qrcode.react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { SelectViewport } from "@radix-ui/react-select";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";



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
  const [selectedTicket, setSelectedTicket] =
    useState<ViewTicketDetails | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicketForQR, setSelectedTicketForQR] =
    useState<TicketItems | null>(null);
  const [currentTicketQR, setCurrentTicketQR] = useState<number>(0);
  const [modalTicketsList, setModalTicketsList] = useState<TicketItems[]>([]);

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  //   const [selectedOrderId, setSelectedOrderId] = useState<string | null>(()=> {
  //  if (typeof window !== "undefined") {
  //       return localStorage.getItem("active_order_id");
  //     }
  //     return null;
  //   });
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
  } = useUserTickets(currentPage);
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

  const getStatusFromTicket = (ticket: ViewTicketDetails["tickets"][0]) => {
    return ticket.checkedIn ? "used" : "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadTicket = async (orderId: string) => {
    // You'll need to implement this in your ticketService
    console.log("Download ticket for order:", orderId);
  };

  const handleCancelTicket = async (orderId: string) => {
    // You'll need to implement this in your ticketService
    console.log("Cancel ticket for order:", orderId);
  };
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
              Error loading tickets
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load tickets. Please try again."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("setting.menu.tickets.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="pb-2 px-1 capitalize font-medium transition-colors cursor-pointer">
                {view === "list" ? "All Tickets" : "Ticket Details"}
              </h1>
              <p className="text-sm text-gray-600">{view === "list"}</p>
            </div>

            {view === "detail" && (
              <Button
                variant="ghost"
                className="hover:bg-white! hover:shadow-sm transition-shadow"
                onClick={handleBackToList}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Back to List
              </Button>
            )}
          </div>

          {/* Tickets list */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
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
                      onClick={()=> handleViewTickets(order)}
                      tabIndex={0}
                      onKeyDown={(e)=>{
                        if(e.key === 'Enter' || e.key === ' '){
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
                <div className="relative shrink-0">
                  <img
                    src={detailTickets?.event.imageUrl}
                    className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md border-2 border-white"
                    alt="banner"
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
                     <Clock className="h-4 w-4 text-primary" /> {formatTime(detailTickets.purchaseDate)}
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
                                ticket.checkedIn
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700",
                              )}
                            >
                              {ticket.checkedIn ? "Used" : "Active"}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              <Download className="h-3.5 w-3.5 mr-1" /> Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              <QrCode className="h-3.5 w-3.5 mr-1" /> Share
                            </Button>
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
    </div>
  );
}
