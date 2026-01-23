"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
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
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { createValidationHelpers } from "@/lib/validation";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

const createUserSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    event_id: z.string().min(1, v.required("Event ID")),
    quantity: z.number().min(1, v.min("Quantity", 1)).max(10, v.max("Quantity", 10)),
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

function UserPurchase() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("event_id");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [eventData, setEventData] = useState<EventPreviewData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const router = useRouter();

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const userSchema = createUserSchema(t);
  type UserFormData = z.infer<typeof userSchema>;

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      event_id: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    const loadEventData = async () => {
      try {
      
        const storedEventData = localStorage.getItem("userPurchase_event");
    
        if (!storedEventData) {
          const pendingPurchase = localStorage.getItem("pending_purchase");
          if (pendingPurchase) {
            try {
              const pendingData = JSON.parse(pendingPurchase);
              if (pendingData.eventData) {
                setEventData(pendingData.eventData);
                userForm.setValue("event_id", pendingData.eventData.id);
               
                if (pendingData.totalTickets) {
                  userForm.setValue("quantity", pendingData.totalTickets);
                }
                
                localStorage.removeItem("pending_purchase");
                setIsLoadingEvent(false);
                return;
              }
            } catch (err) {
              console.error("Failed to parse pending purchase:", err);
            }
          }
        }
      
        if (storedEventData) {
          const parsedData = JSON.parse(storedEventData);
          setEventData(parsedData);
          if (parsedData.id) {
            userForm.setValue("event_id", parsedData.id);
          }
          
          if (parsedData.totalTickets) {
            userForm.setValue("quantity", parsedData.totalTickets);
          }
        } else if (eventIdFromUrl) {
          userForm.setValue("event_id", eventIdFromUrl);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load event data");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEventData();
  }, [eventIdFromUrl, userForm]);

  const formatCurrency = (amount: number, currency: string = "NPR") => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const updateTierQuantity = (tierId: string, change: number) => {
    if (!eventData?.tier) return;
    
  
    const updatedTier = eventData.tier.map(tier => {
      if (tier.id === tierId) {
        const newQuantity = Math.max(0, tier.selectedQuantity + change);
        return { ...tier, selectedQuantity: newQuantity };
      }
      return tier;
    }).filter(tier => tier.selectedQuantity > 0);
       
    if (updatedTier.length === 0) {
        toast.info("All tickets removed. Returning to event page.");
             localStorage.removeItem("userPurchase_event");
      localStorage.removeItem("pending_purchase");
        router.back();
      } 

   
    const totalTickets = updatedTier.reduce((sum, tier) => sum + tier.selectedQuantity, 0);
    const totalAmount = updatedTier.reduce((sum, tier) => sum + (tier.price * tier.selectedQuantity), 0);
    
    const updatedEventData = {
      ...eventData,
      tier: updatedTier,
      totalTickets,
      totalAmount
    };
    
    setEventData(updatedEventData);
    userForm.setValue("quantity", totalTickets);
    

    localStorage.setItem("userPurchase_event", JSON.stringify(updatedEventData));
  };
  

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    setMessage("");
    setIsSuccess(null);
    

    if (!eventData?.tier || eventData.tier.length === 0) {
      toast.error("Please select at least one ticket");
      setLoading(false);
      return;
    }

    const totalTickets = eventData.tier.reduce((sum, tier) => sum + tier.selectedQuantity, 0);
    if (totalTickets === 0) {
      toast.error("Please select at least one ticket");
      setLoading(false);
      return;
    }
    
    try {
      // Mock API call (replace with actual API)
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

      const userId = responseData.data.id;
      const token = responseData.data.token;
      const purchaseData = {
        event_title: eventData?.title || "Event",
        event_date: eventData?.date || new Date().toISOString(),
        event_venue: eventData?.venue || "Venue",
        quantity: data.quantity,
        totalAmount: eventData?.totalAmount,
        tier: eventData?.tier || []
      };
      
      localStorage.setItem(
        "user_purchase_success",
        JSON.stringify(purchaseData)
      );

      localStorage.setItem(
        `user_${userId}`,
        JSON.stringify({ ...data, token })
      );

      localStorage.setItem(`userPurchase_token_${token}`, token);
      localStorage.removeItem("userPurchase_event");

      setMessage(t("guestPurchase.success"));
      setIsSuccess(true);
      toast.success(
        t("guestPurchase.toast.success")
      );
      userForm.reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";

      setMessage(errorMessage);
      setIsSuccess(false);
      toast.error(errorMessage, {
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
        {/* Back Button */}
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

            {isLoadingEvent && !eventData && (
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
                <div className="h-48 sm:h-64 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            )}
          </div>

          {/* Right Column: Form and Summary */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border border-gray-100 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {eventData ? t("userPurchase.title.1") : t("userPurchase.title.2")}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">{t("guestPurchase.subtitle")}</p>
              </div>

              <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-5">
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
                      {...userForm.register("email")}
                      placeholder={t("guestPurchase.form.emailPlaceholder")}
                      className={cn(
                        "w-full border rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        userForm.formState.errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                      )}
                    />
                  </div>
                  {userForm.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {userForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                {/* Ticket Summary */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                        Your Order
                      </p>
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                        {eventData?.tier?.reduce((acc, t) => acc + t.selectedQuantity, 0) || 0} Items
                      </span>
                    </div>

                    <div className="space-y-4">
                      {eventData?.tier?.map((tier) => (
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
                        {formatCurrency(eventData?.totalAmount || 0, eventData?.tier?.[0]?.currency || "NPR")}
                      </span>
                    </div>
                  </div>
               

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-4 rounded-xl active:scale-[0.98] transition-all font-bold text-lg shadow-lg"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("guestPurchase.form.button.processing")}
                    </div>
                  ) : (
                    t("userPurchase.button.title")
                  )}
                </Button>
            
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function UserPurchaseLoading() {
  return (
    <div className="min-h-screen relative flex items-start sm:items-center justify-center px-4 py-6 sm:py-20 bg-gray-50">
      <div className="w-full max-w-6xl relative z-10">
        <div className="mb-6">
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
              <div className="h-48 sm:h-64 bg-gray-300 rounded mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-pulse order-1 lg:order-2">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserPurchasePage() {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <Suspense fallback={<UserPurchaseLoading />}>
        <UserPurchase />
      </Suspense>
    </ProtectedRoute>
  );
}