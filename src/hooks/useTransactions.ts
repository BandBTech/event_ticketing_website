import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { PaginatedTransactions, TransactionApiFilters, TransactionFilters } from '@/types/transaction';

export const useUserTransactions = (
  page: number = 1, 
  limit: number = 20, 
  filters?: TransactionApiFilters,
  search?: string
) => {
  return useQuery<PaginatedTransactions>({
    queryKey: ['transactions', 'user-list', page, limit, filters, search],
    queryFn: () => transactionService.getUserTransactions(page, limit, filters, search),
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

// export const useUserTransactionEvents = () => {
//   return useQuery({
//     queryKey: ['user-transactions', 'events-list'],
//     queryFn: async () => {

//  const response = await transactionService.getUserTransactions(1, 1000);

//    const transactions = response?.data?.transactions;
      
//       if (!transactions || transactions.length === 0) {
      
//         return [];
//       }
//      const uniqueEvents = new Set<string>();
//     transactions.forEach((transaction) => {

//       const eventTitle = transaction.event?.title;
      
//         if (eventTitle) {
//           uniqueEvents.add(eventTitle);
//         }
//       });
      
//    const events = Array.from(uniqueEvents).sort();
//       return events;
//     },
//     staleTime: 1000 * 60 * 5, 
//     gcTime: 1000 * 60 * 10, 
//     refetchOnWindowFocus: false, 
    
//   });
// };
