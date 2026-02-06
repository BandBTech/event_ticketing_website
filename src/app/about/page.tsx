"use client";

import { FigmaButton } from "@/components/ui/figma-button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import {
  UsersIcon,
  TicketIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ArrowRightIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const stats = [
    { icon: TicketIcon, count: "500+", label: t("about.stats.eventsListed") },
    { icon: UsersIcon, count: "50K+", label: t("about.stats.ticketsSold") },
    { icon: MapPinIcon, count: "25+", label: t("about.stats.citiesCovered") },
    {
      icon: ShieldCheckIcon,
      count: "100%",
      label: t("about.stats.securePayments"),
    },
  ];

  return (
    <div className="min-h-screen bg-white/40">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border">
            <MapTrifoldIcon size={20} weight="duotone" className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {t("about.badge", "Our Journey")}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 font-poppins">
            {t("about.title").split(" ").slice(0, -1).join(" ")}{" "}
            <span className="gradient-text">
              {t("about.title").split(" ").pop()}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("about.description")}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[100px] -z-10" />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "glass rounded-2xl p-6 text-center border border-white/40",
                    "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    "flex flex-col items-center justify-center",
                  )}
                >
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 mb-3">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <h3 className="text-3xl font-bold  text-gray-900 mb-1 font-poppins">
                    {stat.count}
                  </h3>
                  <p className="text-sm font-medium text-gray-500  tracking-wider">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section - Using Home's spacing and rounded corners */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                {t("about.mission.title")}
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>{t("about.mission.p1")}</p>
                <p>{t("about.mission.p2")}</p>
              </div>
            </div>

            <div className="relative h-[450px] w-full rounded-2xl overflow-hidden glass p-2 border">
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop"
                  alt="Event crowd"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Modern Typography */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">
            {t("about.story.title")}
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed mb-12">
            <p>{t("about.story.p1")}</p>
            <p>{t("about.story.p2")}</p>
          </div>

          <div className="italic text-xl text-gray-700">
            {t("about.story.slogan")}
          </div>
        </div>
      </section>

      {/* CTA Section - Identical to Home Page CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-2xl p-12 border border-white/40 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              {t("about.cta.title")}
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              {t("about.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <FigmaButton variant="primary" size="xl" showGlow={true}>
                <UsersIcon weight="duotone" size={20} className="mr-2" />
                {t("about.cta.becomeOrganizer")}
              </FigmaButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
