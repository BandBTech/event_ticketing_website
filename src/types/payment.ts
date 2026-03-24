export interface GatewayInfo {
  id?: string;
  name: string;
  display_name: string;
  description?: string;
  icon_url?: string;
  is_enabled: boolean;
  supported_currencies?: string[];
  supported_countries?: string[];
}

export interface GatewaysResponse {
  success: boolean;
  message: string;
  data: GatewayInfo[];
}

export interface PaymentSuccessResponse {
  checkout_token: string;
  message?: string;
  payment_info: {
    amount: number;
    cancel_url: string;
    currency: string;
    payment_gateway: string;
    payment_intent_id: string;
    session_id: string;
    status: string;
    success_url: string;
    ticket_ids: string[];
    transaction_id: string;
    url?: string;
  };
  ticket_count: number;
  ticket_view_token: string;
  ticket_view_url: string;
}

export interface PaymentCancelResponse {
  success: boolean;
  message: string;
}