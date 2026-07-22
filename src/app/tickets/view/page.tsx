"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TicketDisplay } from "@/components/tickets/TicketDisplay";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CaretLeft, Ticket } from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ticketService } from "@/services/ticketService";
import { Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { DownloadSimple } from "@phosphor-icons/react";

function TicketVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const token = searchParams.get("token") || "";
  const [isExporting, setIsExporting] = useState(false);

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
      toast.error("ticketView.invalidTicket", "Invalid ticket");
      router.push("/");
    }
  }, [isValid, token, router]);

  // Logic:
  // 1. Component mounts -> useSuspenseQuery(validate) starts -> THROWS promise -> <Suspense> shows fallback.
  // 2. Validate finishes -> Component re-renders with data.
  // 3. usageSuspenseQuery(view) starts. If token valid, fetches. -> THROWS promise -> <Suspense> shows fallback (again).
  // 4. View finishes -> Component re-renders with details.

  // Minimizers of flash:
  // If useSuspenseQuery(view) is fast, it might just blink.

  if (!isValid) return null; // Wait for redirect

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById("ticket-container");
    if (!element) return;

    setIsExporting(true);

    try {
      const waitForImages = async (root: HTMLElement, timeoutMs = 3000) => {
        const images = Array.from(root.querySelectorAll("img"));
        if (images.length === 0) return;

        await Promise.race([
          Promise.all(
            images.map(
              (img) =>
                new Promise<void>((resolve) => {
                  if (img.complete) return resolve();
                  const cleanup = () => {
                    img.removeEventListener("load", cleanup);
                    img.removeEventListener("error", cleanup);
                    resolve();
                  };
                  img.addEventListener("load", cleanup);
                  img.addEventListener("error", cleanup);
                }),
            ),
          ),
          new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
        ]);
      };

      const describeError = (err: unknown) => {
        if (err instanceof Error) return `${err.name}: ${err.message}`;
        try {
          return JSON.stringify(err);
        } catch {
          return String(err);
        }
      };

      await waitForImages(element);

      // A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const ticketNodes = Array.from(
        element.querySelectorAll<HTMLElement>('[data-ticket-card="true"]'),
      );
      const nodesToExport = ticketNodes.length > 0 ? ticketNodes : [element];

      let exportedWithoutImages = false;

      const renderPng = async (
        node: HTMLElement,
        opts?: Parameters<typeof toPng>[1],
      ) =>
        toPng(node, {
          cacheBust: true,
          backgroundColor: "white",
          pixelRatio: 2, // Higher quality
          ...opts,
        });

      for (let i = 0; i < nodesToExport.length; i++) {
        const node = nodesToExport[i]!;
        await waitForImages(node);

        let dataUrl: string;
        try {
          dataUrl = await renderPng(node);
        } catch (err) {
          // Common cause: remote images without CORS taint the canvas.
          console.warn(
            "Ticket export failed (retrying without <img> tags):",
            describeError(err),
          );
          exportedWithoutImages = true;
          dataUrl = await renderPng(node, {
            filter: (n) => (n as Element).tagName !== "IMG",
          });
        }

        if (i > 0) pdf.addPage();

        const imgProps = pdf.getImageProperties(dataUrl);
        const scale = Math.min(
          maxWidth / imgProps.width,
          maxHeight / imgProps.height,
        );
        const drawWidth = imgProps.width * scale;
        const drawHeight = imgProps.height * scale;
        const x = Math.max(margin, (pageWidth - drawWidth) / 2);
        const y = Math.max(margin, (pageHeight - drawHeight) / 2);

        pdf.addImage(dataUrl, "PNG", x, y, drawWidth, drawHeight);
      }

      if (exportedWithoutImages) {
        toast.message(
          t(
            "ticketView.toast.corsWarning",
            "Exported without some images due to CORS restrictions (banner/logo).",
          ),
        );
      }

      const eventName = ticketDetails?.event?.title || "Event";
      const localizedTicketsName = t("ticket.details.filename", "Tickets");
      // const orderId = ticketDetails?.orderId;
      // const shortId = orderId ? orderId.split("-")[0] : "tickets";
      pdf.save(`${eventName} ${localizedTicketsName}.pdf`);

      toast.success(
        t("ticketView.toast.exportSuccess", "Ticket downloaded successfully!"),
      );
    } catch (err) {
      const message =
        err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error("Failed to generate PDF:", message, err);
      toast.error(
        t(
          "ticketView.toast.exportError",
          "Failed to generate PDF. Please try printing explicitly.",
        ),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:overflow-visible print:block relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/5 blur-[120px] rounded-full -z-10 print:hidden" />

      <div className="max-w-6xl mx-auto">
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
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2.5 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
            >
              {isExporting ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <DownloadSimple weight="bold" size={18} />
              )}
              {isExporting
                ? t("ticketView.downloading", "Downloading...")
                : t("ticketView.downloadTicket", "Download Ticket")}
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

function TicketVerificationFallback() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-neutral-400 font-semibold text-md animate-pulse">
          {t("ticketView.loadingTicket", "Loading Ticket...")}
        </p>
      </div>
    </div>
  );
}

export default function TicketViewPage() {
  return (
    <Suspense fallback={<TicketVerificationFallback />}>
      <TicketVerification />
    </Suspense>
  );
}
