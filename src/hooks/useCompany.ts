'use client';

import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';

const STORAGE_KEY = 'timro_company_info';

export const useCompanyInfo = () => {
  const query = useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      const freshData = await companyService.getCompanyInfo();
      
      if (typeof window !== 'undefined' && freshData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
      }
      return freshData;
    },
   
    placeholderData: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : undefined;
      }
    },
    staleTime: 1000 * 60 * 30, 
  });

  return query;
};