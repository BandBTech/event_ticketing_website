import { api } from '@/lib/apiClient';
import { Refund, RefundsResponse } from '@/types/refund';



export const refundService = {
  /**
   * Fetch all refunds for the current user
   */
  getUserRefunds: (page = 1, limit = 10) => {
    return api.get<RefundsResponse>(`/user/payments/refunds?page=${page}&limit=${limit}`, {
      requiresAuth: true,
    });
  },

  /**
   * Optional: Get a single refund detail
   */
  getRefundById: (id: string) => {
    return api.get<Refund>(`/user/payments/refunds/${id}`, {
      requiresAuth: true,
    });
  }
};