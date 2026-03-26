import { api } from '@/lib/apiClient';

import { PaginatedTransactions,TransactionDetailApiResponse, TransactionFilters } from '@/types/transaction';



export const transactionService = {
  


getUserTransactions: (page: number = 1, limit: number = 20, filters?: TransactionFilters, search?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if(search){
    params.append('search', search);
  }
  if (filters) {
    // Payment method - WORKS ALONE
    if (filters.payment_gateway && filters.payment_gateway !== 'all') {
      params.append('payment_method', filters.payment_gateway);
    }
    
    // Date from - WORKS ALONE
    if (filters.start_date) {
      const date = filters.start_date instanceof Date 
        ? filters.start_date.toISOString().split("T")[0] 
        : filters.start_date;
      params.append('date_from', date);
    }
    
    // Date to - ONLY works when combined with date_from
    if (filters.end_date && filters.start_date) {
      const date = filters.end_date instanceof Date 
        ? filters.end_date.toISOString().split("T")[0] 
        : filters.end_date;
      params.append('date_to', date);
    }
    
    // Event title / Search - ONLY works when combined with payment_method OR date_from
    if (filters.event_title && filters.event_title !== 'all') {
      const hasCombinedFilter = 
        (filters.payment_gateway && filters.payment_gateway !== 'all') ||
        filters.start_date;
      
      if (hasCombinedFilter) {
        params.append('event_title', filters.event_title);
      }
    }
  }

  
  return api.get<PaginatedTransactions>(
    `/user/transactions?${params.toString()}`,
    { 
      requiresAuth: true,
      returnFullResponse: true 
    }
  );
},

getTransactionById: (id: string) => {
    return api.get<TransactionDetailApiResponse>(
      `/user/transactions/${id}`,
      {
        requiresAuth: true,
        returnFullResponse: true
      }
    );
  },


};
