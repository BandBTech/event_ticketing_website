"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import {
  ArrowRightIcon,
  EnvelopeSimpleIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  MapPinIcon,
  PhoneIcon,
  TicketIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyInfo } from "@/hooks/useCompany";
import { useEffect, useState } from "react";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();
  const authPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ];

  const { data: company, isLoading } = useCompanyInfo();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (authPaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }
  
  const footerLinks = {
    company: [
      { name: t("footer.links.company.aboutUs", "About Us"), href: "/about" },
      {
        name: t("footer.links.company.howItWorks", "How It Works"),
        href: "/static/how-it-works",
      },
    ],
    organizers: [
      {
        name: t("footer.links.organizers.createEvent", "Create Event"),
        href: "#create-event",
      },
      {
        name: t("footer.links.organizers.pricing", "Pricing"),
        href: "#pricing",
      },
      {
        name: t("footer.links.organizers.eventManagement", "Event Management"),
        href: "#management",
      },
      {
        name: t("footer.links.organizers.analytics", "Analytics"),
        href: "#analytics",
      },
    ],
    support: [
      {
        name: t("footer.links.support.contactSupport", "Contact Support"),
        href: "/contact",
      },
      {
        name: t("footer.links.support.eventGuidelines", "Event Guidelines"),
        href: "/static/guidelines",
      },
      {
        name: t("footer.links.support.refundPolicy", "Refund Policy"),
        href: "/static/refund-policy",
      },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "Security", href: "#security" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: FacebookLogoIcon, href: company?.facebook_url },
    { name: "Twitter", icon: TwitterLogoIcon, href: company?.twitter_url },
    {
      name: "Instagram",
      icon: InstagramLogoIcon,
      href: company?.instagram_url,
    },
    { name: "LinkedIn", icon: LinkedinLogoIcon, href: company?.linkedin_url },
  ];

  if (!mounted || (isLoading && !company)) {
    return (
      <footer className="bg-white/80 border-t border-white/30 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <div className="animate-pulse h-8 bg-gray-100 rounded w-1/4 mx-auto" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white/80 backdrop-blur-[25px] border-t border-white/30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Company Info - Takes 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <TicketIcon size={24} className="text-blue-600" />
                  <span
                    className="text-xl font-bold text-gray-900 font-poppins"
                    suppressHydrationWarning
                  >
                    {company?.name}
                  </span>
                </div>
              </div>

              <p
                className="text-gray-600 leading-relaxed"
                suppressHydrationWarning
              >
                {company?.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <EnvelopeSimpleIcon size={16} className="text-blue-500 flex-shrink-0" />
                  <span className="break-all" suppressHydrationWarning>
                    {company?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <PhoneIcon size={16} className="text-blue-500 flex-shrink-0" />
                  <span suppressHydrationWarning>{company?.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon size={16} className="text-blue-500 flex-shrink-0" />
                  <span suppressHydrationWarning>{company?.address}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={mounted && social.href ? social.href : "#"}
                      className="p-2 rounded-lg glass border hover:bg-white/90 transition-all duration-200"
                      aria-label={social.name}
                    >
                      <Icon size={20} className="text-gray-600" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Section - Takes 8 columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Company Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("footer.links.company.title", "Company")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("footer.links.support.title", "Support")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Newsletter Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("newsletter.title", "Newsletter")}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {t(
                        "newsletter.subtitle",
                        "Get notified about new events and exclusive offers.",
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder={t(
                          "newsletter.email.placeholder",
                          "Enter your email",
                        )}
                        className="glass border text-gray-900 placeholder:text-gray-500 flex-1 h-10 text-sm"
                      />
                      <Button
                        size="default"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md px-4 h-10"
                      >
                        <ArrowRightIcon size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              {t("footer.copyright", "Timro-Ticket. All rights reserved.")}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
              <span className="text-center">
                {t("footer.developedby", "Developed by")}{" "}
                <a 
                  href="https://thebandbtech.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  B&B Tech Group.
                </a>
              </span>
              <div className="flex items-center gap-4">
                <a
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  {t("footer.links.legal.privacyPolicy", "Privacy Policy")}
                </a>
                <a
                  href="#terms"
                  className="hover:text-blue-600 transition-colors"
                >
                  {t("footer.links.legal.termsOfService", "Terms of Service")}
                </a>
                <a
                  href="#cookies"
                  className="hover:text-blue-600 transition-colors"
                >
                  {t("footer.links.legal.cookiePolicy", "Cookies Policy")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}