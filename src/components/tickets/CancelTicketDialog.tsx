"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { ViewTicketDetails, ViewTicketDetail } from "@/types/ticket";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar, MapPin, Ticket, X } from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Character limits for cancellation reason
const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;

// Schema uses translation keys as message strings (deferred translation).
// TranslatedFormMessage calls t(key) on every render so errors update
// reactively when the locale changes.
const cancelTicketSchema = z.object({
  reason: z
    .string()
    .min(1, "cancelTicket.validation.reasonRequired")
    .min(MIN_REASON_LENGTH, "cancelTicket.validation.reasonMinLength")
    .max(MAX_REASON_LENGTH, "cancelTicket.validation.reasonMaxLength"),
});

interface CancelTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: ViewTicketDetails | ViewTicketDetail | null;
  ticketId?: string | null;
  onCancelConfirm: (reason: string) => Promise<void>;
  isPending: boolean;
}

export function CancelTicketDialog({
  open,
  onOpenChange,
  ticket,
  ticketId,
  onCancelConfirm,
  isPending,
}: CancelTicketDialogProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [step, setStep] = useState<"reason" | "confirmation">("reason");

  const schema = cancelTicketSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const { watch } = form;
  const reasonValue = watch("reason");

  // Reset form and step when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setStep("reason");
    }
  }, [open]);

  const handleReasonSubmit = () => {
    setStep("confirmation");
  };

  const handleBackToReason = () => {
    setStep("reason");
  };

  const handleConfirmCancel = async () => {
    const reason = form.getValues("reason");
    await onCancelConfirm(reason);
    // Dialog will be closed by parent after successful cancellation
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form and step when closing
      form.reset();
      setStep("reason");
    }
    onOpenChange(newOpen);
  };

  const isCoordinates = (addr: string) =>
    /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(addr?.trim() ?? "");

  if (!ticket) return null;

  // Find the specific ticket being cancelled if ticketId is provided
  const specificTicket =
    ticketId && "tickets" in ticket
      ? ticket.tickets.find((t) => t.ticketId === ticketId)
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl border-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300 p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b">
          <DialogTitle>
            {step === "reason"
              ? ticketId
                ? t("cancelTicket.reasonDialog.titleSingle", "Cancel Ticket")
                : t("cancelTicket.reasonDialog.title", "Cancel Order")
              : ticketId
                ? t(
                    "cancelTicket.confirmationDialog.titleSingle",
                    "Confirm Ticket Cancellation",
                  )
                : t(
                    "cancelTicket.confirmationDialog.title",
                    "Confirm Cancellation",
                  )}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto px-6 pt-6"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {step === "reason" ? (
            /* STEP 1: Reason Input */
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleReasonSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "cancelTicket.reasonDialog.reasonLabel",
                          "Cancellation Reason",
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          maxLength={MAX_REASON_LENGTH}
                          className="min-h-[120px] resize-none"
                          placeholder={t(
                            "cancelTicket.reasonDialog.reasonPlaceholder",
                            "Please explain why you need to cancel your order...",
                          )}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <TranslatedFormMessage t={t} />
                        <p className="text-xs text-gray-400 ml-auto">
                          {field.value?.length || 0}/500{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter className="sticky bottom-0 bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                  >
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !form.formState.isValid}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {t("cancelTicket.reasonDialog.nextButton", "Next")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            /* STEP 2: Confirmation */
            <div className="space-y-4">
              {/* Event Details Card */}
              <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {ticket.event.imageUrl ? (
                    <img
                      src={ticket.event.imageUrl}
                      alt={ticket.event.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {ticket.event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(
                          new Date(ticket.event.startDate),
                          "EEE, MMM d, yyyy • h:mm a",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {ticket.event.venueName}
                        {ticket.event.address &&
                          !isCoordinates(ticket.event.address) && (
                            <span>, {ticket.event.address}</span>
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets to be Cancelled */}
              {"tickets" in ticket &&
                ticket.tickets &&
                ticket.tickets.length > 0 && (
                  <div className="rounded-lg border bg-blue-50 p-4 space-y-3">
                    <h5 className="font-semibold text-gray-900 text-sm">
                      {t(
                        "cancelTicket.confirmationDialog.ticketsToCancel",
                        "Tickets to be Cancelled",
                      )}{" "}
                      {ticketId
                        ? "(1)"
                        : `(${ticket.tickets.filter((t) => !t.is_checked_in).length})`}
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {ticket.tickets
                        .filter((t) =>
                          ticketId ? t.ticketId === ticketId : !t.is_checked_in,
                        )
                        .map((ticketItem, idx) => (
                          <div
                            key={
                              "ticketId" in ticketItem
                                ? ticketItem.ticketId
                                : idx
                            }
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {typeof ticketItem.tierName === "string"
                                  ? ticketItem.tierName
                                  : ticketItem.tierName?.name || "General"}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                #{ticketItem.ticketNumber}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                ticketItem.is_checked_in
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700",
                              )}
                            >
                              {ticketItem.is_checked_in ? "Used" : "Active"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Refund Notice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  {t(
                    "cancelTicket.confirmationDialog.refundNotice",
                    "A refund will be processed according to the event's cancellation policy. The refund amount will be credited to your original payment method within 5-7 business days.",
                  )}
                </p>
              </div>

              {/* Reason Display */}
              <div className="rounded-lg border bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {t(
                    "cancelTicket.confirmationDialog.reason",
                    "Cancellation Reason",
                  )}
                  :
                </p>
                <p className="text-sm text-gray-700">
                  {form.getValues("reason")}
                </p>
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToReason}
                  disabled={isPending}
                >
                  {t("common.back", "Back")}
                </Button>
                <Button
                  onClick={handleConfirmCancel}
                  disabled={isPending}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t(
                        "cancelTicket.confirmationDialog.cancelling",
                        "Cancelling...",
                      )}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      {t(
                        "cancelTicket.confirmationDialog.confirmButton",
                        "Confirm Cancellation",
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
