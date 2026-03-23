'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guest Route Component
 * Wraps pages that should only be accessible when NOT logged in
 * (Login, Signup, Forgot Password, etc.)
 * Redirects authenticated users to homepage
 */
export function GuestRoute({
  children,
  redirectTo = '/'
}: GuestRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
      setAuthChecked(true);
    }
  }, [authChecked, checkAuth]);

  useEffect(() => {
    if (authChecked && !isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [authChecked, isAuthenticated, isLoading, redirectTo, router]);

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

  // Don't render guest content if authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
