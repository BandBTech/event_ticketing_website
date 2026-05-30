"use client";

import { 
  FileTextIcon, 
  TicketIcon,
  UserIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertCircleIcon, ScaleIcon } from "lucide-react";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function TermsOfServicePage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const lastUpdated = "January 1, 2024";

  const terms = [
    {
      icon: UserIcon,
      title: t("termsofservice.account.title", "Account Registration"),
      content: [
        t("termsofservice.account.step1", "You must be at least 18 years old to create an account"),
        t("termsofservice.account.step2", "Provide accurate and complete registration information"),
        t("termsofservice.account.step3", "You are responsible for maintaining account security"),
        t("termsofservice.account.step4", "Notify us immediately of unauthorized account access"),
        t("termsofservice.account.step5", "We reserve the right to suspend or terminate accounts")
      ]
    },
    {
      icon: TicketIcon,
      title: t("termsofservice.tickets.title", "Ticket Purchases"),
      content: [
        t("termsofservice.tickets.step1", "All ticket sales are final unless otherwise stated"),
        t("termsofservice.tickets.step2", "Tickets are non-transferable unless specified"),
        t("termsofservice.tickets.step3", "Prices are subject to change without notice"),
        t("termsofservice.tickets.step4", "We reserve the right to limit ticket quantities"),
        t("termsofservice.tickets.step5", "Counterfeit tickets will not be honored")
      ]
    },
    {
      icon: CreditCardIcon,
      title: t("termsofservice.payments.title", "Payments & Fees"),
      content: [
        t("termsofservice.payments.step1", "All payments must be made in full at time of purchase"),
        t("termsofservice.payments.step2", "Service fees may apply and are non-refundable"),
        t("termsofservice.payments.step3", "We use secure third-party payment processors"),
        t("termsofservice.payments.step4", "Chargebacks may result in account suspension"),
        t("termsofservice.payments.step5", "Currency conversion fees may apply for international transactions")
      ]
    },
    {
      icon: ScaleIcon,
      title: t("termsofservice.conduct.title", "User Conduct"),
      content: [
        t("termsofservice.conduct.step1", "Do not use our platform for fraudulent activities"),
        t("termsofservice.conduct.step2", "Respect other users and event attendees"),
        t("termsofservice.conduct.step3", "Do not attempt to bypass security measures"),
        t("termsofservice.conduct.step4", "No automated scraping or data mining"),
        t("termsofservice.conduct.step5", "Comply with all applicable laws and regulations")
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: t("termsofservice.cancellations.title", "Event Cancellations & Changes"),
      content: [
        t("termsofservice.cancellations.step1", "Event organizers may cancel or reschedule events"),
        t("termsofservice.cancellations.step2", "You will be notified of significant changes"),
        t("termsofservice.cancellations.step3", "Refunds are issued according to our Refund Policy"),
        t("termsofservice.cancellations.step4", "We are not responsible for organizer decisions"),
        t("termsofservice.cancellations.step5", "Force majeure events may affect ticket validity")
      ]
    },
    {
      icon: AlertCircleIcon,
      title: t("termsofservice.liability.title", "Limitation of Liability"),
      content: [
        t("termsofservice.liability.step1", "We are not liable for event-related issues or injuries"),
        t("termsofservice.liability.step2", "Maximum liability limited to ticket purchase price"),
        t("termsofservice.liability.step3", "We do not guarantee event quality or satisfaction"),
        t("termsofservice.liability.step4", "We are not responsible for third-party actions"),
        t("termsofservice.liability.step5", "Some jurisdictions may not allow liability limitations")
      ]
    }
  ];

  return (
    <>
    <PageTitle title={t("termsofservice.title", "Terms of Service")}/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              {t("static.termsofservice.title", "Terms of Service")}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t("static.termsofservice.subtitle", "Please read these terms carefully before using our platform.")}
            </p>
            <p className="text-sm text-blue-200 mt-4">
              {t("termsofservice.lastUpdated", "Last Updated:")} {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon size={28} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {t("termsofservice.acceptance.title", "Acceptance of Terms")}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("termsofservice.acceptance.p1", "By accessing or using Timro-Ticket, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.")}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t("termsofservice.acceptance.p2", "These terms constitute a legally binding agreement between you and Timro-Ticket regarding your use of our ticket purchasing platform.")}
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6 mb-8">
          {terms.map((term, index) => {
            const Icon = term.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Icon size={28} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">{term.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {term.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("termsofservice.intellectual.title", "Intellectual Property")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("termsofservice.intellectual.p1", "All content on Timro-Ticket, including text, graphics, logos, icons, images, and software, is the property of Timro-Ticket or its content suppliers and is protected by intellectual property laws.")}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t("termsofservice.intellectual.p2", "You may not reproduce, distribute, modify, create derivative works of, publicly display, or transmit any content without our prior written consent.")}
          </p>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("termsofservice.termination.title", "Termination")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("termsofservice.termination.p1", "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.")}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t("termsofservice.termination.p2", "Upon termination, your right to use the platform will cease immediately. If you wish to terminate your account, you may simply discontinue using the platform or contact support.")}
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("termsofservice.governing.title", "Governing Law")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("termsofservice.governing.p1", "These Terms shall be governed and construed in accordance with the laws of the jurisdiction where Timro-Ticket operates, without regard to its conflict of law provisions.")}
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("termsofservice.changes.title", "Changes to Terms")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("termsofservice.changes.p1", "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our platform after those revisions become effective, you agree to be bound by the revised terms.")}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}