"use client";

import { 
  ClockIcon, 
  EnvelopeSimpleIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function RefundPolicyPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const refundEligibility = [
    {
      status: t("refundPolicy.eligibility.eligible.status", "Eligible for Refund"),
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      conditions: [
        t("refundPolicy.eligibility.eligible.cond1", "Event cancellation by organizer"),
        t("refundPolicy.eligibility.eligible.cond2", "Duplicate payment made"),
        t("refundPolicy.eligibility.eligible.cond3", "Technical error during purchase"),
        t("refundPolicy.eligibility.eligible.cond4", "Event rescheduled to different date (within 48 hours)")
      ]
    },
    {
      status: t("refundPolicy.eligibility.notEligible.status", "Not Eligible for Refund"),
      icon: XCircleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50",
      conditions: [
        t("refundPolicy.eligibility.notEligible.cond1", "Change of mind or personal reasons"),
        t("refundPolicy.eligibility.notEligible.cond2", "Late arrival or no-show"),
        t("refundPolicy.eligibility.notEligible.cond3", "Event already attended"),
        t("refundPolicy.eligibility.notEligible.cond4", "Partial event attendance")
      ]
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: t("refundPolicy.process.step1.title", "Submit Request"),
      description: t("refundPolicy.process.step1.desc", "Contact support within the refund window with your order details")
    },
    {
      step: 2,
      title: t("refundPolicy.process.step2.title", "Verification"),
      description: t("refundPolicy.process.step2.desc", "Our team verifies your request against our refund policy")
    },
    {
      step: 3,
      title: t("refundPolicy.process.step3.title", "Approval"),
      description: t("refundPolicy.process.step3.desc", "You'll receive confirmation if your refund is approved")
    },
    {
      step: 4,
      title: t("refundPolicy.process.step4.title", "Processing"),
      description: t("refundPolicy.process.step4.desc", "Refund is processed within 5-10 business days")
    }
  ];

  return (
    <>
    <PageTitle title={t("refundPolicy.title", "Refund Policy")}/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            {t("static.refundpolicy.title", "Refund Policy")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t("static.refundpolicy.subtitle", "Understanding your rights and our refund procedures")}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">
            {t("refundPolicy.lastUpdated", "Last Updated:")}{" "}
            {new Date().toLocaleDateString(locale === "en" ? "en-US" : locale, { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("refundPolicy.intro.title", "Introduction")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t("refundPolicy.intro.p1", "At Timro-Ticket, we strive to provide the best ticket purchasing experience. This refund policy outlines the circumstances under which refunds may be issued and the process for requesting them.")}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t("refundPolicy.intro.p2", "Please read this policy carefully before making a purchase. By purchasing tickets through our platform, you agree to the terms outlined below.")}
          </p>
        </div>

        {/* Refund Eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {refundEligibility.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={`${item.bgColor} rounded-xl p-6 border`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={28} className={item.color} weight="fill" />
                  <h3 className="text-xl font-bold text-gray-900">{item.status}</h3>
                </div>
                <ul className="space-y-2">
                  {item.conditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className={`${item.color} mt-1`}>•</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Refund Process */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("refundPolicy.process.title", "Refund Process")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {refundProcess.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ClockIcon size={20} className="text-yellow-600" />
            {t("refundPolicy.notes.title", "Important Notes")}
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• {t("refundPolicy.notes.bullet1", "Refund requests must be submitted within 7 days of purchase")}</li>
            <li>• {t("refundPolicy.notes.bullet2", "Processing time may vary depending on your payment method")}</li>
            <li>• {t("refundPolicy.notes.bullet3", "Service fees are non-refundable in most cases")}</li>
            <li>• {t("refundPolicy.notes.bullet4", "Refunds are issued to the original payment method")}</li>
            <li>• {t("refundPolicy.notes.bullet5", "Organizer-led events may have additional terms")}</li>
          </ul>
        </div>

        {/* How to Request */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("refundPolicy.howToRequest.title", "How to Request a Refund")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">1</div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("refundPolicy.howToRequest.step1.title", "Contact Support")}
                </p>
                <p className="text-gray-600">
                  {t("refundPolicy.howToRequest.step1.desc", "Email us at")} <a href="mailto:support@timroticket.com" className="text-blue-600">support@timroticket.com</a> {t("refundPolicy.howToRequest.step1.descEnd", "with your order ID")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">2</div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("refundPolicy.howToRequest.step2.title", "Provide Details")}
                </p>
                <p className="text-gray-600">
                  {t("refundPolicy.howToRequest.step2.desc", "Include your order number, event name, and reason for refund")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">3</div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("refundPolicy.howToRequest.step3.title", "Wait for Response")}
                </p>
                <p className="text-gray-600">
                  {t("refundPolicy.howToRequest.step3.desc", "Our team will respond within 2-3 business days")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("refundPolicy.cta.title", "Need Assistance?")}
          </h2>
          <p className="text-blue-100 mb-6">
            {t("refundPolicy.cta.subtitle", "Our support team is here to help with any refund-related questions")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <EnvelopeSimpleIcon size={20} />
              {t("refundPolicy.cta.btnContact", "Contact Support")}
            </a>
            <a href="/static/faq" className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
              <PhoneIcon size={20} />
              {t("refundPolicy.cta.btnFaq", "Visit FAQ")}
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}