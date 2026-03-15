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
  token: string;
  message?: string;
}

export interface PaymentCancelResponse {
  success: boolean;
  message: string;
}