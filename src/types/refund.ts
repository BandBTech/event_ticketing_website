export interface Refund {
  RejectionReason: string;
  PaymentProvider: string;
  ID: string;
  RefundNumber: string;
  order_id: string;
  Amount: number;
  Currency: string;
  Status: 'pending' | 'processing' | 'completed' | 'rejected';
  Reason: string;
  CreatedAt: string;
  UpdatedAt: string;
}


export interface RefundsResponse {
  refunds: Refund[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}