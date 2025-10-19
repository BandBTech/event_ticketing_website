"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EnvelopeIcon, ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Create validation schema
const createForgotPasswordSchema = (
  t: (key: string, fallback?: string) => string
) =>
  z.object({
    email: z
      .string()
      .min(
        1,
        t("auth.forgotPassword.validation.emailRequired", "Email is required")
      )
      .email(
        t(
          "auth.forgotPassword.validation.emailInvalid",
          "Please enter a valid email address"
        )
      ),
  });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const schema = createForgotPasswordSchema(t);
  type ForgotPasswordFormData = z.infer<typeof schema>;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await authService.requestPasswordReset(data.email);

      // Show success toast
      toast.success(
        "auth.toast.passwordResetSent",
        "Password reset code sent to your email"
      );

      // Redirect immediately to OTP verification page
      router.push(
        `/verify-otp?email=${encodeURIComponent(
          data.email
        )}&type=password_reset`
      );
    } catch (err) {
      console.error("Password reset request failed:", err);

      // Show error toast
      if (err instanceof AuthError) {
        toast.error(
          "auth.toast.serverError",
          err.message || "Failed to send reset email. Please try again."
        );
      } else {
        toast.error(
          "auth.toast.serverError",
          "Failed to send reset email. Please try again."
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="min-h-screen relative">
        {/* Background with animated orbs */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />

          <div className="absolute -top-96 -right-96 w-[1800px] h-[800px] rounded-full opacity-30">
            <div
              className="w-full h-full bg-gradient-radial from-orange-300 via-orange-200 to-transparent animate-pulse"
              style={{ filter: "blur(140px)" }}
            />
          </div>

          <div className="absolute -bottom-96 -left-96 w-[1900px] h-[1000px] rounded-full opacity-25">
            <div
              className="w-full h-full bg-gradient-radial from-blue-400 via-blue-300 to-transparent animate-pulse"
              style={{ filter: "blur(140px)", animationDelay: "2s" }}
            />
          </div>

          <div className="absolute -top-96 left-24 w-[1600px] h-[800px] rounded-full opacity-20">
            <div
              className="w-full h-full bg-gradient-radial from-purple-400 via-blue-400 to-transparent animate-pulse"
              style={{ filter: "blur(200px)", animationDelay: "4s" }}
            />
          </div>

          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E8F0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-20">
            <div className="w-full max-w-[480px]">
              <div className="relative">
                <div className="glass-login-card rounded-2xl p-4 sm:p-6">
                  <div className="space-y-8 p-2 sm:p-3">
                    {/* Back Button */}
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeftIcon size={16} />
                      {t("auth.forgotPassword.backToLogin", "Back to login")}
                    </Link>

                    {/* Header */}
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                        {t("auth.forgotPassword.title", "Forgot Password")}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {t(
                          "auth.forgotPassword.subtitle",
                          "Enter your email to receive a password reset code"
                        )}
                      </p>
                    </div>

                    {
                      <>
                        {/* Error Message */}
                        {error && (
                          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="text-sm text-destructive font-medium">
                              {error}
                            </p>
                          </div>
                        )}

                        {/* Form */}
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="space-y-8"
                        >
                          {/* Email Field */}
                          <div className="space-y-2">
                            <label
                              htmlFor="email"
                              className="text-sm font-medium text-gray-900 block"
                            >
                              {t("auth.forgotPassword.email", "Email Address")}
                            </label>
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
                              <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder={t(
                                  "auth.forgotPassword.emailPlaceholder",
                                  "Enter your email address"
                                )}
                                className={cn(
                                  "h-12 pl-16 pr-4 login-input",
                                  errors.email && "border-destructive"
                                )}
                                {...register("email")}
                              />
                            </div>
                            {errors.email && (
                              <p
                                className="text-sm text-destructive font-medium"
                                role="alert"
                              >
                                {errors.email.message}
                              </p>
                            )}
                          </div>

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
                                isLoading && "animate-pulse"
                              )}
                            >
                              {isLoading
                                ? t("auth.forgotPassword.sending", "Sending...")
                                : t(
                                    "auth.forgotPassword.sendResetCode",
                                    "Send Reset Code"
                                  )}
                            </Button>
                          </div>
                        </form>

                        {/* Back to Login */}
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            {t(
                              "auth.forgotPassword.rememberPassword",
                              "Remember your password?"
                            )}{" "}
                            <Link
                              href="/login"
                              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {t("auth.forgotPassword.loginHere", "Login here")}
                            </Link>
                          </p>
                        </div>
                      </>
                    }
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
    </GuestRoute>
  );
}
