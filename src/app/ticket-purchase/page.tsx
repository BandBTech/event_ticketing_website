"use client";

import { useState, useMemo, Suspense } from "react";
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
  TicketIcon,
} from "@phosphor-icons/react";
import cn from "clsx";
import { GuestPurchasePayload, UserPurchasePayload } from "@/services/ticketService";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { createValidationHelpers } from "@/lib/validation";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEventById } from "@/hooks/useEvents";
import { useAuthStore } from "@/store/authStore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronRightIcon } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { Separator } from "@/components/ui/separator-extended";
import { useGuestPurchaseMutation, useUserPurchaseMutation } from "@/hooks/useTickets";

// Max total tickets allowed
const GUEST_MAX_QUANTITY = 6;
const USER_MAX_QUANTITY = 10;

const createGuestSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
  });
};

type GuestFormData = z.infer<ReturnType<typeof createGuestSchema>>;


function GuestPurchaseContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("event_id");
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const guestSchema = createGuestSchema(t);

  const [step, setStep] = useState<1 | 2>(1);

  const { data: eventData, isLoading: isLoadingEvent } = useEventById(eventIdFromUrl || "");
  const guestPurchaseMutation = useGuestPurchaseMutation();
  const userPurchaseMutation = useUserPurchaseMutation();

  const isPending = guestPurchaseMutation.isPending || userPurchaseMutation.isPending;

  // Per-tier quantity state: { [tier_id]: quantity }
  const [tierQuantities, setTierQuantities] = useState<Record<string, number>>({});

  // Form for Guest Details (email only)
  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      email: "",
    },
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const maxQuantity = isAuthenticated ? USER_MAX_QUANTITY : GUEST_MAX_QUANTITY;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Compute total quantity across all tiers
  const totalQuantity = useMemo(() => {
    return Object.values(tierQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [tierQuantities]);

  // Compute selected tiers (those with quantity > 0) for order summary and payload
  const selectedTiers = useMemo(() => {
    if (!eventData) return [];
    return eventData.ticketTypes
      .filter((tt) => (tierQuantities[tt.id] || 0) > 0)
      .map((tt) => ({
        ...tt,
        selectedQty: tierQuantities[tt.id] || 0,
        subtotal: tt.price * (tierQuantities[tt.id] || 0),
      }));
  }, [eventData, tierQuantities]);

  // Compute grand total
  const totalAmount = useMemo(() => {
    return selectedTiers.reduce((sum, st) => sum + st.subtotal, 0);
  }, [selectedTiers]);

  // Get a default currency from the first ticket type
  const defaultCurrency = eventData?.ticketTypes?.[0]?.currency || "USD";

  const handleTierQuantityChange = (tierId: string, delta: number) => {
    setTierQuantities((prev) => {
      const current = prev[tierId] || 0;
      const newQty = Math.max(0, current + delta);

      // Check total limit
      const otherTotal = Object.entries(prev)
        .filter(([id]) => id !== tierId)
        .reduce((sum, [, qty]) => sum + qty, 0);

      if (otherTotal + newQty > maxQuantity) {
        toast.error(
          t("ticketPurchase.maxQuantityReached", `Maximum ${maxQuantity} tickets allowed in total`)
        );
        return prev;
      }

      return { ...prev, [tierId]: newQty };
    });
  };

  const handleContinue = async () => {
    if (!eventData) return;

    if (totalQuantity === 0) {
      toast.error(t("ticketPurchase.selectAtLeastOne", "Please select at least one ticket"));
      return;
    }

    // Build tiers array for the API
    const tiersPayload = selectedTiers.map((st) => ({
      tier_id: st.id,
      quantity: st.selectedQty,
    }));

    if (step === 1) {
      if (isAuthenticated) {
        // Logged-in user purchase - Skip Step 2 and submit directly
        const userPayload: UserPurchasePayload = {
          event_id: eventData.id,
          payment_gateway: "cash",
          tiers: tiersPayload,
        };
        userPurchaseMutation.mutate(userPayload);
      } else {
        setStep(2);
        window.scrollTo(0, 0);
      }
    } else {
      // Step 2: Guest Submit
      guestForm.handleSubmit((data) => {
        const guestPayload: GuestPurchasePayload = {
          first_name: "",
          last_name: "",
          email: data.email || "",
          phone: "",
          country_code: "",
          event_id: eventData.id,
          payment_gateway: "cash",
          tiers: tiersPayload,
        };
        guestPurchaseMutation.mutate(guestPayload);
      })();
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!eventData) {
    return <div>Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header / Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            onClick={() => {
              if (step === 2) setStep(1);
              else router.push(`/events/detail/?id=${eventIdFromUrl}`);
            }}
            variant="ghost"
            className="hover:bg-white! hover:shadow-sm transition-shadow"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            {step === 1 ? t('ticketPurchase.backToEvent', 'Back to Event') : t('ticketPurchase.backToSelection', 'Back to Selection')}
          </Button>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 text-sm">
              <span className={cn("font-medium", step >= 1 ? "text-primary" : "text-gray-400")}>{t('ticketPurchase.selectTickets', 'Select Tickets')}</span>
              <span className="text-gray-300"><ChevronRightIcon className="w-5 h-5" /></span>
              <span className={cn("font-medium", step >= 2 ? "text-primary" : "text-gray-400")}>{isAuthenticated ? t('ticketPurchase.payment', 'Payment') : t('ticketPurchase.detailsAndPayment', 'Details & Payment')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Multi-Tier Ticket Selection */}
            {step === 1 && (
              <div className="glass-card-lower rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <TicketIcon weight="duotone" className="w-6 h-6 mr-2 text-primary" />
                      {t("ticketPurchase.selectTickets", "Select Tickets")}
                    </h2>
                    {/* Total quantity indicator */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold px-3 py-1 rounded-full transition-colors",
                        totalQuantity > 0
                          ? totalQuantity >= maxQuantity
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary/10 text-primary"
                          : "bg-gray-100 text-gray-400"
                      )}>
                        {totalQuantity} / {maxQuantity}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("ticketPurchase.multiTierHint", `Select quantities for each ticket type (max ${maxQuantity} total)`)}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {eventData.ticketTypes.map((ticketType) => {
                    const qty = tierQuantities[ticketType.id] || 0;
                    const isAtMaxTotal = totalQuantity >= maxQuantity;

                    return (
                      <div
                        key={ticketType.id}
                        className={cn(
                          "relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 transition-all",
                          qty > 0
                            ? "border-primary bg-blue-50/50"
                            : "border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/30"
                        )}
                      >
                        {/* Tier Info */}
                        <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                          <div className="flex items-center gap-2">
                            <Label className="font-bold text-gray-900 text-lg">
                              {ticketType.tier_name}
                            </Label>
                            {qty > 0 && (
                              <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                {qty}×
                              </span>
                            )}
                          </div>
                          {ticketType.description && (
                            <p className="text-sm text-gray-500 mt-1 pr-4">{ticketType.description}</p>
                          )}
                          <p className="font-bold text-lg text-primary mt-1">
                            {formatCurrency(ticketType.price, ticketType.currency)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTierQuantityChange(ticketType.id, -1)}
                            disabled={qty <= 0 || isPending}
                            className="size-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointer active:scale-95 transition-all group disabled:cursor-not-allowed"
                          >
                            <MinusIcon size={18} className="group-hover:text-primary group-hover:scale-110 transition-transform" />
                          </Button>
                          <span className={cn(
                            "text-xl font-bold w-8 text-center transition-colors",
                            qty > 0 ? "text-primary" : "text-gray-300"
                          )}>
                            {qty}
                          </span>
                          <Button
                            onClick={() => handleTierQuantityChange(ticketType.id, 1)}
                            variant="outline"
                            size="icon"
                            disabled={isAtMaxTotal || isPending}
                            className="size-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointer active:scale-95 transition-all group disabled:cursor-not-allowed"
                          >
                            <PlusIcon size={18} className="group-hover:text-primary group-hover:scale-110 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Info bar for guests at max quantity */}
                  {!isAuthenticated && totalQuantity >= GUEST_MAX_QUANTITY && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <UserIcon size={18} className="text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        {t('ticketPurchase.loginForMoreTickets', `Please login to buy up to ${USER_MAX_QUANTITY} tickets at once`)}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="ml-auto text-blue-700 font-semibold p-0 h-auto"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        {t('auth.login.loginButton', 'Log In')}
                      </Button>
                    </div>
                  )}

                  {/* Info bar for logged-in users at max quantity */}
                  {isAuthenticated && totalQuantity >= USER_MAX_QUANTITY && (
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <TicketIcon size={18} className="text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        {t('ticketPurchase.maxReached', `Maximum of ${USER_MAX_QUANTITY} tickets reached`)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Guest Details / Payment */}
            {step === 2 && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <div className="glass-card-lower rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <TicketIcon className="w-6 h-6 mr-2 text-primary" />
                      {t('ticketPurchase.ticketDeliveryInformation', 'Ticket Delivery Information')}
                    </h2>
                    <Form {...guestForm}>
                      <form className="space-y-4">
                        <FormField
                          control={guestForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.signup.email', 'Email Address')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <EnvelopeIcon className="absolute left-3 top-3.5 text-gray-400 z-10" size={18} />
                                  <Input placeholder="john@example.com" {...field} className="pl-10 h-11" />
                                </div>
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">
                                {t('ticketPurchase.emailDeliveryNote', 'Your ticket will be sent to this email address')}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>

                    {/* Login Prompt if not logged in */}
                    {!isAuthenticated && (
                      <>
                        <div className="my-6 w-full flex items-center justify-center gap-2 overflow-hidden">
                          <Separator variant="dashed" className="flex-grow" />
                          <span className="text-sm text-muted-foreground">OR</span>
                          <Separator variant="dashed" className="flex-grow" />
                        </div>
                        <div className="bg-blue-50 mt-6 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                              <UserIcon size={20} weight="bold" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900">{t('auth.signup.haveAccount', 'Already have an account?')}</p>
                              <p className="text-xs text-blue-700">{t('auth.signup.loginToSkip', 'Log in to skip entering your details.')}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => setIsLoginModalOpen(true)}
                          >
                            {t('auth.login.loginButton', 'Log In')}
                          </Button>
                        </div>
                      </>
                    )}

                  </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <UserIcon size={32} weight="duotone" />
                    </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900">{t('ticketPurchase.loggedIn', 'Logged In')}</h3>
                        <p className="text-green-700 mt-1">
                          {t('ticketPurchase.loggedInInfo', 'Please proceed to checkout.')}
                        </p>
                      </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Summary - Always Visible */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              {/* Event Mini Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                  <img src={eventData.imageUrl} alt={eventData.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{eventData.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CalendarIcon size={14} className="mr-1" />
                    {format(new Date(eventData.startDate), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <MapPinIcon size={14} className="mr-1" />
                    {`${eventData.venue?.name}, ${eventData.venue?.address}`}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">{t('ticketPurchase.orderSummary', 'Order Summary')}</h4>

                  {selectedTiers.length === 0 ? (
                    <div className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                      {t('ticketPurchase.noTicketsSelected', 'No tickets selected')}
                    </div>
                  ) : (
                      <div className="space-y-3">
                        {selectedTiers.map((st) => (
                          <div key={st.id} className="flex justify-between items-start text-sm">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{st.tier_name}</p>
                              <p className="text-xs text-gray-500">
                                {st.selectedQty} × {formatCurrency(st.price, st.currency)}
                              </p>
                            </div>
                          <span className="font-bold text-gray-900 ml-3">
                            {formatCurrency(st.subtotal, st.currency)}
                          </span>
                        </div>
                      ))}
                        <div className="border-t border-gray-100 pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('ticketPurchase.totalTickets', 'Total Tickets')}</span>
                            <span className="font-medium text-gray-900">{totalQuantity}</span>
                          </div>
                        </div>
                      </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-2xl text-primary">
                      {totalAmount > 0 ? formatCurrency(totalAmount, defaultCurrency) : "-"}
                    </span>
                  </div>

                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-200"
                    disabled={isPending || totalQuantity === 0}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                        {t("common.processing", "Processing...")}
                      </span>
                    ) : step === 1 ? (
                        t("common.continue", "Continue")
                    ) : (
                          t("ticketPurchase.proceedToCheckout", "Proceed to Checkout")
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-400 mt-3">
                    {step === 2 && "By placing order you agree to our terms."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function GuestPurchasePage() {
  return (
    <Suspense fallback={<div />}>
      <GuestPurchaseContent />
    </Suspense>
  );
}
