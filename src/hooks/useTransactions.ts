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