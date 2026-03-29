import { api } from "@/lib/apiClient";
import {
  type ViewTicketDetails,
  type ApiTicketResponse,
  UserTicketsApiResponse,
  ApiUserTicket,
  TicketItem,
  EventTicketsApiResponse,
  ViewTicketDetail,
  TransactionDetailApiResponse,
} from "@/types/ticket";

export interface PurchaseTierPayload {
  quantity: number;
  tier_id: string;
}
export interface GuestPurchasePayload {
  // first_name: string;
  // last_name: string;
  email: string;
  // phone: string;
  // country_code: string;
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
    gateway_data?: {
      session_id?: string;
      url?: string;
    };
  };
}

// For logged-in user ticket purchase
export interface UserPurchasePayload {
  event_id: string;
  tiers: PurchaseTierPayload[];
  payment_gateway: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  country_code: string;
}

export interface UserPurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    order_id?: string;
    checkout_token: string;
    payment_gateway: string;
    amount: number;
    currency: string;
    status: string;
    gateway_data: {
      cancel_url: string;
      session_id: string;
      success_url: string;
      url?: string;
    };
    expires_at: string;
    created_at: string;
  };
}
export interface PaginatedUserTickets {
  tickets: ViewTicketDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}
export const ticketService = {
  guestPurchase: async (data: GuestPurchasePayload) => {
    const response = await api.post<GuestPurchaseResponse>(
      "/public/tickets/guest-purchase",
      data,
      {
        returnFullResponse: true,
      },
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
      },
    );
    return response;
  },

  validateToken: async (token: string) => {
    // Note: API doc says GET /public/tickets/validate-token?token=...
    const response = await api.get<{ valid: boolean; data?: unknown }>(
      `/public/tickets/validate-token?token=${token}`,
      {
        showErrorToast: true,
      },
    );
    return response;
  },

  // Updated to use the public view endpoint which only needs the token
  viewTicket: async (token: string): Promise<ViewTicketDetails> => {
    // API client unwraps responses. So 'response' here IS the data object from the server response
    const response = await api.get<unknown>(
      `/public/tickets/view?token=${token}`,
    );

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

  getUserTickets: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserTickets> => {
    const response = await api.get<UserTicketsApiResponse>(
      `/user/tickets?page=${page}&limit=${limit}`,
      {
        requiresAuth: true,
      },
    );

    const rawTickets = response?.tickets || [];
    // const detailedTicketsPromises = rawTickets.map(async (t: ApiUserTicket) => {
    //   const detailResponse = await api.get(`/user/tickets/${t.id}`, {
    //     requiresAuth: true,
    //   });

    //   if (
    //     detailResponse &&
    //     typeof detailResponse === "object" &&
    //     "data" in detailResponse
    //   ) {
    //     return (detailResponse as ApiSingleTicketResponse).data;
    //   }
    //   return detailResponse as ApiUserTicket;
    // });

    // const detailedTickets = await Promise.all(detailedTicketsPromises);

    const mappedTickets = rawTickets.map((t: ApiUserTicket) => ({
      orderId: t.id,
      ticketCount: t.ticket_count,
      transactionStatus: t.transaction_status,
      purchaseDate: t.created_at,
      event: {
        id: t.event.id,
        title: t.event.title,
        imageUrl: t.event.banner_image,
        venueName: t.event.venue_name,
        address: t.event.address,
        startDate: t.event.start_date,
        endDate: t.event.end_date,
        timezone: t.event.timezone,
        organizer: {
          id: t.event.organizer_id,
          name: "Organizer",
          logo: undefined,
        },
      },

      tickets: [
        {
          ticketId: t.id,
          ticketNumber: t.ticket_number,
          tierName: t.tier_name,
          price: t.total_amount,
          qrData: `https://sandbox.timroticket.com/validate/${t.ticket_number}`,
          checkedIn: t.status === "used",
        },
      ],
      totalAmount: t.total_amount,
      currency: "NPR",
    }));
    return {
      tickets: mappedTickets,
      pagination: response.pagination,
    };
  },

  getUserTicketById: async (ticketId: string) => {
    const response = await api.get<UserTicketsApiResponse>(
      `/user/tickets/${ticketId}`,
      {
        requiresAuth: true,
      },
    );

    // Extract the data object from the response
    const ticketData = (response as { data?: ApiUserTicket })?.data || response;
    return ticketData;
  },

  getEventTickets: async (eventId: string): Promise<TicketItem[]> => {
    const response = await api.get<EventTicketsApiResponse>(
      `/user/events/${eventId}/tickets`,
      { requiresAuth: true },
    );

    // Map ApiTicketItem -> TicketItem
    return response.data.tickets.map((t) => ({
      ticketId: t.ticket_id,
      ticketNumber: t.ticket_number,
      tierName: t.tier_name,
      price: t.price,
      qrData: t.qr_data,
      checkedIn: t.checked_in,
    }));
  },

  getTransactionById: async (id: string): Promise<ViewTicketDetail> => {
    const response = await api.get<TransactionDetailApiResponse>(
      `/user/tickets/${id}`,
      { requiresAuth: true },
    );

    const d = response?.data ?? response;

    return {
      orderId: d.id,
      ticketCount: d.tickets.length,
      transactionStatus: d.transaction_status,
      purchaseDate: d.created_at,
      event: {
        id: d.event.id,
        title: d.event.title,
        imageUrl: d.event.banner_image,
        venueName: d.event.venue_name,
        address: d.event.address,
        startDate: d.event.start_date,
        endDate: d.event.end_date,
      },
      tickets: d.tickets.map((t) => ({
        ticketId: t.id,
        ticketNumber: t.ticket_number,
        tierName: {
          id: t.tier.id,
          name: t.tier.name,
        },
        qrData: t.qr_data,
        checkedIn: false,
      })),
    };
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
      endDate: apiResponse.event.end_date,
    },
    tickets: apiResponse.tickets.map((t) => ({
      ticketId: t.ticket_id,
      ticketNumber: t.ticket_number,
      tierName: t.tier_name,
      // tierName: {
      //   id: t.tier.id,
      //   name: t.tier.name,
      // },
      price: t.price,
      qrData: t.qr_data,
      checkedIn: t.checked_in,
    })),
    ticketCount: apiResponse.ticket_count,
    transactionStatus: apiResponse.transaction_status,
    totalAmount: apiResponse.total_amount,
    currency: apiResponse.currency,
    purchaseDate: apiResponse.purchase_date,
    company: apiResponse.company
      ? {
          name: apiResponse.company.name,
          logoUrl: apiResponse.company.logo_url,
        }
      : undefined,
  };
};
