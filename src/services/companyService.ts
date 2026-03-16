import { api } from "@/lib/apiClient";

export interface CompanyInfo{
     
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    logo_url: string;
    website_url: string;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
    updated_at: string;
    
}


export const companyService ={
    
    getCompanyInfo: async (): Promise<CompanyInfo> => {
        const response = await api.get<CompanyInfo>('/public/company-info');
        return response;
    }
}