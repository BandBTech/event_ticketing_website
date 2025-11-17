"use client";

import { useState } from "react";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import {
  EyeIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeClosedIcon,
  UserIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Header } from "@/components/layout/Header";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Create validation schema with translations
const createSignupSchema = (t: (key: string, fallback?: string) => string) =>
  z
    .object({
      firstName: z
        .string()
        .min(
          2,
          t(
            "auth.signup.validation.firstNameTooShort",
            "First name must be at least 2 characters"
          )
        )
        .max(
          50,
          t("auth.signup.validation.firstNameTooLong", "First name is too long")
        ),
      lastName: z
        .string()
        .min(
          2,
          t(
            "auth.signup.validation.lastNameTooShort",
            "Last name must be at least 2 characters"
          )
        )
        .max(
          50,
          t("auth.signup.validation.lastNameTooLong", "Last name is too long")
        ),
      email: z
        .string()
        .min(1, t("auth.signup.validation.emailRequired", "Email is required"))
        .email(
          t(
            "auth.signup.validation.emailInvalid",
            "Please enter a valid email address"
          )
        ),
      phone: z
        .string()
        .min(1, t("auth.signup.validation.phoneRequired", "Contact number is required"))
        .refine(
          (val) => isValidPhoneNumber(val),
          t(
            "auth.signup.validation.phoneInvalid",
            "Please enter a valid phone number"
          )
        ),
      password: z
        .string()
        .min(
          8,
          t(
            "auth.signup.validation.passwordTooShort",
            "Password must be at least 8 characters"
          )
        )
        .max(
          100,
          t("auth.signup.validation.passwordTooLong", "Password is too long")
        )
        .regex(
          /[A-Z]/,
          t(
            "auth.signup.validation.passwordUppercase",
            "Password must contain at least one uppercase letter"
          )
        )
        .regex(
          /[a-z]/,
          t(
            "auth.signup.validation.passwordLowercase",
            "Password must contain at least one lowercase letter"
          )
        )
        .regex(
          /[0-9]/,
          t(
            "auth.signup.validation.passwordNumber",
            "Password must contain at least one number"
          )
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t(
        "auth.signup.validation.passwordMismatch",
        "Passwords do not match"
      ),
      path: ["confirmPassword"],
    });

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Detect country from IP on component mount
  React.useEffect(() => {
    const detectCountry = async () => {
      try {
        const cached = sessionStorage.getItem("user_country_code");
        if (cached) {
          setDefaultCountry(cached as Country);
          return;
        }

        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country_code) {
            setDefaultCountry(data.country_code as Country);
            sessionStorage.setItem("user_country_code", data.country_code);
          }
        }
      } catch (error) {
        console.log("Could not detect country, using default (NP)", error);
      }
    };

    detectCountry();
  }, []);

  const signupSchema = createSignupSchema(t);
  type SignupFormData = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setSignupError("");

    try {
      // Register the user
      await authService.register({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });

      // await authService.sendOTP({
      //   identifier: data.email,
      //   otp_type: "registration",
      // });

      toast.success(
        "auth.toast.otpSent",
        "Verification code sent to your email",
      );

      router.push(
        `/verify-otp?email=${encodeURIComponent(
          data.email
        )}&password=${encodeURIComponent(data.password)}&type=registration`
      );
    } catch (error) {
      if (error instanceof AuthError) {
        console.log('Registration error:', error.details, error.message);
        toast.error(
          "auth.toast.signupError",
          error.message || "Registration failed. Please try again.",
          typeof error.details === 'string' ? error.details : undefined
        );
      } else {
        toast.error(
          "auth.toast.signupError",
          "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="min-h-screen relative">
      {/* Background with animated orbs matching Figma design */}
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
                <div className="space-y-6 p-2 sm:p-3">
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row items-baseline gap-1">
                      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                        {t("auth.signup.title", "Register")}
                      </h1>
                      <span className="text-sm font-medium text-blue-500">
                        {t("auth.signup.subtitle", "as Attendee")}
                      </span>
                    </div>
                  </div>

                  {/* Signup Error */}
                  {signupError && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-destructive">{signupError}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName"
                          className="text-sm font-medium text-gray-900 block"
                        >
                          {t("auth.signup.firstName", "First Name")}
                        </label>
                        <div className="relative">
                          <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                            aria-hidden="true"
                          >
                            <UserIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          </div>
                          <Input
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            placeholder={t(
                              "auth.signup.firstNamePlaceholder",
                              "John"
                            )}
                            className={cn(
                              "h-12 pl-16 pr-4 login-input",
                              errors.firstName && "border-destructive"
                            )}
                            {...register("firstName")}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="text-sm font-medium text-gray-900 block"
                        >
                          {t("auth.signup.lastName", "Last Name")}
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          placeholder={t(
                            "auth.signup.lastNamePlaceholder",
                            "Doe"
                          )}
                          className={cn(
                            "h-12 login-input",
                            errors.lastName && "border-destructive"
                          )}
                          {...register("lastName")}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.email", "Email")}
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
                            "auth.signup.emailPlaceholder",
                            "Enter email address"
                          )}
                          className={cn(
                            "h-12 pl-16 pr-4 login-input",
                            errors.email && "border-destructive"
                          )}
                          {...register("email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Field with Country Selector */}
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.phone", "Contact Number")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            defaultCountry={defaultCountry}
                            placeholder={t(
                              "auth.signup.phonePlaceholder",
                              "981-234-5678"
                            )}
                            className={cn(errors.phone && "border-destructive")}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.password", "Password")}
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
                          autoComplete="new-password"
                          placeholder={t(
                            "auth.signup.passwordPlaceholder",
                            "••••••••••••"
                          )}
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
                              ? t("auth.signup.hidePassword", "Hide password")
                              : t("auth.signup.showPassword", "Show password")
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
                        <p className="text-sm text-destructive" role="alert">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.confirmPassword", "Confirm Password")}
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
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={t(
                            "auth.signup.confirmPasswordPlaceholder",
                            "••••••••••••"
                          )}
                          className={cn(
                            "h-12 pl-16 pr-16 login-input",
                            errors.confirmPassword && "border-destructive"
                          )}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                        >
                          {showConfirmPassword ? (
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
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Get Started Button - matching Figma */}
                    <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "w-full h-12 rounded-lg font-medium transition-all duration-200",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                          "shadow-lg hover:shadow-xl flex items-center justify-center gap-3",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isLoading && "animate-pulse"
                        )}
                      >
                        {isLoading ? (
                          t("auth.signup.signingUp", "Creating account...")
                        ) : (
                          <>
                            {t("auth.signup.signupButton", "Get Started")}
                            <ArrowRightIcon size={20} weight="bold" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Footer Section */}
                  <div className="space-y-4">
                    {/* Login Link */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {t(
                          "auth.signup.haveAccount",
                          "Already have an account?"
                        )}{" "}
                        <Link
                          href="/login"
                          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {t("auth.signup.loginHere", "Sign in as Attendee.")}
                        </Link>
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200/50"></div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center pt-3">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {t(
                          "auth.signup.termsPrefix",
                          "By continuing, you consent to the fact that you have read and understood our"
                        )}{" "}
                        <Link
                          href="/terms"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {t("auth.signup.terms", "terms and conditions")}
                        </Link>{" "}
                        {t("auth.signup.termsAnd", "and")}{" "}
                        <Link
                          href="/privacy"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {t("auth.signup.privacy", "privacy policy")}
                        </Link>
                        .
                      </p>
                    </div>
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
    </GuestRoute>
  );
}
