import { api } from "@/lib/apiClient";

export interface GuestPurchasePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  event_id: string;
  tier_id: string;
  quantity: number;
  payment_gateway: string;
}

export interface GuestPurchaseResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    token: string;
    payment_url?: string;
  };
}

export const ticketService = {
  guestPurchase: async (data: GuestPurchasePayload) => {
    const response = await api.post<GuestPurchaseResponse>(
      "/public/tickets/guest-purchase",
      data
    );
    return response;
  },

  validateToken: async (token: string) => {
    const response = await api.post<{ valid: boolean; data?: any }>(
      "/public/tickets/validate-token",
      { token }
    );
    return response;
  },

  viewTicket: async (id: string, token: string) => {
    const response = await api.get<any>(`/public/tickets/view/${id}?token=${token}`);
    return response;
  },
};
