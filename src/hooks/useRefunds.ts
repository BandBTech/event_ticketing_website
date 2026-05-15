// src/hooks/useRefunds.ts
import { useQuery } from "@tanstack/react-query";
import { refundService } from "@/services/refundService";
import { Refund, RefundsResponse } from "@/types/refund";

export function useUserRefunds(page: number, limit: number) {
  return useQuery<RefundsResponse>({
    queryKey: ["refunds", page, limit],
    queryFn: () => refundService.getUserRefunds(page, limit),
    placeholderData: (previousData) => previousData, 
  });
}

export function useRefundDetail(id: string | null) {
  return useQuery<Refund>({
    queryKey: ["refund", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      return refundService.getRefundById(id);
    },
    enabled: !!id, 
    staleTime: 1000 * 60 * 5, 
  });
}