import { api } from '@/lib/apiClient';
import { PaginatedTransactions } from '@/types/transaction';

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


};