"use client";

import { useMemo, useState} from "react";
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

const createContactSchema = () => {
  return z.object({
    name: z.string().min(1, "contact.validation.nameRequired"),
    email: z.string().min(1, "contact.validation.emailRequired"),
    message: z.string().min(1, "contact.validation.messageRequired"),
  });
};

export default function ContactPage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const contactSchema = useMemo(() => createContactSchema(), []);

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log({ ...data, category: selectedCategory });

      toast.success(t("contact.toast.success"));

      reset();
      setSelectedCategory("");
    } catch {
      toast.error(t("contact.toast.error"));
    }
  };

  const socialLinks = [
    { name: "Facebook", icon: FacebookLogoIcon, href: "#facebook" },
    { name: "Twitter", icon: TwitterLogoIcon, href: "#twitter" },
    { name: "Instagram", icon: InstagramLogoIcon, href: "#instagram" },
    { name: "LinkedIn", icon: LinkedinLogoIcon, href: "#linkedin" },
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* <section className="py-15 bg-secondary">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-blue-700 font-bold mb-6">
            {t("contact.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("contact.subtitle")}
          </p>
        </div>
      </section> */}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div className="space-y-10">
              {/* Heading */}
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  {t("contact.letsConnect", "Let’s Connect")}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "contact.connectDescription",
                    "Reach out for collaborations, support, or general inquiries."
                  )}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <EnvelopeSimpleIcon size={18} className="text-primary" />
                  <span>{t("footer.contact.email")}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <PhoneIcon size={18} className="text-primary" />
                  <span>{t("footer.contact.phone")}</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPinIcon size={18} className="text-primary mt-0.5" />
                  <span className="leading-relaxed">
                    {t("footer.contact.address")}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Social Links */}
              <div>
                <p className="text-sm font-medium mb-3">
                  {t("contact.followUs", "Follow us")}
                </p>

                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        aria-label={social.name}
                        className="p-2 rounded-lg border border-border bg-background
                       hover:bg-primary hover:text-primary-foreground
                       transition-all duration-200"
                      >
                        <Icon size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">
                {t("contact.form.title", "Send us a message")}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("contact.form.fullName")}{" "}
                    <span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    className={cn("h-12", errors.name && "border-destructive")}
                    placeholder={t("contact.form.placeholder.fullName")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {t(errors.name.message as string)}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("contact.form.email")}{" "}
                    <span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    type="email"
                    className={cn("h-12", errors.email && "border-destructive")}
                    placeholder={t("contact.form.placeholder.email")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {t(errors.email.message as string)}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("contact.support.title")}
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 w-full rounded-lg",
                        "border border-border bg-background",
                        "px-4 text-sm",
                        "cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-primary"
                      )}
                    >
                      <SelectValue
                        placeholder={t("contact.support.option.selectIssue")}
                      />
                    </SelectTrigger>

                    <SelectContent
                      className={cn(
                        "rounded-lg border border-border",
                        "bg-background shadow-lg",
                        "p-1"
                      )}
                    >
                      <SelectItem
                        value="ticket"
                        className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-primary focus:text-white"
                      >
                        {t("contact.support.option.ticketBooking")}
                      </SelectItem>

                      <SelectItem
                        value="event"
                        className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-primary focus:text-white"
                      >
                        {t("contact.support.option.eventPublishing")}
                      </SelectItem>

                      <SelectItem
                        value="payment"
                        className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-primary focus:text-white"
                      >
                        {t("contact.support.option.paymentsRefund")}
                      </SelectItem>

                      <SelectItem
                        value="tech"
                        className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-primary focus:text-white"
                      >
                        {t("contact.support.option.technicalSupport")}
                      </SelectItem>

                      <SelectItem
                        value="partner"
                        className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-primary focus:text-white"
                      >
                        {t("contact.support.option.partner")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("contact.message.title")}{" "}
                    <span className="text-destructive ml-0.5">*</span>
                  </label>
                  <textarea
                    rows={5}
                    className={cn(
                      "w-full rounded-lg border border-border px-4 py-3 resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-primary",
                      errors.message && "border-destructive"
                    )}
                    placeholder={t("contact.message.textarea")}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">
                      {t(errors.message.message as string)}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg text-base font-semibold"
                >
                  {t("contact.button.sendMessage")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
