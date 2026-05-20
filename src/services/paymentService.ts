import { api } from "@/lib/apiClient";
import { type GatewayInfo, type PaymentSuccessResponse } from "@/types/payment";

export interface GetGatewaysParams {
  currency?: string;
  country?: string;
}

export const paymentService = {
  getGateways: async (params?: GetGatewaysParams): Promise<GatewayInfo[]> => {
    const query = new URLSearchParams();
    if (params?.currency) query.append("currency", params.currency);
    if (params?.country) query.append("country", params.country);

    const queryString = query.toString();
    const endpoint = `/payments/gateways${queryString ? `?${queryString}` : ""}`;

    // Use returnFullResponse so we can manually unwrap, since the api client
    // may return the full object instead of the inner array.
    const response = await api.get<{ data?: GatewayInfo[] } | GatewayInfo[]>(endpoint, {
      returnFullResponse: true,
    });

    // Handle both { data: [...] } and plain array responses
    if (Array.isArray(response)) return response;
    const asObj = response as { data?: GatewayInfo[] };
    if (Array.isArray(asObj?.data)) return asObj.data;
    return [];
  },
  confirmPayment: async (checkoutToken: string): Promise<PaymentSuccessResponse> => {
    return api.post<PaymentSuccessResponse>(`/public/payment/success?checkout_token=${checkoutToken}`, { checkout_token: checkoutToken });
  },
  cancelledPayment: async (checkoutToken: string): Promise<unknown> => {
    return api.delete(`/public/checkout/${checkoutToken}`);
  },
};
