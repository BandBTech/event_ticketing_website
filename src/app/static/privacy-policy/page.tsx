"use client";

import { 
  ShieldCheckIcon, 
  EyeIcon, 
  DatabaseIcon, 
  CookieIcon,
  CheckCircleIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function PrivacyPolicyPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const lastUpdated = t("privacyPolicy.sections.date","January 1, 2024");

  const sections = [
    {
      icon: DatabaseIcon,
      title: t("privacyPolicy.sections.collect.title", "Information We Collect"),
      content: [
        t("privacyPolicy.sections.collect.item1", "Personal information (name, email, phone number, address)"),
        t("privacyPolicy.sections.collect.item2", "Payment information (processed securely through third-party providers)"),
        t("privacyPolicy.sections.collect.item3", "Ticket purchase history and event preferences"),
        t("privacyPolicy.sections.collect.item4", "Device information and usage data"),
        t("privacyPolicy.sections.collect.item5", "Location data (with your consent)"),
        t("privacyPolicy.sections.collect.item6", "Communication preferences and feedback")
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: t("privacyPolicy.sections.use.title", "How We Use Your Information"),
      content: [
        t("privacyPolicy.sections.use.item1", "Process and deliver ticket purchases"),
        t("privacyPolicy.sections.use.item2", "Send event updates and important notifications"),
        t("privacyPolicy.sections.use.item3", "Improve our services and user experience"),
        t("privacyPolicy.sections.use.item4", "Prevent fraud and ensure platform security"),
        t("privacyPolicy.sections.use.item5", "Personalize event recommendations"),
        t("privacyPolicy.sections.use.item6", "Comply with legal obligations")
      ]
    },
    {
      icon: EyeIcon,
      title: t("privacyPolicy.sections.share.title", "Information Sharing"),
      content: [
        t("privacyPolicy.sections.share.item1", "We never sell your personal information to third parties"),
        t("privacyPolicy.sections.share.item2", "Share necessary information with event organizers for ticket validation"),
        t("privacyPolicy.sections.share.item3", "Work with trusted payment processors and service providers"),
        t("privacyPolicy.sections.share.item4", "Disclose information when required by law"),
        t("privacyPolicy.sections.share.item5", "Share anonymized data for analytics and improvements")
      ]
    },
    {
      icon: CookieIcon,
      title: t("privacyPolicy.sections.cookies.title", "Cookies & Tracking"),
      content: [
        t("privacyPolicy.sections.cookies.item1", "Use cookies to enhance your browsing experience"),
        t("privacyPolicy.sections.cookies.item2", "Remember your preferences and login status"),
        t("privacyPolicy.sections.cookies.item3", "Analyze website traffic and user behavior"),
        t("privacyPolicy.sections.cookies.item4", "You can control cookie settings in your browser"),
        t("privacyPolicy.sections.cookies.item5", "Third-party cookies for analytics and advertising")
      ]
    }
  ];

  const yourRights = [
    t("privacyPolicy.rights.item1", "Access your personal data"),
    t("privacyPolicy.rights.item2", "Correct inaccurate information"),
    t("privacyPolicy.rights.item3", "Delete your account and data"),
    t("privacyPolicy.rights.item4", "Opt-out of marketing communications"),
    t("privacyPolicy.rights.item5", "Data portability"),
    t("privacyPolicy.rights.item6", "Restrict certain data processing")
  ];

  return (
    <>
    <PageTitle title={t("static.privacypolicy.title", "Privacy Policy")}/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              {t("static.privacypolicy.title", "Privacy Policy")}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t("static.privacypolicy.subtitle", "Your privacy matters to us. Learn how we collect, use, and protect your information.")}
            </p>
            <p className="text-sm text-blue-200 mt-4">
              {t("privacyPolicy.lastUpdated", "Last Updated:")} {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("privacyPolicy.intro.title", "Introduction")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("privacyPolicy.intro.p1", "At Timro-Ticket, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.")}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t("privacyPolicy.intro.p2", "By using Timro-Ticket, you consent to the data practices described in this policy. Please read this policy carefully to understand our views and practices regarding your personal data.")}
          </p>
        </div>

        {/* Information Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Icon size={28} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Rights */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("privacyPolicy.rights.title", "Your Privacy Rights")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("privacyPolicy.rights.subtitle", "Depending on your location, you may have the following rights regarding your personal data:")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yourRights.map((right, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">{right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("privacyPolicy.security.title", "Data Security")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("privacyPolicy.security.p1", "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:")}
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">
                {t("privacyPolicy.security.item1", "SSL/TLS encryption for data transmission")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">
                {t("privacyPolicy.security.item2", "Regular security audits and vulnerability assessments")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">
                {t("privacyPolicy.security.item3", "Access controls and authentication measures")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">
                {t("privacyPolicy.security.item4", "Secure data storage with encryption at rest")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}