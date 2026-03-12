"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TicketDisplay } from "@/components/ticket/TicketDisplay";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CaretLeft, Ticket, DownloadSimple } from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ticketService } from "@/services/ticketService";
import { Loader2, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const token = searchParams.get("token") || "";

  const { data: validationData } = useSuspenseQuery({
    queryKey: queryKeys.tickets.validate(token),
    queryFn: () => ticketService.validateToken(token),
  });

  const isValid = validationData?.valid === true;

  const { data: ticketDetails } = useSuspenseQuery({
    queryKey: queryKeys.tickets.view(token),
    queryFn: () => ticketService.viewTicket(token),
  });

  // Handle Redirects
  useEffect(() => {
    if (!token) {
      toast.error("ticketView.invalidTicket", "");
      router.push("/");
    } else if (!isValid) {
      toast.error("ticketView.invalidTicket", "Invalid ticket token");
      router.push("/");
    }
  }, [isValid, token, router]);

  if (!isValid) return null; // Wait for redirect

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById("ticket-container");
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "white",
        pixelRatio: 2,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`tickets-${token}.pdf`);

      toast.success("Ticket exported successfully!");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to generate PDF. Please try printing explicitly.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:overflow-visible print:block relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-400/5 blur-[120px] rounded-full -z-10 print:hidden" />

      <div className="max-w-6xl mx-auto">
        {/* Success Header - Hidden on Print */}
        <div className="flex flex-col items-center justify-center text-center mb-10 print:hidden">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Payment Successful!
          </h1>
          <p className="text-neutral-500 max-w-lg">
            Your transaction was completed successfully. Your tickets are ready
            below. A receipt has also been sent to your email.
          </p>
        </div>

        {/* Actions - Hidden on Print */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 print:hidden">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-neutral-500 hover:text-neutral-900 font-bold flex items-center gap-2 group"
            >
              <CaretLeft
                weight="bold"
                className="group-hover:-translate-x-1 transition-transform"
              />
              {t("ticketView.backHome")}
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2.5 shadow-xl shadow-neutral-200 transition-all active:scale-95"
            >
              <Ticket weight="bold" size={18} />
              {t("ticketView.printTicket")}
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2.5 shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              <DownloadSimple weight="bold" size={18} />
              {t("ticketView.downloadTicket", "Download")}
            </Button>
          </div>
        </div>

        {ticketDetails ? (
          <TicketDisplay order={ticketDetails} onPrint={handlePrint} />
        ) : null}
      </div>
    </div>
  );
}

function PaymentSuccessFallback() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-neutral-400 font-semibold text-md animate-pulse">
          {t("ticketView.loadingTicket", "Loading Payment Details...")}
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessView />
    </Suspense>
  );
}
