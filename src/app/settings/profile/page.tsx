"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { UnsavedChangesDialog } from "@/components/modals/UnsavedChangesDialog";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

const FIRST_NAME_MAX = 50;
const LAST_NAME_MAX = 50;

// Validation schema using translation keys as message strings (deferred translation).
// TranslatedFormMessage reads these keys and calls t() on every render, so
// validation messages update reactively when the locale changes — same pattern
// used in admin and organizer repos.
const createProfileSchema = () => {
  return z.object({
    firstName: z
      .string()
      .min(1, "profile.validation.firstNameRequired")
      .min(3, "profile.validation.firstNameMinLength")
      .max(50, "profile.validation.firstNameMaxLength"),
    lastName: z
      .string()
      .min(1, "profile.validation.lastNameRequired")
      .min(3, "profile.validation.lastNameMinLength")
      .max(50, "profile.validation.lastNameMaxLength"),
    phone: z
      .string()
      .min(1, "profile.validation.phoneRequired")
      .refine(
        (val) => typeof val === "string" && isValidPhoneNumber(val),
        { message: "profile.validation.phoneInvalid" },
      ),
  });
};

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export default function ProfileSettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = useMemo(() => createProfileSchema(), []);

  // Helper function to combine country code and phone number
  const getFullPhoneNumber = (phone?: string, countryCode?: string): string => {
    if (!phone) return "";
    if (!countryCode) return phone;
    // If phone already starts with +, return as is
    if (phone.startsWith("+")) return phone;
    // Combine country code and phone number
    return `${countryCode}${phone}`;
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    },
    mode: "onChange",
  });

  const { isDirty } = form.formState;

  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({
      hasUnsavedChanges,
      onBeforeLeave: () => {
        form.reset(form.getValues());
      },
    });

  const isInitialMount = useRef(true);
  const prevUserRef = useRef<string | null>(null);

  // Update form when user data changes (e.g., after profile fetch)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserRef.current = JSON.stringify(user);
      return;
    }

    const currentUserStr = JSON.stringify(user);
    if (user && prevUserRef.current !== currentUserStr) {
      prevUserRef.current = currentUserStr;
      const fullPhone =
        user.phone && user.countryCode && !user.phone.startsWith("+")
          ? `${user.countryCode}${user.phone}`
          : user.phone || "";

      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: fullPhone,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      // Parse phone number if provided to extract country code
      let parsedPhone = data.phone;
      let countryCode: string | undefined = undefined;

      if (data.phone && isValidPhoneNumber(data.phone)) {
        const parsed = parsePhoneNumber(data.phone);
        if (parsed) {
          parsedPhone = parsed.nationalNumber;
          countryCode = `+${parsed.countryCallingCode}`;
        }
      }

      await authService.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: parsedPhone || undefined,
        country_code: countryCode,
      });

      await fetchProfile();
      toast.success(
        "settings.toast.profileUpdated",
        "Profile updated successfully!",
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      if (error instanceof AuthError) {
        toast.error(
          "settings.toast.updateFailed",
          error.message || "Failed to update profile",
        );
      } else {
        toast.error("settings.toast.updateFailed", "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    });
    setIsEditing(false);
  };

  return (
    <>
      <PageTitle title={t("profile.title", "My Profile")} />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">
              {t("settings.profile.title", "Profile Settings")}
            </h1>
            <p className="text-sm text-gray-600">
              {t(
                "settings.profile.subtitle",
                "Manage your personal information",
              )}
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
              }}
            >
              <PencilIcon size={16} weight="duotone" />
              {t("settings.profile.editButton", "Edit Profile")}
            </Button>
          )}
        </div>

        {/* Profile Form */}
        <div className="glass-card rounded-xl p-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.isEmailVerified && (
                <span className="inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  ✓ {t("setting.emailverified", "Verified")}
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-6 relative"
            >
              {isEditing && isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-medium text-gray-700">
                      {t("common.updating", "Updating")}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        required
                        className="text-sm font-medium text-gray-900"
                      >
                        {t("settings.profile.firstName", "First Name")}
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <UserIcon
                            weight="duotone"
                            size={18}
                            className="text-gray-600"
                          />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={!isEditing || isLoading}
                            className={cn(
                              "h-11 pl-11 pr-4",
                              (!isEditing || isLoading) &&
                                "bg-gray-50 cursor-not-allowed",
                            )}
                            maxLength={FIRST_NAME_MAX}
                          />
                        </FormControl>
                      </div>
                      {isEditing && (
                        <div className="flex justify-between items-center mt-1 min-h-[20px]">
                          <TranslatedFormMessage t={t} className="mt-0" />
                          <div className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0}/{FIRST_NAME_MAX}{" "}
                            {t("common.characters", "characters")}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        required
                        className="text-sm font-medium text-gray-900"
                      >
                        {t("settings.profile.lastName", "Last Name")}
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <UserIcon
                            weight="duotone"
                            size={18}
                            className="text-gray-600"
                          />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={!isEditing || isLoading}
                            className={cn(
                              "h-11 pl-11 pr-4",
                              (!isEditing || isLoading) &&
                                "bg-gray-50 cursor-not-allowed",
                            )}
                            maxLength={LAST_NAME_MAX}
                          />
                        </FormControl>
                      </div>
                      {isEditing && (
                        <div className="flex justify-between items-center mt-1 min-h-[20px]">
                          <TranslatedFormMessage t={t} className="mt-0" />
                          <div className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0}/{LAST_NAME_MAX}{" "}
                            {t("common.characters", "characters")}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900 block"
                >
                  {t("settings.profile.email", "Email Address")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <EnvelopeIcon
                      weight="duotone"
                      size={18}
                      className="text-gray-600"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="h-11 pl-11 pr-4 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {t("settings.profile.emailNote", "Email cannot be changed")}
                </p>
              </div>

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-medium text-gray-900"
                    >
                      {t("settings.profile.phone", "Phone Number")}
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value || "")}
                        disabled={!isEditing || isLoading}
                        defaultCountry="NP"
                        className={cn(
                          (!isEditing || isLoading) &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      />
                    </FormControl>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isLoading || !isDirty}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading
                      ? t("settings.profile.saving", "Saving...")
                      : t("settings.profile.saveButton", "Save Changes")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600"
                  >
                    {t("settings.profile.cancelButton", "Cancel")}
                  </Button>
                </div>
              )}
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
    </>
  );
}
