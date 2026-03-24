export interface TransactionUser {
  id: string;
  transaction_details: string;
}

export interface TransactionInvoice {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_number: string;
  invoice_number: string;
  transaction_ref: string;
  payment_gateway: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
}

export interface Transaction {
  id: string;
  event:{
    id: string,
    title: string,
    banner_image:string,
  },
  event_title: string;
  tiers:{
    id: string; 
    name: string;
    quantity: number;
    price: number;
  }[];
  price: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  payment_method: string;
  user: TransactionUser;
  // invoice: TransactionInvoice;
}

export interface PaginatedTransactions {
  success: boolean;
  message: string;
  data: {
    pagination: {
      has_next: boolean;
      has_prev: boolean;
      limit: number;
      page: number;
      total: number;
      total_pages: number;
    };
    transactions: Transaction[];
  };
}

export interface InvoiceInfo {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_number: string;
  invoice_number: string;
  transaction_ref: string;
  payment_gateway: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
}

export interface TransactionDetail {
  transaction_status: string;
  id: string;
  event_id: string;
  event_title: string;
  tiers:Tier[];
  tier_id: string;
  tier_name: string;
  user_id: string;
  user_name: string;
  customer_email: string;
  ticket_count: number;
  payment_gateway: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  gateway_txn_id: string;
  processed_at: string;
  created_at: string;
  updated_at: string;
  invoice_info: InvoiceInfo;
}

export interface TransactionDetailApiResponse {
  success: boolean;
  message: string;
  data: TransactionDetail;
  timestamp: string;
  request_id: string;
}

export interface Tier {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TransactionFilters {
  status: string;
  payment_gateway: string;
  event_title: string;
  start_date: Date | undefined;
  end_date:  Date | undefined;
}


export const getDefaultFilters = (): TransactionFilters => ({
  status: "all",
  payment_gateway: "all",
  event_title: "all",
  start_date: undefined,
  end_date:undefined,
});

