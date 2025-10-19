'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Header } from '@/components/layout/Header';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService, AuthError } from '@/lib/authService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpType, setOtpType] = useState('registration');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const passwordParam = searchParams.get('password');
    const typeParam = searchParams.get('type') || 'registration';
    
    if (!emailParam) {
      router.push('/signup');
      return;
    }
    
    setEmail(emailParam);
    setPassword(passwordParam || '');
    setOtpType(typeParam);
  }, [searchParams, router]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError(t('auth.verifyOTP.errors.otpIncomplete', 'Please enter the complete 6-digit code'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Verify OTP
      await authService.verifyOTP({
        identifier: email,
        otp_code: otp,
        otp_type: otpType,
      });

      // Show success toast
      toast.success('auth.toast.otpVerified', 'Email verified successfully!');

      // Handle different OTP types
      if (otpType === 'password_reset') {
        // For password reset, redirect to reset password page
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      } else if (password) {
        // For registration, auto-login
        await login({
          email,
          password,
        });
        router.push('/');
      } else {
        // Fallback to homepage
        router.push('/');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      
      // Show error toast
      if (err instanceof AuthError) {
        toast.error('auth.toast.serverError', err.message || 'Invalid OTP. Please try again.');
      } else {
        toast.error('auth.toast.serverError', 'Invalid OTP. Please try again.');
      }
      setOtp(''); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      await authService.sendOTP({
        identifier: email,
        otp_type: otpType,
      });

      setError('');
      // Show success toast
      toast.success('auth.toast.otpResent', 'New code sent to your email');
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      // Show error toast
      toast.error('auth.toast.serverError', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />
        
        <div className="absolute -top-96 -right-96 w-[1800px] h-[800px] rounded-full opacity-30">
          <div className="w-full h-full bg-gradient-radial from-orange-300 via-orange-200 to-transparent animate-pulse" 
               style={{ filter: 'blur(140px)' }} />
        </div>
        
        <div className="absolute -bottom-96 -left-96 w-[1900px] h-[1000px] rounded-full opacity-25">
          <div className="w-full h-full bg-gradient-radial from-blue-400 via-blue-300 to-transparent animate-pulse" 
               style={{ filter: 'blur(140px)', animationDelay: '2s' }} />
        </div>
        
        <div className="absolute -top-96 left-24 w-[1600px] h-[800px] rounded-full opacity-20">
          <div className="w-full h-full bg-gradient-radial from-purple-400 via-blue-400 to-transparent animate-pulse" 
               style={{ filter: 'blur(200px)', animationDelay: '4s' }} />
        </div>
        
        <div className="absolute inset-0 opacity-50" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E8F0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }} 
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-20">
          <div className="w-full max-w-[410px]">
            <div className="relative">
              <div className="glass-login-card rounded-2xl p-4 sm:p-6">
                
                <div className="space-y-6 p-2 sm:p-3">
                  {/* Back Button */}
                  <Link 
                    href="/signup"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeftIcon size={16} />
                    {t('auth.verifyOTP.back', 'Back')}
                  </Link>

                  {/* Header */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                      {t('auth.verifyOTP.title', 'Verify Your Email')}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t('auth.verifyOTP.subtitle', 'Enter the 6-digit code sent to')}<br />
                      <strong>{email}</strong>
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* OTP Input */}
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={1} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={2} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={3} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={4} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={5} className="h-14 w-14 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {/* Verify Button */}
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading || otp.length < 6}
                      className={cn(
                        "w-full h-12 rounded-lg font-medium transition-all duration-200",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        "shadow-lg hover:shadow-xl",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isLoading && "animate-pulse"
                      )}
                    >
                      {isLoading ? t('auth.verifyOTP.verifying', 'Verifying...') : t('auth.verifyOTP.verifyButton', 'Verify Email')}
                    </Button>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      {t('auth.verifyOTP.didntReceive', "Didn't receive the code?")}{' '}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isResending ? t('auth.verifyOTP.resending', 'Resending...') : t('auth.verifyOTP.resend', 'Resend')}
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('auth.verifyOTP.checkSpam', 'Check your spam folder if you don\'t see the email')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Developed by B&B Tech Group
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
