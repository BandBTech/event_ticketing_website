"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr";
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
import { GuestRoute } from "@/components/auth/GuestRoute";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/pagetitle/PageTitle";

// Schema uses translation keys as message strings (deferred translation).
// TranslatedFormMessage calls t(key) on every render so errors update
// reactively when the locale changes.
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "auth.forgotPassword.validation.emailRequired")
    .email("auth.forgotPassword.validation.emailInvalid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // Populate email from sessionStorage if user navigated back
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("password_reset_email");
    if (savedEmail) {
      form.setValue("email", savedEmail);
      // Clear it after reading to avoid stale data
      sessionStorage.removeItem("password_reset_email");
    }
  }, [form]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(data.email);

      // Save email to sessionStorage for potential back navigation
      sessionStorage.setItem("password_reset_email", data.email);

      // Show success toast
      toast.success("auth.toast.passwordResetSent", "Password reset code sent to your email");

      // Redirect immediately to OTP verification page
      router.push(
        `/verify-otp?email=${encodeURIComponent(
          data.email,
        )}&type=password_reset`,
      );
    } catch (err) {
      // Show error toast
      if (err instanceof AuthError) {
        toast.error(
          "auth.forgotPassword.errors.requestFailed",
          "Failed to send reset email. Please try again.",
          err.details,
        );
      } else {
        toast.error(
          "auth.forgotPassword.errors.requestFailed",
          "Failed to send reset email. Please try again.",
        );
      }

      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title={t("forgotPassword.title", "Forgot Password")} />
      <GuestRoute>
        <div className="min-h-[calc(100vh-66px)] relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
          <div className="w-full max-w-[480px] relative z-10">
            <div className="relative">
              <div className="glass-login-card rounded-2xl p-4 sm:p-6">
                <div className="space-y-8 p-2 sm:p-3">
                  {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        <p className="text-sm font-medium text-gray-700">
                          {t(
                            "auth.forgotPassword.sendingVerificationCode",
                            "Sending verification code ...",
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                      {t("auth.forgotPassword.title", "Forgot Password")}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t(
                        "auth.forgotPassword.subtitle",
                        "Enter your email to receive a password reset code",
                      )}
                    </p>
                  </div>

                  <>
                    {/* Form */}
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        {/* Email Field */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-900">
                                {t(
                                  "auth.forgotPassword.email",
                                  "Email Address",
                                )}
                              </FormLabel>
                              <div className="relative">
                                <div
                                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                                  aria-hidden="true"
                                >
                                  <EnvelopeIcon
                                    weight="duotone"
                                    size={24}
                                    className="text-gray-600"
                                  />
                                </div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isLoading}
                                    placeholder={t(
                                      "auth.forgotPassword.emailPlaceholder",
                                      "Enter your email address",
                                    )}
                                    className={cn("h-12 pl-16 pr-4 login-input")}
                                  />
                                </FormControl>
                              </div>
                              <TranslatedFormMessage t={t} />
                            </FormItem>
                          )}
                        />

                        {/* Submit Button */}
                        <div className="space-y-4 pt-2">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                              "w-full h-12 rounded-lg font-medium transition-all duration-200",
                              "bg-blue-600 hover:bg-blue-700 text-white",
                              "shadow-lg hover:shadow-xl",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              isLoading && "animate-pulse",
                            )}
                          >
                            {isLoading
                              ? t("auth.forgotPassword.sending", "Sending...")
                              : t(
                                  "auth.forgotPassword.sendResetCode",
                                  "Send Reset Code",
                                )}
                          </Button>
                        </div>
                      </form>
                    </Form>

                    {/* Back to Login */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {t(
                          "auth.forgotPassword.rememberPassword",
                          "Remember your password?",
                        )}{" "}
                        <Link
                          href="/login"
                          className="font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          {t("auth.forgotPassword.loginHere", "Login here")}
                        </Link>
                      </p>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GuestRoute>
    </>
  );
}
