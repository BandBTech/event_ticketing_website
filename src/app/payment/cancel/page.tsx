"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  TicketIcon,
  HouseIcon,
  SealCheckIcon,
  ExcludeIcon,
  XCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { queryKeys } from "@/lib/queryKeys";
import { paymentService } from "@/services/paymentService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function PaymentCancelledContent() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const checkoutToken = useSearchParams().get("checkout_token") || "";

  const { data, status, error } = useQuery({
    queryKey: queryKeys.payment.cancel(checkoutToken.trim()),
    queryFn: () => paymentService.cancelledPayment(checkoutToken.trim()),
    enabled: !!checkoutToken,
    retry: false,
  });

  // No checkout token in query params — invalid access
  if (!checkoutToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <WarningCircleIcon size={32} weight="duotone" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("ticketPurchase.invalidAccess", "Purchase Cancelled")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t(
              "ticketPurchase.invalidAccessMessage",
              "Payment was not completed.",
            )}
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            {t("common.returnHome", "Return to Home")}
          </Button>
        </div>
      </div>
    );
  }

  // Show loader until the API call explicitly succeeds
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-gray-500 font-semibold animate-pulse">
            {t("ticketPurchase.validatingPayment", "Verifying your payment...")}
          </p>
        </div>
      </div>
    );
  }

  // Error state — only reached when status === "error"
  if (status === "error") {
    const msg =
      error instanceof Error
        ? error.message
        : "Payment could not be confirmed.";
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <SealCheckIcon size={32} weight="duotone" className="rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t(
              "ticketPurchase.cancellationFailed",
              "Payment Cancellation Failed",
            )}
          </h1>
          <p className="text-gray-600 mb-6">{msg}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            {t("common.returnHome", "Return to Home")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        {/* Animated check icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-in zoom-in duration-300">
          <XCircleIcon size={40} weight="duotone" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("ticketPurchase.cancelledTitle", "Purchase Cancelled")}
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          {t(
            "ticketPurchase.cancelledMessage",
            "Payment was not completed.",
          )}
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-12 text-base font-medium text-gray-600 hover:bg-gray-50"
          >
            <HouseIcon size={20} className="mr-2" />
            {t("common.returnHome", "Return to Home")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
