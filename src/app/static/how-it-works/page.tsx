"use client";

import { ArrowRightIcon, CheckCircleIcon, TicketIcon, UsersIcon, CalendarIcon, CreditCardIcon } from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function HowItWorksPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const steps = [
    {
      icon: CalendarIcon,
      title: t("howitworks.steps.findEvent.title", "Find Your Event"),
      description: t("howitworks.steps.findEvent.desc", "Browse through thousands of events happening near you or online. Use filters to find exactly what you're looking for."),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TicketIcon,
      title: t("howitworks.steps.chooseTickets.title", "Choose Tickets"),
      description: t("howitworks.steps.chooseTickets.desc", "Select your preferred ticket type and quantity. Early bird discounts and group packages available."),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: CreditCardIcon,
      title: t("howitworks.steps.securePayment.title", "Secure Payment"),
      description: t("howitworks.steps.securePayment.desc", "Pay securely using various payment methods including cards, mobile banking, and digital wallets."),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: UsersIcon,
      title: t("howitworks.steps.getTickets.title", "Get Your Tickets"),
      description: t("howitworks.steps.getTickets.desc", "Receive digital tickets instantly via email. Access them anytime from your account dashboard."),
      color: "from-orange-500 to-red-500"
    }
  ];

  const features = [
    {
      title: t("howitworks.features.instant.title", "Instant Confirmation"),
      description: t("howitworks.features.instant.desc", "Get your tickets immediately after payment"),
      icon: CheckCircleIcon
    },
    {
      title: t("howitworks.features.qrCodes.title", "Secure QR Codes"),
      description: t("howitworks.features.qrCodes.desc", "Each ticket has a unique QR code for entry"),
      icon: CheckCircleIcon
    },
    {
      title: t("howitworks.features.transfer.title", "Easy Transfer"),
      description: t("howitworks.features.transfer.desc", "Transfer tickets to friends and family easily"),
      icon: CheckCircleIcon
    },
    {
      title: t("howitworks.features.support.title", "24/7 Support"),
      description: t("howitworks.features.support.desc", "Our support team is always here to help"),
      icon: CheckCircleIcon
    }
  ];

  return (
    <>
    <PageTitle title={t("howitworks.title", "How-It-Works")} />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">
            {t("static.howitworks.hero.title", "How Timro-Ticket Works")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t("static.howitworks.hero.subtitle", "Your journey to unforgettable experiences starts here. Follow these simple steps to get your tickets.")}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative group">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent">
                      <ArrowRightIcon className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  )}
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                      <Icon size={40} weight="duotone" className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              {t("howitworks.features.heading", "Why Choose Timro-Ticket?")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("howitworks.features.subheading", "We make ticket buying simple, secure, and seamless")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Icon size={32} className="text-green-500 mb-4" weight="fill" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}