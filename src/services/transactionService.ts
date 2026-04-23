import { api } from "@/lib/apiClient";

import {
  PaginatedTransactions,
  TransactionApiFilters,
  TransactionDetailApiResponse,
  TransactionFilters,
} from "@/types/transaction";

export const transactionService = {
  getUserTransactions: (
    page: number = 1,
    limit: number = 20,
    filters?: TransactionApiFilters,
    search?: string,
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }
    if (filters) {
      // Payment method - WORKS ALONE
      if (filters.payment_gateway && filters.payment_gateway !== "all") {
        params.append("payment_method", filters.payment_gateway);
      }

      if (filters.date_from) {
        params.append("date_from", filters.date_from);
      }

      if (filters.date_to) {
        params.append("date_to", filters.date_to);
      }
      if (filters.datetime_from) {
        params.append('datetime_from', filters.datetime_from);
      }
      if (filters.datetime_to) {
        params.append('datetime_to', filters.datetime_to);
      }
    }

    return api.get<PaginatedTransactions>(
      `/user/transactions?${params.toString()}`,
      {
        requiresAuth: true,
        returnFullResponse: true,
      },
    );
  },

  getTransactionById: (id: string) => {
    return api.get<TransactionDetailApiResponse>(`/user/transactions/${id}`, {
      requiresAuth: true,
      returnFullResponse: true,
    });
  },
};
