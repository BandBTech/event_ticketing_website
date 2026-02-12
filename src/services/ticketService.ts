import { api } from "@/lib/apiClient";
import { type ViewTicketDetails, type ApiTicketResponse } from "@/types/ticket";

export interface PurchaseTierPayload {
  quantity: number;
  tier_id: string;
}
export interface GuestPurchasePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  event_id: string;
  payment_gateway: string;
  tiers: PurchaseTierPayload[];
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

// For logged-in user ticket purchase
export interface UserPurchasePayload {
  event_id: string;
  tiers: PurchaseTierPayload[];
  payment_gateway: string;
}

export interface UserPurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    order_id: string;
    tickets: Array<{
      ticket_id: string;
      ticket_number: string;
    }>;
  };
}

export const ticketService = {
  guestPurchase: async (data: GuestPurchasePayload) => {
    const response = await api.post<GuestPurchaseResponse>(
      "/public/tickets/guest-purchase",
      data,
      {
        returnFullResponse: true,
      }
    );
    return response;
  },

  userPurchase: async (data: UserPurchasePayload) => {
    const response = await api.post<UserPurchaseResponse>(
      "/user/tickets/purchase",
      data,
      {
        requiresAuth: true,
        returnFullResponse: true,
      }
    );
    return response;
  },

  validateToken: async (token: string) => {
    // Note: API doc says GET /public/tickets/validate-token?token=...
    const response = await api.get<{ valid: boolean; data?: unknown }>(
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
    const response = await api.get<unknown>(`/public/tickets/view?token=${token}`);

    // If response is the data object, we parse it directly. 
    // If it's wrapped in { data: ... }, we try to access .data
    const ticketData = (response as { data?: unknown })?.data || response;

    // VALIDATION GATEWAY: Enforce schema here
    if (!ticketData) throw new Error("No ticket data found");

    // Direct cast without Zod validation
    const rawTicket = ticketData as ApiTicketResponse;

    // Then map to frontend model (transforming snake_case to camelCase)
    return mapTicketView(rawTicket);
  },
};

// Mapper to transform API response (snake_case) to Frontend model (camelCase)
const mapTicketView = (apiResponse: ApiTicketResponse): ViewTicketDetails => {
  return {
    orderId: apiResponse.order_id,
    event: {
      id: apiResponse.event.id,
      title: apiResponse.event.title,
      imageUrl: apiResponse.event.banner_image,
      venueName: apiResponse.event.venue_name,
      address: apiResponse.event.address,
      startDate: apiResponse.event.start_date,
      timezone: apiResponse.event.timezone,
      organizer: apiResponse.event.organizer,
    },
    tickets: apiResponse.tickets.map((t) => ({
      ticketId: t.ticket_id,
      ticketNumber: t.ticket_number,
      tierName: t.tier_name,
      price: t.price,
      qrData: t.qr_data,
      checkedIn: t.checked_in,
    })),
    totalAmount: apiResponse.total_amount,
    currency: apiResponse.currency,
    purchaseDate: apiResponse.purchase_date,
    company: apiResponse.company ? {
      name: apiResponse.company.name,
      logoUrl: apiResponse.company.logo_url,
    } : undefined,
  };
};
