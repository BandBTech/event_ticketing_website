'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Following Next.js best practices for client-side route protection
 */
export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Ensure auth is checked on mount
    if (!authChecked) {
      checkAuth();
      setAuthChecked(true);
    }
  }, [authChecked, checkAuth]);

  useEffect(() => {
    // Only redirect after auth has been checked and is not loading
    if (authChecked && !isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [authChecked, isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking auth OR if auth hasn't been checked yet
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
