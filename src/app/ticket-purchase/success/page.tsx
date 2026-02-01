"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon, TicketIcon, HouseIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { queryKeys } from "@/lib/queryKeys";
import { eventService } from "@/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";

function TicketSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { isAuthenticated } = useAuthStore();

  const eventId = searchParams.get("eventId");
  const quantity = searchParams.get("quantity");
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: queryKeys.events.byId(eventId!),
    queryFn: () => eventService.getEventById(eventId!),
    enabled: !!eventId,
  });

  // If we have no eventId and no token, it's an invalid access
  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <CheckCircleIcon size={32} weight="duotone" className="rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h1>
          <p className="text-gray-600 mb-6">
            We could not verify your purchase details.
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-in zoom-in duration-300">
          <CheckCircleIcon size={40} weight="duotone" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('ticketPurchase.successTitle', 'Purchase Successful!')}
        </h1>

        {email ? (
          <p className="text-gray-600 mb-6 text-lg">
            {t('ticketPurchase.ticketSentTo', 'Your ticket has been sent to')}{' '}
            <span className="font-bold text-gray-900">{email}</span>
          </p>
        ) : (
          <p className="text-gray-600 mb-6 text-lg">
            {t('ticketPurchase.successMessage', 'Your tickets have been booked successfully. A confirmation email has been sent to you.')}
          </p>
        )}

        {isAuthenticated && (
          <p className="text-sm text-gray-500 mb-6">
            {t('ticketPurchase.checkMyTickets', 'You can also view your tickets from "My Tickets" page.')}
          </p>
        )}

        {ticket && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4 text-left">
            <img
              src={ticket.imageUrl}
              alt={ticket.title}
              className="aspect-16/10 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{ticket.title}</h3>
              <p className="text-sm text-gray-500">{ticket.venue?.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(ticket.startDate, "EEEE, MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>
        )}

        {quantity && (
          <p className="text-gray-500 mb-6">
            {t('ticketPurchase.quantity', 'You have purchased')} <span className="font-bold text-gray-900">{quantity}</span> {t('ticketPurchase.ticket', 'ticket(s)')}
          </p>


        )}

        <div className="space-y-3">
          {/* {isAuthenticated && (
            <Button
              onClick={() => router.push(`/tickets/view?token=${token}`)}
              className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-200 group"
            >
              <TicketIcon size={20} className="mr-2" />
              {t('ticketPurchase.viewTicket', 'View Ticket')}
            </Button>
          )} */}

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-12 text-base font-medium text-gray-600 hover:bg-gray-50"
          >
            <HouseIcon size={20} className="mr-2" />
            {t('common.returnHome', 'Return to Home')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TicketSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center" ><Loader2 className="animate-spin size-12" /></div>}>
      <TicketSuccessContent />
    </Suspense>
  );
}
