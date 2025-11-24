'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService, AuthError } from '@/lib/authService';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Spinner } from '@phosphor-icons/react';
import Link from 'next/link';

type VerificationStatus = 'verifying' | 'success' | 'error';

function VerifyGuestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { fetchProfile } = useAuthStore();

  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    const verifyGuestToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage(t('auth.guestVerify.noToken', 'No verification token provided.'));
        return;
      }

      try {
        setStatus('verifying');

        // Call the API to verify the guest token
        // This will store the token in tokenManager
        const response = await authService.verifyGuestToken(token);

        setGuestEmail(response.user.email);

        // Fetch the full profile to update the auth store
        await fetchProfile();

        setStatus('success');

        toast.success(
          'auth.toast.guestVerified',
          'Email verified successfully! You can now complete your booking.'
        );

      } catch (error) {
        setStatus('error');

        if (error instanceof AuthError) {
          setErrorMessage(error.message);
          toast.error('', error.message, error.details);
        } else {
          setErrorMessage(t('auth.guestVerify.genericError', 'Verification failed. Please try again.'));
          toast.error(
            'auth.toast.verificationFailed',
            'Verification failed. Please try again.'
          );
        }
      }
    };

    verifyGuestToken();
  }, [token, router, fetchProfile, t]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 text-center">
          {status === 'verifying' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Spinner size={64} className="text-blue-600 animate-spin" weight="bold" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  {t('auth.guestVerify.verifying', 'Verifying Your Email')}
                </h1>
                <p className="text-gray-600">
                  {t('auth.guestVerify.pleaseWait', 'Please wait while we verify your email address...')}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={48} className="text-green-600" weight="fill" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  {t('auth.guestVerify.success', 'Email Verified!')}
                </h1>
                <p className="text-gray-600">
                  {t('auth.guestVerify.successMessage', 'Your email has been verified successfully.')}
                </p>
                {guestEmail && (
                  <p className="text-sm text-gray-500">
                    {guestEmail}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {t('auth.guestVerify.redirecting', 'Redirecting you to continue your booking...')}
                </p>
                <Button
                  onClick={() => router.push('/events')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('auth.guestVerify.continueBooking', 'Continue to Events')}
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle size={48} className="text-red-600" weight="fill" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  {t('auth.guestVerify.failed', 'Verification Failed')}
                </h1>
                <p className="text-gray-600">
                  {errorMessage || t('auth.guestVerify.errorMessage', 'We could not verify your email address.')}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/events')}
                  variant="outline"
                  className="w-full"
                >
                  {t('auth.guestVerify.backToEvents', 'Back to Events')}
                </Button>
                <p className="text-sm text-gray-500">
                  {t('auth.guestVerify.needHelp', 'Need help?')}{' '}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                    {t('auth.guestVerify.contactSupport', 'Contact Support')}
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyGuestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Spinner size={64} className="text-blue-600 animate-spin" weight="bold" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  Loading...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyGuestContent />
    </Suspense>
  );
}
