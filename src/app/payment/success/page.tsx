"use client";

import { api } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface CheckoutStatus {
  success: boolean;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "expired"
    | "unknown";
  message: string;
  ticket?: {
    count?: number;
    token?: string;
    url?: string;
  };
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutToken =
    searchParams.get("checkout_token") || searchParams.get("token") || "";

  const [message, setMessage] = useState("Checking payment status...");
  const [attempt, setAttempt] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!checkoutToken) return;

    let attempts = 0;
    const MAX_TIME = 30000;
    const start = Date.now();

    intervalRef.current = setInterval(async () => {
      attempts++;
      setAttempt(attempts);

      try {
        const res: CheckoutStatus = await api.get(
          `/public/checkout/${checkoutToken}`,
          {
            showErrorToast: false,
            requiresAuth: false,
          },
        );

        // always update message
        if (res.message) {
          setMessage(res.message);
        }

        // SUCCESS → redirect immediately
        if (res.status === "completed" && res.ticket) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          const url =
            res.ticket.url || `/tickets/view?token=${res.ticket.token}`;

          setTimeout(() => {
            router.push(url);
          }, 800);

          return;
        }

        // FAIL STATES → stop polling
        if (["failed", "expired"].includes(res.status)) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }

        // timeout safety
        if (Date.now() - start > MAX_TIME) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setMessage("Taking longer than expected. Please check email.");
        }
      } catch (err) {
        setMessage("Network issue... retrying");
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkoutToken]);

  if (!checkoutToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Invalid checkout session
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-[360px]">
        {/* ALWAYS SAME SPINNER */}
        <Loader2
          className="animate-spin mx-auto mb-4 text-blue-500"
          size={40}
        />

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Processing Payment
        </h2>

        <p className="text-gray-600 mb-2">{message}</p>

        <p className="text-xs text-gray-400">Attempt #{attempt}</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
