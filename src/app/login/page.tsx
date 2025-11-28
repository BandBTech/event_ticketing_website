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
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/authService";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createValidationHelpers } from "@/lib/validation";

// Create validation schema with translations
const createLoginSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);

  return z.object({
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    password: z
      .string()
      .min(1, v.required("Password"))
      .min(8, v.minLength("Password", 8))
      .max(100, v.maxLength("Password", 100))
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, v.passwordUpperLower())
      .regex(/[^A-Za-z0-9]/, v.passwordSpecialChar())
      .regex(/[0-9]/, v.passwordNumber()),
    rememberMe: z.boolean(),
  });
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login, isLoading, clearError } = useAuthStore();

  const [loginError, setLoginError] = useState("");

  const loginSchema = createLoginSchema(t);
  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
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



      // Show success toast
      toast.success("auth.toast.loginSuccess", "Welcome back!");

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      // Handle different error types and show toast
      if (error instanceof AuthError) {
        switch (error.code) {
          case "UNAUTHORIZED":
            toast.error(
              "",
              error.message || "Invalid email or password"
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
      <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
        <div className="w-full max-w-[480px] relative z-10">
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
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
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
      </div>
    </GuestRoute>
  );
}
