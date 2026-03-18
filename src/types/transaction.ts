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