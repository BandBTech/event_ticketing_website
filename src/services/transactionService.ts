import { api } from '@/lib/apiClient';

import { PaginatedTransactions,TransactionDetailApiResponse, TransactionFilters } from '@/types/transaction';



export const transactionService = {
  
getUserTransactions: (page: number = 1, limit: number = 20, filters?: TransactionFilters) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      // Only add filters that are not "all" and not undefined
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.payment_gateway && filters.payment_gateway !== 'all') {
        params.append('payment_gateway', filters.payment_gateway);
      }
      if (filters.event_title && filters.event_title !== 'all') {
        params.append('event_title', filters.event_title);
      }
      
      // Handle dates
      if (filters.start_date) {
        const date = filters.start_date instanceof Date 
          ? filters.start_date.toISOString().split("T")[0] 
          : filters.start_date;
        params.append('start_date', date);
      }
      
      if (filters.end_date) {
        const date = filters.end_date instanceof Date 
          ? filters.end_date.toISOString().split("T")[0] 
          : filters.end_date;
        params.append('end_date', date);
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
  }


};