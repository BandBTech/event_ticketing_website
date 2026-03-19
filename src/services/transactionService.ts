import { api } from '@/lib/apiClient';

import { PaginatedTransactions,TransactionDetailApiResponse } from '@/types/transaction';

export const transactionService = {

  getUserTransactions: (page: number = 1, limit: number = 20) => {
    return api.get<PaginatedTransactions>(
      `/user/transactions?page=${page}&limit=${limit}`,
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