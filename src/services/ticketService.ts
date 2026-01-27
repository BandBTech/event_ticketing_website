import { api } from "@/lib/apiClient";
import { ViewTicketResponseSchema, type ViewTicketDetails } from "@/types/ticket";

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
    // Note: API doc says GET /public/tickets/validate-token?token=...
    const response = await api.get<{ valid: boolean; data?: any }>(
      `/public/tickets/validate-token?token=${token}`,
      {
        showErrorToast: true,
      }
    );
    return response;
  },

  // Updated to use the public view endpoint which only needs the token
  viewTicket: async (token: string): Promise<ViewTicketDetails> => {
    // API client unwraps responses. So 'response' here IS the data object from the server response
    const response = await api.get<any>(`/public/tickets/view?token=${token}`);

    // If response is the data object, we parse it directly. 
    // If it's wrapped in { data: ... }, we try to access .data
    const ticketData = response.data || response;

    // VALIDATION GATEWAY: Enforce schema here
    if (!ticketData) throw new Error("No ticket data found");
    return ViewTicketResponseSchema.parse(ticketData);
  },
};
