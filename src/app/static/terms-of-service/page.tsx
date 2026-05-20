"use client";

import { 
  FileTextIcon, 
  TicketIcon,
  UserIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon
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
      title: "Account Registration",
      content: [
        "You must be at least 18 years old to create an account",
        "Provide accurate and complete registration information",
        "You are responsible for maintaining account security",
        "Notify us immediately of unauthorized account access",
        "We reserve the right to suspend or terminate accounts"
      ]
    },
    {
      icon: TicketIcon,
      title: "Ticket Purchases",
      content: [
        "All ticket sales are final unless otherwise stated",
        "Tickets are non-transferable unless specified",
        "Prices are subject to change without notice",
        "We reserve the right to limit ticket quantities",
        "Counterfeit tickets will not be honored"
      ]
    },
    {
      icon: CreditCardIcon,
      title: "Payments & Fees",
      content: [
        "All payments must be made in full at time of purchase",
        "Service fees may apply and are non-refundable",
        "We use secure third-party payment processors",
        "Chargebacks may result in account suspension",
        "Currency conversion fees may apply for international transactions"
      ]
    },
    {
      icon: ScaleIcon,
      title: "User Conduct",
      content: [
        "Do not use our platform for fraudulent activities",
        "Respect other users and event attendees",
        "Do not attempt to bypass security measures",
        "No automated scraping or data mining",
        "Comply with all applicable laws and regulations"
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: "Event Cancellations & Changes",
      content: [
        "Event organizers may cancel or reschedule events",
        "You will be notified of significant changes",
        "Refunds are issued according to our Refund Policy",
        "We are not responsible for organizer decisions",
        "Force majeure events may affect ticket validity"
      ]
    },
    {
      icon: AlertCircleIcon,
      title: "Limitation of Liability",
      content: [
        "We are not liable for event-related issues or injuries",
        "Maximum liability limited to ticket purchase price",
        "We do not guarantee event quality or satisfaction",
        "We are not responsible for third-party actions",
        "Some jurisdictions may not allow liability limitations"
      ]
    }
  ];

  return (
    <>
    <PageTitle title={t("termsofservice.title","Terms-Of-Service")}/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon size={28} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            By accessing or using Timro-Ticket, you agree to be bound by these Terms of Service 
            and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            These terms constitute a legally binding agreement between you and Timro-Ticket 
            regarding your use of our ticket purchasing platform.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            All content on Timro-Ticket, including text, graphics, logos, icons, images, and software, 
            is the property of Timro-Ticket or its content suppliers and is protected by intellectual 
            property laws.
          </p>
          <p className="text-gray-600 leading-relaxed">
            You may not reproduce, distribute, modify, create derivative works of, publicly display, 
            or transmit any content without our prior written consent.
          </p>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Upon termination, your right to use the platform will cease immediately. If you wish to 
            terminate your account, you may simply discontinue using the platform or contact support.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction 
            where Timro-Ticket operates, without regard to its conflict of law provisions.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days&apos; notice prior to any new terms taking effect. 
            By continuing to access or use our platform after those revisions become effective, 
            you agree to be bound by the revised terms.
          </p>
        </div>

        {/* Contact */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Terms?</h2>
          <p className="text-blue-100 mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="flex items-center justify-center gap-2">
              <FileTextIcon size={20} />
              <span>legal@timroticket.com</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <PhoneIcon size={20} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
    </>
  );
}