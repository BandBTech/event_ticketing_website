"use client";

import { useEffect, useState, Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EnvelopeIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import cn from "clsx";
import { PhoneInput } from "@/components/ui/phone-input";
import { Country, isValidPhoneNumber } from "react-phone-number-input";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { createValidationHelpers } from "@/lib/validation";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const createGuestSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    first_name: z
      .string()
      .min(1, v.required("First name"))
      .min(2, v.minLength("First name", 2))
      .max(50, v.maxLength("First name", 50)),
    last_name: z
      .string()
      .min(1, v.required("Last name"))
      .min(2, v.minLength("Last name", 2))
      .max(50, v.maxLength("Last name", 50)),
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    phone: z
      .string()
      .min(1, v.required("Phone"))
      .refine((val) => isValidPhoneNumber(val), v.phone("Phone")),
    country_code: z.string().min(1, v.required("Country")),
    event_id: z.string().min(1, v.required("Event ID")),
    quantity: z
      .number()
      .min(1, v.min("Quantity", 1))
      .max(10, v.max("Quantity", 10)),
  });
};

interface MockGuestData {
  id: string;
  token: string;
}

interface MockResponse {
  success: boolean;
  data: MockGuestData;
  message: string;
}

// interface EventPreviewData {
//   id: string;
//   title: string;
//   image: string;
//   date: string;
//   venue: string;
//   city?: string;
//   address?: string;
//   organizer?: string;
//   minPrice?: number;
// }
interface EventPreviewData {
  id: string;
  title: string;
  image: string;
  date: string;
  venue: string;
  city?: string;
  address?: string;
  tier: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

function GuestPurchaseContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("event_id");
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const guestSchema = createGuestSchema(t);
  type GuestFormData = z.infer<typeof guestSchema>;

  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      country_code: "",
      event_id: "",
      quantity: 1,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");
  const [eventData, setEventData] = useState<EventPreviewData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  useEffect(() => {
    const loadEventDataAndDetectCountry = async () => {
      try {
        const storedEventData = localStorage.getItem("guestPurchase_event");
        if (storedEventData) {
          const parsedData = JSON.parse(storedEventData);
          setEventData(parsedData);

          if (parsedData.id) {
            guestForm.setValue("event_id", parsedData.id);
          }
        } else if (eventIdFromUrl) {
          guestForm.setValue("event_id", eventIdFromUrl);
        }

        const cachedCountry = sessionStorage.getItem("user_country_code");
        if (cachedCountry) {
          setDefaultCountry(cachedCountry as Country);
          return;
        }

        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.country_code) {
            setDefaultCountry(data.country_code as Country);
            sessionStorage.setItem("user_country_code", data.country_code);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load event data");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEventDataAndDetectCountry();
  }, [eventIdFromUrl, guestForm]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const onSubmit = async (data: GuestFormData) => {
    setLoading(true);
    setMessage("");
    setIsSuccess(null);
    // const toastId = toast.loading("Processing your purchase...");
    try {
      //     const res = await fetch(
      //       "https://sandbox.timroticket.com/api/v1/public/tickets/guest-purchase",
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //           accept: "application/json",
      //         },
      //         body: JSON.stringify(data),
      //       }
      //     );
      //     const responseData = await res.json();
      //     if (!res.ok){
      // console.log("Server response:", responseData);
      //       throw new Error(
      //         responseData?.message || "Failed to send verification email"
      //       );
      //     }
      const responseData: MockResponse = await new Promise((resolve) => {
        setTimeout(() => {
          const mockId = Date.now().toString();
          const mockToken = Math.random().toString(36).slice(2);
          resolve({
            success: true,
            data: {
              id: mockId,
              token: mockToken,
            },
            message: t("guestPurchase.token.success"),
          });
        }, 1500);
      });

      if (!responseData.success) {
        throw new Error(responseData.message || t("guestPurchase.token.error"));
      }

      const guestId = responseData.data.id;
      const token = responseData.data.token;
      const purchaseData = {
        event_title: eventData?.title || "Event",
        event_date: eventData?.date || new Date().toISOString(),
        event_venue: eventData?.venue || "Venue",
        tier_name: eventData?.tier.name,
        tier_price: eventData?.tier.price,
        tier_currency: eventData?.tier.currency,
        quantity: data.quantity,
        guest_name: `${data.first_name} ${data.last_name}`,
      };
      localStorage.setItem(
        "guest_purchase_success",
        JSON.stringify(purchaseData)
      );

      localStorage.setItem(
        `guest_${guestId}`,
        JSON.stringify({ ...data, token })
      );

      localStorage.setItem(`guest_token_${token}`, token);
      localStorage.removeItem("guestPurchase_event");

      setMessage(t("guestPurchase.success"));
      setIsSuccess(true);
      toast.success(
        t("guestPurchase.toast.success")
        // {
        //   id: toastId,
        //   duration: 8000,
        //   action: {
        //     label: "View Details",
        //     onClick: () => {},
        //   },
        // }
      );
      guestForm.reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went worong.";

      setMessage(errorMessage);
      setIsSuccess(false);
      toast.error(errorMessage, {
        // id: toastId,
        duration: 5000,
      });
      console.error("Purchase error", err);
    } finally {
      setLoading(false);
    }
  };
  const quantity = guestForm.watch("quantity");
  const totalPrice = eventData ? eventData.tier.price * quantity : 0;

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:py-20 bg-gray-50">
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {eventData && (
              <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <div className="relative w-full h-64 bg-gray-200">
                  <img
                    src={eventData.image}
                    alt={eventData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/api/placeholder/400/200";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-2xl mb-2">
                      {eventData.title}
                    </h3>
                    <p className="text-lg opacity-90">
                      {eventData.venue} • {eventData.city}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarIcon
                      size={20}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <span className="text-base">
                      {format(
                        new Date(eventData.date),
                        "EEEE, MMMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>

                  {eventData.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPinIcon
                        size={20}
                        className="text-red-600 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-base flex-1">
                        {eventData.address}
                      </span>
                    </div>
                  )}

                  {/* {eventData.organizer && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <UserIcon
                        size={20}
                        className="text-green-600 flex-shrink-0"
                      />
                      <span className="text-base">
                        Organized by {eventData.organizer}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
            )}

            {isLoadingEvent && !eventData && (
              <div className="glass-card rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-64 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            )}

            {/* {eventData && (
              <div className="glass-card rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t("guestPurchase.eventDetails.title")}
                </h3>
                <div className="space-y-3 text-gray-700"></div>
              </div>
            )} */}
          </div>

          <div className="glass-login-card rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              <div className="mb-2">
                <button
                  onClick={() => router.back()}
                  className="inline-flex cursor-pointer items-center gap-2  text-gray-700 hover:text-blue-600 rounded-lg transition-all duration-200"
                >
                  <ArrowLeftIcon size={18} />
                  <span className="font-medium">
                    {t("guestPurchase.goBack")}
                  </span>
                </button>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {eventData
                    ? t("guestPurchase.title.1")
                    : t("guestPurchase.title.2")}
                </h1>
                <p className="text-gray-600">{t("guestPurchase.subtitle")}</p>
              </div>

              <form
                onSubmit={guestForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name Fields */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("guestPurchase.form.firstName")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                        <UserIcon size={20} />
                      </div>
                      <input
                        {...guestForm.register("first_name")}
                        placeholder={t(
                          "guestPurchase.form.firstNamePlaceholder"
                        )}
                        className={cn(
                          "w-full border rounded-lg p-3 pl-10",
                          guestForm.formState.errors.first_name
                            ? "border-red-500"
                            : "border-gray-300"
                        )}
                      />
                    </div>
                    {guestForm.formState.errors.first_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {guestForm.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("guestPurchase.form.lastName")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                        <UserIcon size={20} />
                      </div>
                      <input
                        {...guestForm.register("last_name")}
                        placeholder={t(
                          "guestPurchase.form.lastNamePlaceholder"
                        )}
                        className={cn(
                          "w-full border rounded-lg p-3 pl-10",
                          guestForm.formState.errors.last_name
                            ? "border-red-500"
                            : "border-gray-300"
                        )}
                      />
                    </div>
                    {guestForm.formState.errors.last_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {guestForm.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div> */}

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t("guestPurchase.form.email")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                      <EnvelopeIcon size={20} />
                    </div>
                    <input
                      {...guestForm.register("email")}
                      placeholder={t("guestPurchase.form.emailPlaceholder")}
                      className={cn(
                        "w-full border rounded-lg p-3 pl-10",
                        guestForm.formState.errors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                    />
                  </div>
                  {guestForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {guestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                {/* Ticket Summary */}
                {eventData?.tier && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                    {/* Title */}
                    <p className="text-sm text-blue-700 font-medium mb-3">
                      Selected Ticket
                    </p>

                    {/* Content Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-900">
                          {eventData.tier.name}
                        </span>
                        <span className="text-sm text-gray-700 mt-1">
                          Quantity: {quantity}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(
                            eventData.tier.price,
                            eventData.tier.currency
                          )}
                        </span>
                        <span className="text-blue-800 font-bold text-lg mt-1">
                          Total:{" "}
                          {formatCurrency(totalPrice, eventData.tier.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Phone Field */}
                {/* <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t("auth.signup.phone", "Contact Number")}
                  </label>
                  <Controller
                    name="phone"
                    control={guestForm.control}
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            const countryMatch = value.match(/^\+\d{1,4}/);
                            guestForm.setValue(
                              "country_code",
                              countryMatch ? countryMatch[0] : ""
                            );
                          } else {
                            guestForm.setValue("country_code", "");
                          }
                        }}
                        defaultCountry={defaultCountry}
                        placeholder={t(
                          "auth.signup.phonePlaceholder",
                          "981-234-5678"
                        )}
                        className={cn(
                          guestForm.formState.errors.phone && "border-red-500"
                        )}
                      />
                    )}
                  />
                  {guestForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {guestForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                */}

                {/* Event ID & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("guestPurchase.form.eventId")}
                    </label>
                    <input
                      {...guestForm.register("event_id")}
                      placeholder={t("guestPurchase.form.eventId")}
                      readOnly={!!eventData}
                      className={cn(
                        "w-full border rounded-lg p-3",
                        guestForm.formState.errors.event_id
                          ? "border-red-500"
                          : "border-gray-300",
                        eventData && "bg-gray-100 cursor-not-allowed"
                      )}
                    />
                    {guestForm.formState.errors.event_id && (
                      <p className="text-sm text-red-500 mt-1">
                        {guestForm.formState.errors.event_id.message}
                      </p>
                    )}
                  </div>  */}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("guestPurchase.form.quantity")}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          guestForm.setValue(
                            "quantity",
                            Math.max(
                              1,
                              (guestForm.getValues("quantity") || 1) - 1
                            )
                          )
                        }
                        className="w-full h-12 flex items-center justify-center border border-gray-300 rounded-full text-xl hover:bg-gray-100"
                      >
                        –
                      </button>
                      <input
                        {...guestForm.register("quantity", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        readOnly
                        className={cn(
                          "w-full border rounded-lg p-3 text-center bg-gray-100 cursor-default",
                          guestForm.formState.errors.quantity
                            ? "border-red-500"
                            : "border-gray-300"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          guestForm.setValue(
                            "quantity",
                            Math.max(
                              1,
                              (guestForm.getValues("quantity") || 1) + 1
                            )
                          )
                        }
                        className="w-full h-12 flex items-center justify-center border border-gray-300 rounded-full text-xl hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    {guestForm.formState.errors.quantity && (
                      <p className="text-sm text-red-500 mt-1">
                        {guestForm.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("guestPurchase.form.button.processing")}
                    </div>
                  ) : (
                    t("guestPurchase.button.title")
                  )}
                </button>

                {message && (
                  <div
                    className={cn(
                      "p-4 rounded-lg border text-center",
                      isSuccess
                        ? "text-green-800 bg-green-50 border-green-200"
                        : "text-red-800 bg-red-50 border-red-200"
                    )}
                  >
                    <p className="font-medium">{message}</p>
                  </div>
                )}
              </form>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-600">
                <p>{t("guestPurchase.button.subtitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function GuestPurchaseLoading() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:py-20 bg-gray-50">
      <div className="w-full max-w-6xl relative z-10">
        <div className="mb-6">
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-64 bg-gray-300 rounded mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          <div className="glass-login-card rounded-2xl p-8 shadow-lg animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-300 rounded"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestPurchasePage() {
  return (
    <Suspense fallback={<GuestPurchaseLoading />}>
      <GuestPurchaseContent />
    </Suspense>
  );
}
