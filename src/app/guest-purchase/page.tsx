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
  MinusIcon,
  PlusIcon,
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
import { Button } from "@/components/ui/button";

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
    tier_name: string;
    price: number;
    currency: string;
    selectedQuantity: number;
  }[];
  totalAmount: number;
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const updateTierQuantity = (tierId: string, quantity: number) => {
    if (!eventData) return;

    const updatedTiers = eventData.tier
      .map((t) => {
        if (t.id === tierId) {
          const newQty = Math.max(0, t.selectedQuantity + quantity);
          return { ...t, selectedQuantity: newQty };
        }
        return t;
      })
      .filter((t) => t.selectedQuantity > 0);

    const newTotalTickets = updatedTiers.reduce(
      (acc, t) => acc + t.selectedQuantity,
      0,
    );
    const newTotalAmount = updatedTiers.reduce(
      (acc, t) => acc + t.price * t.selectedQuantity,
      0,
    );
    const newEventData = {
      ...eventData,
      tier: updatedTiers,
      totalAmount: newTotalAmount,
    };
    setEventData(newEventData);
    guestForm.setValue("quantity", newTotalTickets);
    localStorage.setItem("guestPurchase_event", JSON.stringify(newEventData));

    if (updatedTiers.length === 0) {
      toast.info("All tickets removed. Returning to event page.");
      router.back();
    }
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
        tickets: eventData?.tier.map((tier) => ({
          name: tier.tier_name,
          price: tier.price,
          quantity: tier.selectedQuantity,
          currency: tier.currency,
        })),
        quantity: data.quantity,
        guest_name: `${data.first_name} ${data.last_name}`,
      };
      localStorage.setItem(
        "guest_purchase_success",
        JSON.stringify(purchaseData),
      );

      localStorage.setItem(
        `guest_${guestId}`,
        JSON.stringify({ ...data, token }),
      );

      localStorage.setItem(`guest_token_${token}`, token);
      localStorage.removeItem("guestPurchase_event");

      setMessage(t("guestPurchase.success"));
      setIsSuccess(true);
      toast.success(
        t("guestPurchase.toast.success"),
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

  return (
 <div className="min-h-screen relative flex items-start sm:items-center justify-center px-4 py-6 sm:py-20 bg-gray-50">
      <div className="w-full max-w-6xl relative z-10">
 <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t("guestPurchase.goBack")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Event Details */}
          <div className="space-y-6 order-2 lg:order-1">
            {eventData && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200">
           <div className="relative w-full h-48 sm:h-64 bg-gray-200">
                  <img
                    src={eventData.image}
                    alt={eventData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/api/placeholder/400/200"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-xl sm:text-2xl mb-1 line-clamp-2">
                      {eventData.title}
                    </h3>
                    <p className="text-sm sm:text-lg opacity-90 truncate">
                      {eventData.venue} • {eventData.city}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3 text-gray-700">
                    <CalendarIcon size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-sm sm:text-base leading-tight">
                      {format(new Date(eventData.date), "EEEE, MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>

                  {eventData.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPinIcon size={20} className="text-red-600 mt-1 flex-shrink-0" />
                      <span className="text-sm sm:text-base flex-1">
                        {eventData.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form and Summary */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border border-gray-100 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {eventData ? t("guestPurchase.title.1") : t("guestPurchase.title.2")}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">{t("guestPurchase.subtitle")}</p>
              </div>

              <form onSubmit={guestForm.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    {t("guestPurchase.form.email")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <EnvelopeIcon size={20} />
                    </div>
                    <input
                      {...guestForm.register("email")}
                      placeholder={t("guestPurchase.form.emailPlaceholder")}
                      className={cn(
                        "w-full border rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        guestForm.formState.errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                      )}
                    />
                  </div>
                  {guestForm.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {guestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Ticket Summary */}
                {eventData?.tier && eventData.tier.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                        Your Order
                      </p>
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                        {eventData.tier.reduce((acc, t) => acc + t.selectedQuantity, 0)} Items
                      </span>
                    </div>

                    <div className="space-y-4">
                      {eventData.tier.map((tier) => (
                        <div key={tier.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">
                              {tier.tier_name}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {formatCurrency(tier.price, tier.currency)} / ticket
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            
                            <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => updateTierQuantity(tier.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <MinusIcon size={16} weight="bold" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 text-sm">
                                {tier.selectedQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateTierQuantity(tier.id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                              >
                                <PlusIcon size={16} weight="bold" />
                              </button>
                            </div>
                            
                            <div className="text-right font-bold text-blue-900 text-sm sm:text-base min-w-[80px]">
                              {formatCurrency(tier.price * tier.selectedQuantity, tier.currency)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 flex justify-between items-center border-t border-blue-200">
                      <span className="font-bold text-gray-900">Grand Total</span>
                      <span className="text-xl sm:text-2xl font-black text-blue-700">
                        {formatCurrency(eventData.totalAmount, eventData.tier[0]?.currency || "NPR")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 font-bold text-lg shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("guestPurchase.form.button.processing")}
                    </div>
                  ) : (
                    t("guestPurchase.button.title")
                  )}
                </Button>
            
               {message && (
                  <div
                    className={cn(
                      "p-4 rounded-lg border text-center",
                      isSuccess
                        ? "text-green-800 bg-green-50 border-green-200"
                        : "text-red-800 bg-red-50 border-red-200",
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

