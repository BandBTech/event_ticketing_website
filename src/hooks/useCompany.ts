'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';

const STORAGE_KEY = 'timro_company_info';

export const useCompanyInfo = () => {
  const query = useQuery({
    queryKey: ['company-info'],
    queryFn: () => companyService.getCompanyInfo(),
    staleTime: 1000 * 60 * 30,
  });

  const { data } = query;

  useEffect(() => {
    if (typeof window !== 'undefined' && data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  return query;
};