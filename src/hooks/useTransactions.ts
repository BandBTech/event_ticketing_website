import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { PaginatedTransactions } from '@/types/transaction';

export const useUserTransactions = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedTransactions>({
    queryKey: ['transactions', 'user-list', page, limit],
    queryFn: () => transactionService.getUserTransactions(page, limit),
    placeholderData: (previousData) => previousData,
    
  });
};

export function useTransactionDetail(transactionId?: string) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error("Transaction ID is required");
      const response = await transactionService.getTransactionById(transactionId);
  return response; 
    },
    enabled: !!transactionId,
    staleTime: 1000 * 60 * 5, 
  });
}
