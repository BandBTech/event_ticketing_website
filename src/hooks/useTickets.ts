import { useMutation } from '@tanstack/react-query';
import { ticketService, GuestPurchasePayload, UserPurchasePayload } from '@/services/ticketService';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

export const useGuestPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: GuestPurchasePayload) => ticketService.guestPurchase(data),
    onSuccess: (res: any, variables) => {
      // res is now the full response because of returnFullResponse: true in ticketService
      if (res.success || res.status === 'success' || (res.data && !res.error)) {
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        query.append("quantity", variables.quantity.toString());
        query.append("email", variables.email);

        // Pass token if available in the response data
        const token = res.data?.token || res.data?.id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", 'error');
      }
    },
    onError: (error: any) => {
      toast.message(error.response?.data?.message || error.message || "Failed to purchase tickets", 'error');
    },
  });
};

export const useUserPurchaseMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: UserPurchasePayload) => ticketService.userPurchase(data),
    onSuccess: (res: any, variables) => {
      // res is now the full response because of returnFullResponse: true in ticketService
      if (res.success || res.status === 'success' || (res.data && !res.error)) {
        toast.message(res.message || "Order placed successfully!", "success");
        const query = new URLSearchParams();
        query.append("eventId", variables.event_id);
        query.append("quantity", variables.quantity.toString());

        // Pass token if available in the response data
        const token = res.data?.token || res.data?.order_id;
        if (token) {
          query.append("token", token);
        }

        router.push(`/ticket-purchase/success?${query.toString()}`);
      } else {
        toast.message(res.message || "Purchase failed", 'error');
      }
    },
    onError: (error: any) => {
      toast.message(error.response?.data?.message || error.message || "Failed to purchase tickets", 'error');
    },
  });
};
