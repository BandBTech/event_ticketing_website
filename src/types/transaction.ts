export interface TransactionUser {
  id: string;
  transaction_details: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InvoiceCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  logo: string;
}

export interface InvoiceOrganizer {
  id: string;
  name: string;
  logo: string;
}

export interface TransactionInvoice {
  organizer: InvoiceOrganizer;
  company: InvoiceCompany;
  invoice_number: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  items: InvoiceItem[];
}

export interface Transaction {
  payment_method: string;
id: string;
  event: {
    id: string;
    title: string;
    banner_image: string;
    logo_url?: string; 
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  tiers: Tier[];
  ticket_count: number;
  payment_gateway: string;
  amount: number;
  price: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  invoice_info: TransactionInvoice;
  date: Date;

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
  invoice_number: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  items: Tier[]; 
  company: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    tax_number: string;
    logo: string;
    logo_url?: string;
  };
  organizer: {
    id: string;
    name: string;
    logo: string;
    logo_url?: string;
  };
}

export interface TransactionDetail {
id: string;
  event: {
    id: string;
    title: string;
    banner_image: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  ticket_count: number;
  payment_gateway: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded';
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
  unit_price: number; 
  total_price: number;
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

export interface TransactionApiFilters {
  payment_gateway?: string;
  date_from?: string;
  date_to?: string;
  datetime_from?: string;  
  datetime_to?: string; 
}
