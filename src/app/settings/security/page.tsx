'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EyeIcon, EyeClosedIcon, KeyIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService, AuthError } from '@/lib/authService';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Validation schema
const createChangePasswordSchema = (t: (key: string, fallback?: string) => string) => z.object({
  currentPassword: z
    .string()
    .min(1, t('settings.security.validation.currentPasswordRequired', 'Current password is required')),
  newPassword: z
    .string()
    .min(8, t('settings.security.validation.passwordTooShort', 'Password must be at least 8 characters'))
    .max(100, t('settings.security.validation.passwordTooLong', 'Password is too long'))
    .regex(/[A-Z]/, t('settings.security.validation.passwordUppercase', 'Must contain uppercase letter'))
    .regex(/[a-z]/, t('settings.security.validation.passwordLowercase', 'Must contain lowercase letter'))
    .regex(/[0-9]/, t('settings.security.validation.passwordNumber', 'Must contain number')),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('settings.security.validation.passwordMismatch', 'Passwords do not match'),
  path: ['confirmPassword'],
});

export default function SecuritySettingsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = createChangePasswordSchema(t);
  type ChangePasswordFormData = z.infer<typeof schema>;

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      toast.success('settings.toast.passwordChanged', 'Password changed successfully!');
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
      if (error instanceof AuthError) {
        const errorDescription = error.details 
          ? (typeof error.details === 'string' ? error.details : JSON.stringify(error.details))
          : undefined;
        toast.error('settings.toast.passwordChangeFailed', error.message || 'Failed to change password', errorDescription);
      } else {
        toast.error('settings.toast.passwordChangeFailed', 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t('settings.security.title', 'Security Settings')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('settings.security.subtitle', 'Manage your password and authentication')}
        </p>
      </div>

      {/* Change Password Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('settings.security.changePassword', 'Change Password')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('settings.security.changePasswordDesc', 'Update your password to keep your account secure')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-900 block">
              {t('settings.security.currentPassword', 'Current Password')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyIcon weight='duotone' size={18} className="text-gray-600" />
              </div>
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t('settings.security.currentPasswordPlaceholder', 'Enter current password')}
                className={cn(
                  "h-11 pl-11 pr-12",
                  errors.currentPassword && "border-destructive"
                )}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? (
                  <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                ) : (
                  <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-900 block">
              {t('settings.security.newPassword', 'New Password')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyIcon weight='duotone' size={18} className="text-gray-600" />
              </div>
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t('settings.security.newPasswordPlaceholder', 'Enter new password')}
                className={cn(
                  "h-11 pl-11 pr-12",
                  errors.newPassword && "border-destructive"
                )}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                ) : (
                  <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 block">
              {t('settings.security.confirmPassword', 'Confirm New Password')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyIcon weight='duotone' size={18} className="text-gray-600" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t('settings.security.confirmPasswordPlaceholder', 'Confirm new password')}
                className={cn(
                  "h-11 pl-11 pr-12",
                  errors.confirmPassword && "border-destructive"
                )}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                ) : (
                  <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? t('settings.security.updating', 'Updating...') : t('settings.security.updateButton', 'Update Password')}
            </Button>
            <Button
              type="button"
              onClick={() => reset()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600"
            >
              {t('settings.security.cancelButton', 'Cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
