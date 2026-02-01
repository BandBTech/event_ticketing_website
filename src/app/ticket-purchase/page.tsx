"use client";

import { useState, Suspense } from "react";
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
import { ticketService, GuestPurchasePayload, UserPurchasePayload } from "@/services/ticketService";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { createValidationHelpers } from "@/lib/validation";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const createGuestSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    tier_id: z.string().min(1, t("ticketPurchase.selectTierError", "Please select a ticket type.")),
    quantity: z.number().min(1).max(10),
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

  // Form for Guest Details
  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      tier_id: "",
      quantity: 1,
      email: "",
    },
  });

  const selectedTierId = guestForm.watch("tier_id");
  const quantity = guestForm.watch("quantity");
  const [promoCode, setPromoCode] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  // const selectedTier = eventData?.tier.find((t) => t.id === selectedTierId);
  const selectedTier = eventData?.ticketTypes.find((t) => t.id === selectedTierId);
  const totalAmount = selectedTier ? selectedTier.price * quantity : 0;

  const handleContinue = async () => {
    if (!eventData || !selectedTier) return;

    if (step === 1) {
      if (!selectedTierId) {
        toast.error("Please select a ticket type");
        return;
      }

      if (isAuthenticated) {
        // Logged-in user purchase - Skip Step 2 and submit directly
        const userPayload: UserPurchasePayload = {
          event_id: eventData.id,
          tier_id: selectedTier.id,
          quantity: quantity,
          payment_gateway: "cash",
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
          tier_id: selectedTier.id,
          quantity: quantity,
          payment_gateway: "cash",
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

            {/* Step 1: Ticket Selection */}
            {step === 1 && (
              <div className="glass-card-lower rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <TicketIcon weight="duotone" className="w-6 h-6 mr-2 text-primary" />
                    {t("ticketPurchase.selectTickets", "Select Tickets")}
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <RadioGroup
                    value={selectedTierId}
                    onValueChange={(val) => {
                      guestForm.setValue("tier_id", val);
                    }}
                    className="space-y-3"
                  >
                    {eventData.ticketTypes.map((ticketType) => (
                      <div
                        key={ticketType.id}
                        className={cn(
                          "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-blue-100 hover:bg-blue-50/30",
                          selectedTierId === ticketType.id
                            ? "border-primary bg-blue-50/50 text-primary"
                            : "border-gray-100 bg-white"
                        )}
                        onClick={() => {
                          guestForm.setValue("tier_id", ticketType.id);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem className="mt-1 size-5" value={ticketType.id} id={ticketType.id} />
                          <div>
                            <Label htmlFor={ticketType.id} className="font-bold text-gray-900 text-lg cursor-pointer">
                              {ticketType.tier_name}
                            </Label>
                            {ticketType.description && (
                              <p className="text-sm text-gray-500 mt-1 pr-4">{ticketType.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(ticketType.price, ticketType.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Quantity Selector (Only shows if a tier is selected) */}
                  {selectedTier && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <Label className="block text-sm font-medium text-gray-700 mb-3">{t('ticketPurchase.quantity', 'Quantity')}</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => guestForm.setValue("quantity", Math.max(1, quantity - 1))}
                          disabled={quantity <= 1 || isPending}
                          className="size-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointer active:scale-95 transition-all group disabled:cursor-not-allowed"
                        >
                          <MinusIcon size={20} className="group-hover:text-primary group-hover:scale-110 transition-transform" />
                        </Button>
                        <span className="text-2xl font-bold text-primary w-12 text-center">{quantity}</span>
                        <Button
                          onClick={() => guestForm.setValue("quantity", Math.min(isAuthenticated ? 10 : 5, quantity + 1))}
                          variant="outline"
                          size="icon"
                          disabled={quantity >= (isAuthenticated ? 10 : 5) || isPending}
                          className="size-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointer active:scale-95 transition-all group disabled:cursor-not-allowed"
                        >
                          <PlusIcon size={20} className="group-hover:text-primary group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                      {/* Info bar for guests at max quantity */}
                      {!isAuthenticated && quantity >= 5 && (
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-2">
                          <UserIcon size={18} className="text-blue-600 flex-shrink-0" />
                          <p className="text-sm text-blue-700">
                            {t('ticketPurchase.loginForMoreTickets', 'Please login to buy up to 10 tickets at once')}
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



                {/* Payment Method - Currently Cash (Stripe commented for future) */}
                {/*
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <MoneyIcon className="w-6 h-6 mr-2 text-green-600" />
                    {t('ticketPurchase.paymentMethod', 'Payment Method')}
                  </h2>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                        <MoneyIcon size={24} weight="duotone" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t('ticketPurchase.cashPayment', 'Cash Payment')}</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-primary">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                */}

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
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('ticketPurchase.ticketType', 'Ticket Type')}</span>
                      <span className="font-medium text-gray-900 text-right">{selectedTier ? selectedTier.tier_name : "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('ticketPurchase.quantity', 'Quantity')}</span>
                      <span className="font-medium text-gray-900">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('ticketPurchase.pricePerTicket', 'Price/ticket')}</span>
                      <span className="font-medium text-gray-900">
                        {selectedTier ? formatCurrency(selectedTier.price, selectedTier.currency) : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code - Commented out for future implementation
                <div>
                  <div className="flex items-center mb-2">
                    <TagIcon size={16} className="text-primary mr-2" />
                    <span className="text-sm font-bold text-gray-900">{t('ticketPurchase.discountCode', 'Discount Code')}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <Button variant="outline" className="text-sm">{t('common.apply', 'Apply')}</Button>
                  </div>
                </div>
                */}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-2xl text-primary">
                      {selectedTier ? formatCurrency(totalAmount, selectedTier.currency) : "-"}
                    </span>
                  </div>

                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-200"
                    disabled={isPending || !selectedTier}
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

