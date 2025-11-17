"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeClosedIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/layout/Header";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/authService";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { tokenManager } from "@/lib/tokenManager";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Create validation schema with translations
const createLoginSchema = (t: (key: string, fallback?: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired"))
      .email(t("auth.login.validation.emailInvalid")),
    password: z
      .string()
      .min(6, t("auth.login.validation.passwordTooShort"))
      .max(100, t("auth.login.validation.passwordTooLong")),
    rememberMe: z.boolean(),
  });

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login, isLoading, clearError } = useAuthStore();

  const [loginError, setLoginError] = useState("");

  const loginSchema = createLoginSchema(t);
  type LoginFormData = z.infer<typeof loginSchema>;

  // Check for saved credentials on component mount
  const savedCredentials = tokenManager.getSavedCredentials();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedCredentials?.email || "",
      password: savedCredentials?.password || "",
      rememberMe: tokenManager.hasCredentialsSaved(),
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const rememberMe = watch("rememberMe") ?? false;

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");
    clearError();

    try {
      // Call real API login with remember me preference
      await login(
        {
          email: data.email,
          password: data.password,
        },
        data.rememberMe
      );

      // Save or clear credentials based on Remember Me
      if (data.rememberMe) {
        tokenManager.saveCredentials(data.email, data.password);
      } else {
        tokenManager.clearCredentials();
      }

      // Show success toast
      toast.success("auth.toast.loginSuccess", "Welcome back!");

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);

      // Handle different error types and show toast
      if (error instanceof AuthError) {
        switch (error.code) {
          case "UNAUTHORIZED":
            toast.error(
              "auth.toast.invalidCredentials",
              "Invalid email or password"
            );
            break;
          case "NETWORK_ERROR":
            toast.error(
              "auth.toast.networkError",
              "Network error. Please check your connection."
            );
            break;
          default:
            toast.error(
              "auth.toast.loginError",
              error.message || "Login failed. Please try again."
            );
        }
      } else {
        toast.error("auth.toast.loginError", "Login failed. Please try again.");
      }
    }
  };

  return (
    <GuestRoute>
      <div className="min-h-screen relative">
        {/* Background with animated orbs matching Figma design */}
        <div className="fixed inset-0 overflow-hidden">
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />

          {/* Animated gradient orbs - matching Figma design */}
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

          {/* Texture overlay */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E8F0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-20">
            <div className="w-full max-w-[480px]">
              {/* Login Card - Glassmorphic design matching Figma */}
              <div className="relative">
                <div className="glass-login-card rounded-2xl p-4 sm:p-6">
                  <div className="space-y-6 p-2 sm:p-3">
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row items-baseline gap-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                          {t("auth.login.title")}
                        </h1>
                        <span className="text-sm font-medium text-blue-500">
                          {t("auth.login.subtitle")}
                        </span>
                      </div>
                    </div>

                    {/* Login Error */}
                    {loginError && (
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium">
                          {loginError} Error text
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
                          {t("auth.login.email")}
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
                            placeholder={t("auth.login.emailPlaceholder")}
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

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-900 block"
                        >
                          {t("auth.login.password")}
                        </label>
                        <div className="relative">
                          <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                            aria-hidden="true"
                          >
                            <KeyIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder={t("auth.login.passwordPlaceholder")}
                            className={cn(
                              "h-12 pl-16 pr-16 login-input",
                              errors.password && "border-destructive"
                            )}
                            {...register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword
                                ? t("auth.login.hidePassword")
                                : t("auth.login.showPassword")
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                          >
                            {showPassword ? (
                              <EyeIcon
                                weight="duotone"
                                size={24}
                                className="text-gray-600"
                              />
                            ) : (
                              <EyeClosedIcon
                                weight="duotone"
                                size={24}
                                className="text-gray-600"
                              />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p
                            className="text-sm text-destructive font-medium"
                            role="alert"
                          >
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="remember-me"
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                              setValue("rememberMe", !!checked)
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <label
                            htmlFor="remember-me"
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {t("auth.login.rememberMe")}
                          </label>
                        </div>

                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {t("auth.login.forgotPassword")}
                        </Link>
                      </div>

                      {/* Login Button */}
                      <div className="space-y-4">
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
                            ? t("auth.login.signingIn")
                            : t("auth.login.loginButton")}
                        </Button>
                      </div>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {t("auth.login.noAccount")}{" "}
                        <Link
                          href="/signup"
                          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {t("auth.login.signUpHere")}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
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
