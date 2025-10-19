import { 
  LoginRequest, 
  TokenResponse, 
  UserProfileResponse,
  RefreshTokenRequest,
  AuthApiResponse,
  AuthApiError 
} from '@/types/auth';
import { tokenManager } from './tokenManager';
import { api } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sandbox.timroticket.com/api/v1';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Legacy API request function for non-authenticated endpoints
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AuthApiError;
      throw new AuthError(
        errorData.message || 'An error occurred',
        errorData.error?.code || 'UNKNOWN_ERROR',
        response.status,
        errorData.error?.details
      );
    }

    const successData = data as AuthApiResponse<T>;
    return successData.data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuthError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }

    throw new AuthError(
      'An unexpected error occurred',
      'UNEXPECTED_ERROR'
    );
  }
}

/**
 * Auth Service
 * Handles all authentication operations with automatic token refresh
 */
class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const tokens = await apiRequest<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens
    tokenManager.setTokens(tokens.access_token, tokens.refresh_token);

    return tokens;
  }

  /**
   * Get authenticated user profile
   * Uses automatic token refresh from apiClient
   */
  async getProfile(): Promise<UserProfileResponse> {
    return await api.get<UserProfileResponse>('/auth/profile', {
      requiresAuth: true,
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new AuthError('No refresh token found', 'UNAUTHORIZED', 401);
    }

    const request: RefreshTokenRequest = {
      refresh_token: refreshToken,
    };

    const tokens = await apiRequest<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    tokenManager.setTokens(tokens.access_token, tokens.refresh_token);

    return tokens;
  }

  /**
   * Logout user
   */
  async logout(revokeAll: boolean = false): Promise<void> {
    try {
      await api.post<void>(`/auth/logout?all=${revokeAll}`, undefined, {
        requiresAuth: true,
      });
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      tokenManager.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return false;

    // Check if token is expired
    return !tokenManager.isTokenExpired(accessToken);
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<UserProfileResponse> {
    return await apiRequest<UserProfileResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Request password reset OTP
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiRequest<void>('/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(data: {
    reset_token: string;
    email_token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    await apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Change password (for authenticated users)
   * Uses automatic token refresh from apiClient
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    await api.post<void>('/auth/change-password', data, {
      requiresAuth: true,
    });
  }

  /**
   * Update user profile
   * Uses automatic token refresh from apiClient
   */
  async updateProfile(data: {
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<UserProfileResponse> {
    return await api.put<UserProfileResponse>('/auth/profile', data, {
      requiresAuth: true,
    });
  }

  /**
   * Send OTP
   */
  async sendOTP(data: {
    identifier: string;
    otp_type: string;
  }): Promise<{ message: string; success: boolean; expires_in: number }> {
    return await apiRequest<{ message: string; success: boolean; expires_in: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: {
    identifier: string;
    otp_code: string;
    otp_type: string;
  }): Promise<void> {
    await apiRequest<void>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
