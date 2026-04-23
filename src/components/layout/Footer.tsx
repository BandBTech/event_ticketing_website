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
import Link from "next/link";
import { CompanyInfo } from "@/services/companyService";
import { MapModal } from "./MapModal";

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
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show footer on auth pages
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
      {
        name: t("footer.links.legal.privacyPolicy", "Privacy Policy"),
        href: "/static/privacy-policy",
      },
      {
        name: t("footer.links.legal.termsOfService", "Terms of Service"),
        href: "/static/terms-of-service",
      },
      {
        name: t("footer.links.legal.cookiePolicy", "Cookie Policy"),
        href: "/static/cookies-policy",
      },
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
  ].filter((social) => social.href); // Only show social links that have URLs

  // Loading state
  if (!mounted || (isLoading && !company)) {
    return (
      <footer className="bg-white/80 backdrop-blur-[25px] border-t border-white/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white/80 backdrop-blur-[25px] border-t border-white/30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Section - Company Info (4 columns) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Logo */}
              <div className="flex items-center ">
                <div className="flex items-center gap-2 px-3  rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <TicketIcon size={24} className="text-blue-600" />
                  <span
                    className="text-xl font-bold text-gray-900 font-poppins"
                    suppressHydrationWarning
                  >
                    {company?.name || "Timro Ticket"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p
                className="text-gray-600 leading-relaxed text-sm"
                suppressHydrationWarning
              >
                {company?.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {company?.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <EnvelopeSimpleIcon
                      size={16}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <a
                      href={`mailto:${company.email}`}
                      className="hover:text-blue-600 transition-colors break-all"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <PhoneIcon
                      size={16}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <a
                      href={`tel:${company.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
                {company?.address && (
                  <div
                    className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => {
                      setSelectedVenue(company);
                      setMapOpen(true);
                    }}
                  >
                    <MapPinIcon
                      size={16}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <span suppressHydrationWarning>{company.address}</span>
                  </div>
                )}
                {selectedVenue && (
                  <MapModal
                    isOpen={mapOpen}
                    onClose={() => setMapOpen(false)}
                    venue={selectedVenue}
                  />
                )}
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 hover:scale-105"
                        aria-label={social.name}
                      >
                        <Icon
                          size={20}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Section - Links (8 columns) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Company Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4  uppercase tracking-wider">
                    {t("footer.links.company.title", "Company")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4  uppercase tracking-wider">
                    {t("footer.links.support.title", "Support")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4  uppercase tracking-wider">
                    {t("footer.links.legal.title", "Legal")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Newsletter Section */}
                {/* <div>
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
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} {company?.name || "Timro Ticket"}.{" "}
              {t("footer.copyright", "All rights reserved.")}
            </div>

            {/* Footer Links */}
            {/* <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/static/privacy-policy"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {t("footer.links.legal.privacyPolicy", "Privacy Policy")}
              </Link>
              <Link
                href="/static/terms-of-service"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {t("footer.links.legal.termsOfService", "Terms of Service")}
              </Link>
              <Link
                href="/static/cookie-policy"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {t("footer.links.legal.cookiePolicy", "Cookies Policy")}
              </Link>
            </div> */}

            {/* Development Credit */}
            <div className="text-sm text-gray-500">
              {t("footer.developedby", "Developed by")}{" "}
              <a
                href="https://thebandbtech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                B&B Tech Group
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
