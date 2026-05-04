import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ticketService,
  GuestPurchasePayload,
  UserPurchasePayload,
  GuestPurchaseResponse,
  UserPurchaseResponse,
  PaginatedUserTickets,
  CancelTicketRequest,
  CancelTicketResponse,
} from "@/services/ticketService";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/queryKeys";

export const useGuestPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: GuestPurchasePayload) =>
      ticketService.guestPurchase(data),
    onSuccess: (res: GuestPurchaseResponse, variables) => {
      if (res.success) {
        // Stripe flow: redirect to Stripe Checkout URL
        const gatewayData = res.data?.gateway_data;
        if (gatewayData?.url) {
          toast.message("Redirecting to payment...", "success");
          window.location.href = gatewayData.url;
          return;
        } else if (res.data?.payment_url) {
          toast.message("Redirecting to payment...", "success");
          window.location.href = res.data.payment_url;
          return;
        }

        // Cash flow: redirect to local success page
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        query.append("quantity", totalQuantity.toString());
        query.append("email", variables.email);

        const token = res.data?.token || res.data?.id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", "error");
      }
    },
  });
};

export const useUserPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: UserPurchasePayload) => ticketService.userPurchase(data),
    onSuccess: (res: UserPurchaseResponse, variables) => {
      if (res.success) {
        // Stripe flow: redirect to Stripe Checkout URL
        const gatewayData = res.data?.gateway_data;
        if (gatewayData?.url) {
          toast.message("Redirecting to payment...", "success");
          window.location.href = gatewayData.url;
          return;
        }

        // Cash flow: redirect to local success page
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        query.append("quantity", totalQuantity.toString());

        const token = res.data?.order_id || res.data?.id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", "error");
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
