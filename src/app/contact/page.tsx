"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  EnvelopeSimpleIcon,
  PhoneIcon,
  MapPinIcon,
  FacebookLogoIcon,
  TwitterLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyInfo } from "@/hooks/useCompany";

const createContactSchema = () => {
  return z.object({
    name: z.string().min(1, "contact.validation.nameRequired"),
    email: z.string().min(1, "contact.validation.emailRequired").email("contact.validation.emailInvalid"),
    message: z.string().min(1, "contact.validation.messageRequired"),
  });
};

export default function ContactPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const contactSchema = useMemo(() => createContactSchema(), []);
  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const { data: company } = useCompanyInfo();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const watchName = watch("name");
  const watchMessage = watch("message");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    const payload = {
     
      access_key: "3014ccc6-5dbd-42e7-bf10-02887ba4d6aa", 
      name: data.name,
      email: data.email,
      category: selectedCategory || "General Inquiry",
      message: data.message,
      subject: `New Contact Form Submission from ${data.name}`,
      from_name: "Timro Ticket Contact Form",
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t("contact.toast.success", "Message sent successfully!"));
        reset();
        setSelectedCategory("");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { name: "Facebook", icon: FacebookLogoIcon, href: company?.facebook_url },
    { name: "Twitter", icon: TwitterLogoIcon, href: company?.twitter_url },
    { name: "Instagram", icon: InstagramLogoIcon, href: company?.instagram_url },
    { name: "LinkedIn", icon: LinkedinLogoIcon, href: company?.linkedin_url },
  ].filter(link => link.href);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Details */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold mb-4">{t("contact.letsConnect", "Let’s Connect")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("contact.connectDescription", "Reach out for collaborations, support, or general inquiries.")}
                </p>
              </div>

              {(company?.email || company?.phone || company?.address) && (
                <div className="space-y-4">
                  {company?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <EnvelopeSimpleIcon size={18} className="text-primary" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <PhoneIcon size={18} className="text-primary" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company?.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPinIcon size={18} className="text-primary mt-0.5" />
                      <span>{company.address}</span>
                    </div>
                  )}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="pt-6 border-t">
                  <p className="text-sm font-medium mb-3">{t("contact.followUs", "Follow us")}</p>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border hover:bg-primary hover:text-white transition">
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-card border rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">{t("contact.form.title", "Send us a message")}</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">{t("contact.form.fullName", "Full Name")} *</label>
                  <Input className={cn("h-12", errors.name && "border-destructive")} placeholder="Enter your full name" {...register("name")} maxLength={100} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{t(errors.name.message as string)}</p>}
                  <div className="text-xs text-muted-foreground text-right mt-1">{watchName?.length || 0}/100</div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">{t("contact.form.email", "Email")} *</label>
                  <Input type="email" className={cn("h-12", errors.email && "border-destructive")} placeholder="Enter your email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{t(errors.email.message as string)}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">{t("contact.support.title", "Support Category")}</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Select an issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ticket" className="cursor-pointer">Ticket Booking Issue</SelectItem>
                      <SelectItem value="event" className="cursor-pointer">Event Publishing</SelectItem>
                      <SelectItem value="payment" className="cursor-pointer">Payments & Refund</SelectItem>
                      <SelectItem value="tech" className="cursor-pointer">Technical Support</SelectItem>
                      <SelectItem value="partner" className="cursor-pointer">Partner/Business Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">{t("contact.message.title", "Message")} *</label>
                  <textarea rows={5} className={cn("w-full rounded-lg border px-4 py-3 resize-none focus:ring-2 focus:ring-primary", errors.message && "border-destructive")} maxLength={500} placeholder="Write your message..." {...register("message")} />
                  {errors.message && <p className="text-sm text-destructive mt-1">{t(errors.message.message as string)}</p>}
                  <div className="text-xs text-muted-foreground text-right mt-1">{watchMessage?.length || 0}/500</div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-lg text-base font-semibold">
                  {isSubmitting ? "Sending..." : t("contact.button.sendMessage", "Send Message")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}