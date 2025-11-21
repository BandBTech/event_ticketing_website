"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserIcon,
  EnvelopeIcon,
  CheckIcon,
  PencilSimpleLineIcon,
} from "@phosphor-icons/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createValidationHelpers } from "@/lib/validation";
import { isValidPhoneNumber } from "react-phone-number-input";

// Validation schema
const createProfileSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    firstName: z
      .string()
      .min(1, v.required("First name"))
      .min(3, v.minLength("First name", 3))
      .max(50, v.maxLength("First name", 50)),
    lastName: z
      .string()
      .min(1, v.required("Last name"))
      .min(3, v.minLength("Last name", 3))
      .max(50, v.maxLength("Last name", 50)),
    phone: z
      .string()
      .min(1, v.required("Contact number"))
      .refine((val) => isValidPhoneNumber(val), v.phone("Phone")),
  });
};

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = createProfileSchema(t);
  type ProfileFormData = z.infer<typeof schema>;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      await authService.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || undefined,
      });

      // Fetch updated profile
      await fetchProfile();

      toast.success(
        "profile.toast.updateSuccess",
        "Profile updated successfully!"
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      if (error instanceof AuthError) {
        toast.error(
          "profile.toast.updateError",
          error.message || "Failed to update profile"
        );
      } else {
        toast.error("profile.toast.updateError", "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative flex flex-col">
        {/* Background */}
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
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                    {t("profile.title", "My Profile")}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {t("profile.subtitle", "Manage your personal information")}
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-primary text-primary bg-white hover:bg-blue-50 shadow-lg"
                  >
                    <PencilSimpleLineIcon size={16} weight="duotone" />
                    {t("profile.editButton", "Edit Profile")}
                  </Button>
                )}
              </div>

              {/* Profile Card */}
              <div className="glass-card rounded-2xl p-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                    {user?.isEmailVerified && (
                      <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        ✓ Email Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-6 space-y-6"
                >
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("profile.personalInfo", "Personal Information")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName"
                          className="text-sm font-medium text-gray-900 block"
                        >
                          {t("profile.firstName", "First Name")}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full">
                            <UserIcon
                              weight="duotone"
                              size={20}
                              className="text-gray-600"
                            />
                          </div>
                          <Input
                            id="firstName"
                            type="text"
                            disabled={!isEditing}
                            className={cn(
                              "h-12 pl-16 pr-4",
                              !isEditing && "bg-gray-50 cursor-not-allowed",
                              errors.firstName && "border-destructive"
                            )}
                            {...register("firstName")}
                          />
                        </div>
                        {errors.firstName && (
                          <p
                            className="text-sm text-destructive font-medium"
                            role="alert"
                          >
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="text-sm font-medium text-gray-900 block"
                        >
                          {t("profile.lastName", "Last Name")}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full">
                            <UserIcon
                              weight="duotone"
                              size={20}
                              className="text-gray-600"
                            />
                          </div>
                          <Input
                            id="lastName"
                            type="text"
                            disabled={!isEditing}
                            className={cn(
                              "h-12 pl-16 pr-4",
                              !isEditing && "bg-gray-50 cursor-not-allowed",
                              errors.lastName && "border-destructive"
                            )}
                            {...register("lastName")}
                          />
                        </div>
                        {errors.lastName && (
                          <p
                            className="text-sm text-destructive font-medium"
                            role="alert"
                          >
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("profile.email", "Email")}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full">
                          <EnvelopeIcon
                            weight="duotone"
                            size={20}
                            className="text-gray-600"
                          />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="h-12 pl-16 pr-4 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {t("profile.emailNote", "Email cannot be changed")}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("profile.phone", "Phone Number")}
                      </label>
                      <PhoneInput
                        value={form.watch("phone") || ""}
                        onChange={(value) =>
                          form.setValue("phone", value || "", {
                            shouldDirty: true,
                          })
                        }
                        disabled={!isEditing}
                        defaultCountry="NP"
                        className={cn(
                          !isEditing && "opacity-50 cursor-not-allowed",
                          errors.phone && "border-destructive"
                        )}
                      />
                      {errors.phone && (
                        <p
                          className="text-sm text-destructive font-medium"
                          role="alert"
                        >
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        disabled={isLoading || !isDirty}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckIcon size={16} />
                        {isLoading
                          ? t("profile.saving", "Saving...")
                          : t("profile.saveButton", "Save Changes")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 border-0 shadow-sm"
                      >
                        {t("profile.cancelButton", "Cancel")}
                      </Button>
                    </div>
                  )}
                </form>
              </div>

              {/* Organization Section (if user has one) */}
              {user?.organization && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("profile.organization", "Organization")}
                  </h3>
                  <div className="flex items-center gap-4">
                    {user.organization.logo_url ? (
                      <Image
                        src={user.organization.logo_url}
                        alt={user.organization.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {user.organization.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {user.organization.name}
                      </h4>
                      {user.organization.description && (
                        <p className="text-sm text-gray-600">
                          {user.organization.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
