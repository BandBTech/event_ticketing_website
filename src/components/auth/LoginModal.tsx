"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeClosedIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const createLoginSchema = () => {
  return z.object({
    email: z.string().min(1, "auth.login.validation.emailRequired"),
    password: z.string().min(1, "auth.login.validation.passwordRequired"),
    rememberMe: z.boolean(),
  });
};

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login, isLoading, clearError } = useAuthStore();

  const loginSchema = useMemo(() => createLoginSchema(), []);
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
    reset,
    formState: { errors },
  } = form;

  const rememberMe = watch("rememberMe") ?? false;

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    try {
      await login(
        {
          email: data.email,
          password: data.password,
        },
        data.rememberMe
      );

      toast.success("auth.toast.loginSuccess", "Welcome back!");
      reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.code) {
          case "UNAUTHORIZED":
            toast.error("", error.message || "Invalid email or password");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {t("auth.login.title", "Log In")}
          </DialogTitle>
          <DialogDescription>
            {t("auth.login.modalDescription", "Sign in to your account to continue with your purchase.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="modal-email"
              className="text-sm font-medium text-gray-900 block"
            >
              {t("auth.login.email", "Email")}
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                aria-hidden="true"
              >
                <EnvelopeIcon weight="duotone" size={20} className="text-gray-500" />
              </div>
              <Input
                id="modal-email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                placeholder={t("auth.login.emailPlaceholder", "Enter your email")}
                className={cn(
                  "h-11 pl-10 pr-4",
                  errors.email && "border-destructive"
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {t(errors.email.message as string)}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="modal-password"
              className="text-sm font-medium text-gray-900 block"
            >
              {t("auth.login.password", "Password")}
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                aria-hidden="true"
              >
                <KeyIcon weight="duotone" size={20} className="text-gray-500" />
              </div>
              <Input
                id="modal-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                placeholder={t("auth.login.passwordPlaceholder", "Enter your password")}
                className={cn(
                  "h-11 pl-10 pr-12",
                  errors.password && "border-destructive"
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeIcon weight="duotone" size={20} />
                ) : (
                  <EyeClosedIcon weight="duotone" size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {t(errors.password.message as string)}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="modal-remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
                disabled={isLoading}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor="modal-remember-me"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {t("auth.login.rememberMe", "Remember me")}
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              {t("auth.login.forgotPassword", "Forgot password?")}
            </Link>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full h-11 rounded-lg font-medium",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "shadow-md hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isLoading && "animate-pulse"
            )}
          >
            {isLoading ? t("auth.login.signingIn", "Signing in...") : t("auth.login.loginButton", "Log In")}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              {t("auth.login.noAccount", "Don't have an account?")}{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                {t("auth.login.signUpHere", "Sign up")}
              </Link>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
