import { useMutation, useQuery } from '@tanstack/react-query';
import { ticketService, GuestPurchasePayload, UserPurchasePayload, GuestPurchaseResponse, UserPurchaseResponse } from '@/services/ticketService';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useGuestPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: GuestPurchasePayload) => ticketService.guestPurchase(data),
    onSuccess: (res: GuestPurchaseResponse, variables) => {
      if (res.success) {
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce((sum, t) => sum + t.quantity, 0);
        query.append("quantity", totalQuantity.toString());
        query.append("email", variables.email);

        const token = res.data?.token || res.data?.id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", 'error');
      }
    }
  });
};

export const useUserPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: UserPurchasePayload) => ticketService.userPurchase(data),
    onSuccess: (res: UserPurchaseResponse, variables) => {
      if (res.success) {
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        const totalQuantity = variables.tiers.reduce((sum, t) => sum + t.quantity, 0);
        query.append("quantity", totalQuantity.toString());

        const token = res.data?.order_id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", 'error');
      }
    }
  });
};

export const useUserTickets = () => {
  return useQuery({
    queryKey: ['tickets', 'user-purchases'],
    queryFn: ()=> ticketService.getUserTickets(),
  })
};

export const useEventTickets = (eventId: string | null) => { 
  return useQuery({
    queryKey: ['event-tickets', eventId],
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
