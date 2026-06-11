"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EyeClosedIcon,
  KeyIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { UnsavedChangesDialog } from "@/components/modals/UnsavedChangesDialog";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

// Schema uses translation keys as message strings (deferred translation).
// TranslatedFormMessage calls t(key) on every render so errors update
// reactively when the locale changes.
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "settings.security.validation.currentPasswordRequired"),
    newPassword: z
      .string()
      .min(1, "settings.security.validation.newPasswordRequired")
      .min(8, "settings.security.validation.passwordTooShort")
      .max(100, "settings.security.validation.passwordTooLong")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])/,
        "auth.signup.validation.passwordUpperLower",
      )
      .regex(/[^A-Za-z0-9]/, "auth.signup.validation.passwordSpecialChar")
      .regex(/[0-9]/, "auth.signup.validation.passwordNumber"),
    confirmPassword: z
      .string()
      .min(1, "settings.security.validation.confirmPasswordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "auth.signup.validation.passwordMismatch",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({
      hasUnsavedChanges,
      onBeforeLeave: () => {
        reset();
      },
    });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      // Password changed successfully, now logout and redirect
      toast.success(
        "auth.toast.passwordChanged",
        "Password changed successfully",
        t("auth.toast.passwordChangedLogin"),
      );

      // Use setTimeout to ensure toast is shown before logout
      setTimeout(async () => {
        await logout();
        router.push("/login");
      }, 500);
    } catch (error) {
      setIsLoading(false);
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Failed to change password",
          error.details,
        );
      } else {
        toast.error(
          "auth.toast.passwordChangeFailed",
          "Failed to change password",
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <PageTitle title={t("security.title", "Security")} />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t("settings.security.title", "Security Settings")}
        </h1>
        <p className="text-sm text-gray-600">
          {t(
            "settings.security.subtitle",
            "Manage your password and authentication",
          )}
        </p>
      </div>

      {/* Change Password Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("settings.security.changePassword", "Change Password")}
            </h2>
            <p className="text-sm text-gray-600">
              {t(
                "settings.security.changePasswordDesc",
                "Update your password regularly to keep your account secure",
              )}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative space-y-6"
          >
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("common.updating", "Updating")}
                  </p>
                </div>
              </div>
            )}

            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t("settings.security.currentPassword", "Current Password")}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon
                        weight="duotone"
                        size={18}
                        className="text-gray-600"
                      />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading}
                        placeholder={t(
                          "settings.security.currentPasswordPlaceholder",
                          "Enter current password",
                        )}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showCurrentPassword ? (
                        <EyeIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      ) : (
                        <EyeClosedIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      )}
                    </button>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t("settings.security.newPassword", "New Password")}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon
                        weight="duotone"
                        size={18}
                        className="text-gray-600"
                      />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isLoading}
                        placeholder={t(
                          "settings.security.newPasswordPlaceholder",
                          "Enter new password",
                        )}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showNewPassword ? (
                        <EyeIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      ) : (
                        <EyeClosedIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      )}
                    </button>
                  </div>
                  <TranslatedFormMessage t={t} />
                  <PasswordRequirements password={form.watch("newPassword")} />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t(
                      "settings.security.confirmPassword",
                      "Confirm New Password",
                    )}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon
                        weight="duotone"
                        size={18}
                        className="text-gray-600"
                      />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isLoading}
                        placeholder={t(
                          "settings.security.confirmPasswordPlaceholder",
                          "Enter new password again",
                        )}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      ) : (
                        <EyeClosedIcon
                          size={18}
                          className="text-gray-600"
                          weight="duotone"
                        />
                      )}
                    </button>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading
                  ? t("settings.security.updating", "Updating...")
                  : t("settings.security.updateButton", "Update Password")}
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {t("common.cancelButton", "Cancel")}
              </Button>
            </div>
          </form>
        </Form>

        <UnsavedChangesDialog
          open={showLeaveDialog}
          onOpenChange={setShowLeaveDialog}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />
      </div>
    </div>
  );
}
