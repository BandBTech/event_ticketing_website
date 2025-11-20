import { api } from './apiClient';

/**
 * Category Service
 * Handles category-related API calls
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export class CategoryService {
  /**
   * Get all active categories for public display
   */
  static async getCategories(): Promise<Category[]> {
    return await api.get<Category[]>('/public/categories');
  }
}
