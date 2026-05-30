"use client";

import { 
  ShieldCheckIcon, 
  UsersIcon, 
  ClockIcon, 
  TicketIcon, 
  PhoneIcon,
  EnvelopeSimpleIcon
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
      title: t("guidelines.sections.ticket.title", "Ticket Purchase Guidelines"),
      items: [
        t("guidelines.sections.ticket.item1", "Purchase tickets only from official sources"),
        t("guidelines.sections.ticket.item2", "Verify event details before purchasing"),
        t("guidelines.sections.ticket.item3", "Keep your ticket QR code secure"),
        t("guidelines.sections.ticket.item4", "Tickets are non-transferable unless specified"),
        t("guidelines.sections.ticket.item5", "Check refund policy before purchase")
      ]
    },
    {
      icon: UsersIcon,
      title: t("guidelines.sections.attendee.title", "Attendee Guidelines"),
      items: [
        t("guidelines.sections.attendee.item1", "Arrive at least 30 minutes before event start"),
        t("guidelines.sections.attendee.item2", "Carry valid ID for age-restricted events"),
        t("guidelines.sections.attendee.item3", "Follow venue rules and regulations"),
        t("guidelines.sections.attendee.item4", "Respect other attendees and staff"),
        t("guidelines.sections.attendee.item5", "No outside food or beverages unless permitted")
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: t("guidelines.sections.safety.title", "Safety & Security"),
      items: [
        t("guidelines.sections.safety.item1", "Subject to security screening at entry"),
        t("guidelines.sections.safety.item2", "Prohibited items will be confiscated"),
        t("guidelines.sections.safety.item3", "Emergency exits are clearly marked"),
        t("guidelines.sections.safety.item4", "Follow staff instructions during emergencies"),
        t("guidelines.sections.safety.item5", "Report suspicious activity to security")
      ]
    },
    {
      icon: ClockIcon,
      title: t("guidelines.sections.timing.title", "Event Timing"),
      items: [
        t("guidelines.sections.timing.item1", "Doors open 60 minutes before event start"),
        t("guidelines.sections.timing.item2", "Late entry may not be permitted"),
        t("guidelines.sections.timing.item3", "Schedule subject to change without notice"),
        t("guidelines.sections.timing.item4", "Check for updated timings before event"),
        t("guidelines.sections.timing.item5", "No re-entry after exit")
      ]
    }
  ];

  const prohibitedItems = [
    t("guidelines.prohibited.item1", "Weapons or sharp objects"),
    t("guidelines.prohibited.item2", "Illegal substances"),
    t("guidelines.prohibited.item3", "Professional cameras"),
    t("guidelines.prohibited.item4", "Recording devices"),
    t("guidelines.prohibited.item5", "Large bags or backpacks"),
    t("guidelines.prohibited.item6", "Outside alcohol"),
    t("guidelines.prohibited.item7", "Laser pointers"),
    t("guidelines.prohibited.item8", "Selfie sticks"),
    t("guidelines.prohibited.item9", "Pets (except service animals)"),
    t("guidelines.prohibited.item10", "Fireworks or explosives")
  ];

  return (
    <>
    <PageTitle title={t("guidelines.title", "Guidelines")} />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            {t("static.guidelines.hero.title", "Event Guidelines")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t("static.guidelines.hero.subtitle", "Important information to ensure a safe and enjoyable experience for everyone")}
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
              {t("guidelines.prohibited.title", "Prohibited Items")}
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
          <h2 className="text-2xl font-bold mb-4">
            {t("guidelines.cta.title", "Need Help?")}
          </h2>
          <p className="text-blue-100 mb-6">
            {t("guidelines.cta.subtitle", "If you have any questions about event guidelines, please contact our support team")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <EnvelopeSimpleIcon size={20} />
              {t("guidelines.cta.btnContact", "Contact Support")}
            </a>
            <a href="/static/faq" className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
              <PhoneIcon size={20} />
              {t("guidelines.cta.btnFaq", "Visit FAQ")}
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}