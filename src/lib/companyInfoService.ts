import { api } from './apiClient';

/**
 * Company Info Service
 * Handles company/website information
 */

export interface CompanyInfo {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website_url?: string;
  logo_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

export class CompanyInfoService {
  /**
   * Get company information for public display
   */
  static async getCompanyInfo(): Promise<CompanyInfo> {
    return await api.get<CompanyInfo>('/public/company-info');
  }
}
