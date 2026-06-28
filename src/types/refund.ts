export interface RefundUser {
  id: string;
  name: string;
  email: string;
}

export interface RefundEvent {
  id: string;
  title: string;
  currency: string;
  symbol: string;
}

export interface Refund {
  id: string;
  refund_number: string;
  transaction_id: string;
  initiated_by: RefundUser;
  event: RefundEvent;
  amount: number;
  reason: string;
  refund_type: string;
  status: "pending" | "processing" | "completed" | "rejected" |"succeeded";
  ticket_count: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
  transaction: DetailTransaction;
  affected_ticket_ids: string[];
  currency: string;
   organizer: DetailOrganizer;
 
}

export interface RefundsResponse {
  success: boolean;
  message: string;

    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    refunds: Refund[];
  };

export interface DetailTransaction {
  id: string;
  amount: number;
  gateway: string;
  status: string;
  created_at: string;
}

export interface DetailEvent {
  id: string;
  title: string;
  currency: string;
  symbol: string;
}

export interface DetailOrganizer {
  id: string;
  name: string;
}

export interface DetailUser {
  id: string;
  name: string;
  email: string;
}

export interface RefundDetailData {
  id: string;
  refund_number: string;
  transaction: DetailTransaction;
  event: DetailEvent;
  organizer: DetailOrganizer;
  initiated_by: DetailUser;
  amount: number;
  currency: string;
  reason: string;
  refund_type: string;
  status: "pending" | "processing" | "completed" | "rejected" |"succeeded";
  affected_ticket_ids: string[];
  ticket_count: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface RefundDetailResponse {
  success: boolean;
  message: string;
  data: RefundDetailData;
  timestamp: string;
  request_id: string;
};
