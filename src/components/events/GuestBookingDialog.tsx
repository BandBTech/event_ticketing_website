'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { TicketService } from '@/lib/ticketService';
import { toast } from '@/lib/toast';
import { Ticket, EnvelopeSimple, Phone } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Country } from 'react-phone-number-input';
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import { createValidationHelpers } from '@/lib/validation';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';

const createGuestBookingSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t)

  return z.object({
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length === 0 || isValidPhoneNumber(val), v.phone("Phone")
      ),
    quantity: z.number().min(1, 'Minimum 1 ticket').max(10, 'Maximum 10 tickets'),
  })
}



interface GuestBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  maxQuantity?: number;
}

export function GuestBookingDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  maxQuantity = 10,
}: GuestBookingDialogProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<Country>('NP');

  const schema = createGuestBookingSchema(t);
  type GuestBookingFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GuestBookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      phone: '',
    },
  });

  const onSubmit = async (data: GuestBookingFormData) => {
    setIsLoading(true);

    try {
      // Parse phone number if provided
      let parsedPhone = '';
      let parsedCountryCode = '';

      if (data.phone && isValidPhoneNumber(data.phone)) {
        const parsed = parsePhoneNumber(data.phone);
        if (parsed) {
          parsedPhone = parsed.nationalNumber;
          parsedCountryCode = `+${parsed.countryCallingCode}`;
        }
      }

      const response = await TicketService.guestPurchase({
        event_id: eventId,
        email: data.email,
        quantity: data.quantity,
        phone: parsedPhone || undefined,
        country_code: parsedCountryCode || undefined,
      });

      toast.success(
        'booking.guestSuccess',
        response.message || 'Verification email sent! Please check your inbox to complete your booking.'
      );

      // Reset form and close dialog
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Guest booking failed:', error);
      toast.error(
        'booking.guestError',
        error instanceof Error ? error.message : 'Failed to process booking. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket size={28} className="text-blue-600" weight="duotone" />
            Book as Guest
          </DialogTitle>
          <DialogDescription>
            Book tickets for <span className="font-semibold text-gray-900">{eventTitle}</span>.
            We&apos;ll send a verification email to complete your booking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <EnvelopeSimple size={16} weight="duotone" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              className={cn(errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-500">
              We&apos;ll send a verification link to this email
            </p>
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={16} weight="duotone" />
              Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  defaultCountry={countryCode}
                  onCountryChange={(country) => setCountryCode(country as Country)}
                  placeholder="Enter phone number"
                  className={cn(errors.phone && 'border-destructive')}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Ticket size={16} weight="duotone" />
              Number of Tickets
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              {...register('quantity', { valueAsNumber: true })}
              className={cn(errors.quantity && 'border-destructive')}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Book Tickets'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
