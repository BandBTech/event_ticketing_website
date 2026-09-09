import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/lib/toast";
import { persistSelectedLocale, useLanguageStore } from "@/store/languageStore";
import {
  CancelTicketRequest,
  PaginatedUserTickets,
  PurchasePayload,
  PurchaseResponse,
  ticketService,
} from "@/services/ticketService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function preserveLocaleBeforeExternalRedirect() {
  persistSelectedLocale(useLanguageStore.getState().locale);
}

export const useGuestPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: PurchasePayload) => ticketService.purchase(data, false),
    onSuccess: (res: PurchaseResponse, variables) => {
      if (res.success) {
        // Stripe flow: redirect to Stripe Checkout URL
        const gatewayData = res.data;
        if (gatewayData?.redirect_url) {
          preserveLocaleBeforeExternalRedirect();
          toast.success(
            "ticketPurchase.redirectingToPayment",
            "Redirecting to payment...",
          );
          window.location.href = gatewayData.redirect_url;
          return;
        }

        // Cash flow: redirect to local success page
        toast.success(
          "ticketPurchase.toast.orderPlaced",
          res.message || "Order placed successfully!",
        );
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        query.append("quantity", totalQuantity.toString());
        query.append("email", variables.customer_email);

        const token = res.data?.checkout_token;
        if (token) {
          query.append("token", token);
        }

        router.push(`/payment/success?${query.toString()}`);
      } else {
        toast.error(
          "ticketPurchase.toast.purchaseFailed",
          res.message || "Purchase failed",
        );
      }
    },
  });
};

export const useUserPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: PurchasePayload) => ticketService.purchase(data, true),
    onSuccess: (res: PurchaseResponse, variables) => {
      if (res.success) {
        // Stripe flow: redirect to Stripe Checkout URL
        const gatewayData = res.data;
        if (gatewayData?.redirect_url) {
          preserveLocaleBeforeExternalRedirect();
          toast.success(
            "ticketPurchase.redirectingToPayment",
            "Redirecting to payment...",
          );
          window.location.href = gatewayData.redirect_url;
          return;
        }

        // Cash flow: redirect to local success page
        toast.success(
          "ticketPurchase.toast.orderPlaced",
          res.message || "Order placed successfully!",
        );
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        query.append("quantity", totalQuantity.toString());

        const token = res.data?.checkout_token;
        if (token) {
          query.append("token", token);
        }

        router.push(`/payment/success?${query.toString()}`);
      } else {
        toast.error(
          "ticketPurchase.toast.purchaseFailed",
          res.message || "Purchase failed",
        );
      }
    },
  });
};

export const useUserTickets = (
  page: number = 1,
  search: string = "",
  filter: string = "all",
) => {
  return useQuery<PaginatedUserTickets>({
    queryKey: ["tickets", "user-purchases", page, search, filter],
    queryFn: () => ticketService.getUserTickets(page, 10, search, filter),
    placeholderData: (previousData) => previousData,
  });
};

export const useEventTickets = (eventId: string | null) => {
  return useQuery({
    queryKey: ["event-tickets", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return ticketService.getEventTickets(eventId);
    },
    enabled: !!eventId,
  });
};

export const useTransactionDetails = (transactionId?: string) => {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => {
      if (!transactionId) return null;
      return ticketService.getTransactionById(transactionId);
    },
    enabled: !!transactionId,
  });
};

export const useCancelTicket = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: CancelTicketRequest;
    }) => ticketService.cancelTicket(ticketId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          "cancelTicket.toast.success",
          res.message ||
            "Ticket cancelled successfully. Refund will be processed.",
        );

        // Invalidate user tickets query to refetch updated list
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.userTickets(1, "all", ""),
        });

        // Also invalidate any detail queries for this ticket
        queryClient.invalidateQueries({
          queryKey: ["tickets", "user-purchases"],
        });
      }
    },
  });
};
