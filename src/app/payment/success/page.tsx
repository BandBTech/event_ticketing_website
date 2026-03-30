"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/lib/apiClient";
import { useLanguageStore } from "@/store/languageStore";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface CheckoutStatus {
  success: boolean;
  status?: "processing" | "completed" | "failed";
  message: string;
  data?: {
    checkout_token?: string;
    payment_info?: {
      id: string;
      amount?: number;
      currency?: string;
    };
    ticket_count?: number;
    ticket_view_token?: string;
    ticket_view_url?: string;
  };
  tickets_created?: boolean;
  ticket_count?: number;
  ticket_view_token?: string;
  ticket_view_url?: string;
  error?: string;
}

type PageStatus =
  | "connecting"
  | "polling"
  | "processing"
  | "completed"
  | "failed";

function PaymentSuccessContent() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  let checkoutToken = "";
  let searchParams;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    searchParams = useSearchParams();
    checkoutToken = searchParams.get("checkout_token") || "";
  } catch (error) {
    console.error("[PAYMENT_SUCCESS] Error getting search params:", error);
  }

  console.log(
    "[PAYMENT_SUCCESS] Component rendered, checkoutToken:",
    checkoutToken,
  );
  console.log(
    "[PAYMENT_SUCCESS] searchParams:",
    searchParams ? Object.fromEntries(searchParams.entries()) : "null",
  );

  // Polling state
  const [status, setStatus] = useState<PageStatus>("connecting");
  const [ticketCount, setTicketCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<string>("");

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /**
   * MAIN EFFECT: Start polling when token is available
   */
  useEffect(() => {
    console.log(
      "[PAYMENT_SUCCESS] useEffect triggered, checkoutToken:",
      checkoutToken,
    );

    if (!checkoutToken) {
      console.log("[PAYMENT_SUCCESS] No checkout token, skipping polling");
      return;
    }

    console.log("[PAYMENT_SUCCESS] Starting polling for token:", checkoutToken);
    startPolling(checkoutToken);

    // Cleanup function
    return () => {
      if (pollIntervalRef.current) {
        console.log("[PAYMENT_SUCCESS] Clearing poll interval");
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [checkoutToken]);

  /**
   * START POLLING: Poll every 2 seconds for up to 30 seconds
   */
  function startPolling(token: string) {
    const POLL_INTERVAL = 2000; // 2 seconds
    const MAX_WAIT_TIME = 30000; // 30 seconds
    let attempts = 0;

    console.log("[POLL_START] Starting polling for token:", token);
    setStatus("polling");
    startTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      const elapsed = Date.now() - startTimeRef.current;

      console.log(`[POLL_ATTEMPT] ${attempts} (${elapsed}ms elapsed)`);

      try {
        console.log(
          `[POLL_ATTEMPT] Making API call to: /public/checkout/${token}`,
        ); // Use the common API client for external polling
        const data: CheckoutStatus = await api.get<CheckoutStatus>(
          `/public/checkout/${token}`,
          {
            showErrorToast: false, // Handle errors manually in polling
            requiresAuth: false,
          },
        );
        console.log("[POLL_RESPONSE] Status:", data);

        // Update status message
        if (data.message) {
          setLastMessage(data.message);
        }

        // ✅ PAYMENT COMPLETED - SUCCESS!
        if (data.status === "completed") {
          console.log("[POLL_SUCCESS] ✅ Payment completed!");
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;

          setStatus("completed");

          // Extract from nested data.data structure
          const ticketData = data.data;
          setTicketCount(ticketData?.ticket_count || 1);

          // Redirect to ticket view URL if available
          if (ticketData?.ticket_view_url) {
            console.log(
              "[POLL_SUCCESS] Redirecting to:",
              ticketData.ticket_view_url,
            );
            setTimeout(() => {
              router.push(ticketData.ticket_view_url!);
            }, 1000);
          } else if (ticketData?.ticket_view_token) {
            const fallbackUrl = `/tickets/view?token=${ticketData.ticket_view_token}`;
            console.log("[POLL_SUCCESS] Redirecting to fallback:", fallbackUrl);
            setTimeout(() => {
              router.push(fallbackUrl);
            }, 1000);
          } else {
            console.warn("[POLL_SUCCESS] No redirect URL found in response");
          }
          return;
        }

        // ⏳ STILL PROCESSING
        if (data.status === "processing") {
          setStatus("processing");
        }

        // ❌ PAYMENT FAILED
        if (data.status === "failed" || data.error) {
          console.error("[POLL_FAILED] Payment failed:", data.error);
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;

          setStatus("failed");
          setError(data.error || data.message || "Payment failed");
          return;
        }

        // ❌ TIMEOUT - Give up after 30 seconds
        if (elapsed >= MAX_WAIT_TIME) {
          console.error("[POLL_TIMEOUT] Gave up after 30 seconds");
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;

          setStatus("failed");
          setError(
            "Ticket creation is taking too long. Please check your email for confirmation.",
          );
          return;
        }
      } catch (err) {
        console.error("[POLL_ERROR] Poll attempt failed:", err);

        // Continue polling on network errors, but stop after timeout
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= MAX_WAIT_TIME) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setStatus("failed");
          setError(
            "Network error. Please check your connection and try again.",
          );
        }
      }
    }, POLL_INTERVAL);
  }

  // No checkout token in query params — invalid access
  if (!checkoutToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <WarningCircleIcon
              size={32}
              weight="duotone"
              className="rotate-45"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("ticketPurchase.invalidAccess", "Invalid Access")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t(
              "ticketPurchase.invalidAccessMessage",
              "We could not verify your payment details.",
            )}
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            {t("common.returnHome", "Return to Home")}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * RENDER: Show appropriate UI based on polling status
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* CONNECTING STATE */}
        {status === "connecting" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔌 Connecting...
            </h1>
            <p className="text-gray-600">
              Establishing connection to payment service
            </p>
          </div>
        )}

        {/* POLLING STATE */}
        {status === "polling" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Loader2 size={32} className="text-blue-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔄 Checking Status...
            </h1>
            <p className="text-gray-600 mb-2">Polling for ticket updates</p>
            <p className="text-sm text-gray-500">
              Attempt {pollCount} •{" "}
              {lastMessage || "Waiting for confirmation..."}
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING STATE */}
        {status === "processing" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                <Loader2 size={32} className="text-yellow-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ⏳ Processing Payment
            </h1>
            <p className="text-gray-600 mb-2">
              {lastMessage ||
                "Your payment is being verified. This usually takes a few seconds."}
            </p>
            <p className="text-sm text-gray-500">Attempt {pollCount}</p>
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-yellow-600 h-full animate-pulse w-1/3" />
            </div>
          </div>
        )}

        {/* COMPLETED STATE */}
        {status === "completed" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-bounce">
                <CheckCircleIcon size={32} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              ✅ Payment Successful!
            </h1>
            <p className="text-gray-600 mb-1">
              {ticketCount > 0
                ? `🎫 ${ticketCount} ticket${ticketCount !== 1 ? "s" : ""} created`
                : "Your tickets are ready!"}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your tickets...
            </p>
            <div className="mt-6 w-full bg-green-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-600 h-full animate-pulse" />
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "failed" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <WarningCircleIcon size={32} className="text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              ❌ {error ? "Payment Failed" : "Something Went Wrong"}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "An unexpected error occurred. Please try again."}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/events")}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Browse Events
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Or contact support if the problem persists
            </p>
          </div>
        )}

        {/* DEBUG INFO (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(
                  { status, ticketCount, error, pollCount, lastMessage },
                  null,
                  2,
                )}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  console.log("[PAYMENT_SUCCESS] PaymentSuccessPage component rendered");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
