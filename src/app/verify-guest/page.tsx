"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyGuestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const mockTokenStored = localStorage.getItem(`guest_token_${token}`);

        if (mockTokenStored === token) {
          setVerificationStatus("success");
          setMessage("Mock verification successful! Your tickets are confirmed.");
          localStorage.setItem(`guest_verification_${token}`, "success");

          setTimeout(() => {
            router.push("/verification-success");
          }, 3000);
          return;
        }
        const res = await fetch(
          "https://sandbox.timroticket.com/api/v1/public/verify-guest",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const responseData = await res.json();

        if (res.ok && responseData.success) {
          setVerificationStatus("success");
          setMessage(responseData.message || "Email verified successfully! Your tickets have been confirmed.");
          
          // Store verification success in localStorage
          localStorage.setItem(`guest_verification_${token}`, "success");
          
          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push("/verification-success");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(responseData.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
        setMessage("Network error occurred. Please check your connection and try again.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {verificationStatus === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Successful!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="animate-pulse text-sm text-green-600">
                Redirecting to success page...
              </div>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/events"
                  className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Events
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VerifyGuestLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-pulse">
          <div className="h-12 w-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyGuestPage() {
  return (
    <Suspense fallback={<VerifyGuestLoading />}>
      <VerifyGuestContent />
    </Suspense>
  );
}