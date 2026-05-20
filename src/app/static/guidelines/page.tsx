"use client";

import { 
  ShieldCheckIcon, 
  UsersIcon, 
  ClockIcon, 
  TicketIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  MapPinIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function EventGuidelinesPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const guidelines = [
    {
      icon: TicketIcon,
      title: "Ticket Purchase Guidelines",
      items: [
        "Purchase tickets only from official sources",
        "Verify event details before purchasing",
        "Keep your ticket QR code secure",
        "Tickets are non-transferable unless specified",
        "Check refund policy before purchase"
      ]
    },
    {
      icon: UsersIcon,
      title: "Attendee Guidelines",
      items: [
        "Arrive at least 30 minutes before event start",
        "Carry valid ID for age-restricted events",
        "Follow venue rules and regulations",
        "Respect other attendees and staff",
        "No outside food or beverages unless permitted"
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety & Security",
      items: [
        "Subject to security screening at entry",
        "Prohibited items will be confiscated",
        "Emergency exits are clearly marked",
        "Follow staff instructions during emergencies",
        "Report suspicious activity to security"
      ]
    },
    {
      icon: ClockIcon,
      title: "Event Timing",
      items: [
        "Doors open 60 minutes before event start",
        "Late entry may not be permitted",
        "Schedule subject to change without notice",
        "Check for updated timings before event",
        "No re-entry after exit"
      ]
    }
  ];

  const prohibitedItems = [
    "Weapons or sharp objects",
    "Illegal substances",
    "Professional cameras",
    "Recording devices",
    "Large bags or backpacks",
    "Outside alcohol",
    "Laser pointers",
    "Selfie sticks",
    "Pets (except service animals)",
    "Fireworks or explosives"
  ];

  return (
    <>
    <PageTitle title={t("guidelines.title","Guidelines")} />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            Event Guidelines
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Important information to ensure a safe and enjoyable experience for everyone
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Guidelines Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {guidelines.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Icon size={28} className="text-blue-600" weight="duotone" />
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <ul className="p-6 space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Prohibited Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Prohibited Items
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prohibitedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-red-500">✗</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-blue-100 mb-6">
            If you have any questions about event guidelines, please contact our support team
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <EnvelopeSimpleIcon size={20} />
              Contact Support
            </a>
            <a href="/static/faq" className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
              <PhoneIcon size={20} />
              Visit FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}