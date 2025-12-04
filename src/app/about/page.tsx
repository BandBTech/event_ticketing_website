"use client";

import { FigmaButton } from "@/components/ui/figma-button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { UsersIcon } from "@phosphor-icons/react";
import Image from "next/image";

export default function AboutPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <main className="min-h-screen bg-gray-50 gap-4 text-gray-900 ">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold"> 
          <span className="text-primary">{t('about.title')}</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto mt-4 opacity-85 leading-relaxed">
   {t('about.description')}
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold">{t('about.mission.title')}</h2>
          <p className="opacity-80 leading-relaxed">
           {t('about.mission.p1')}
          </p>
          <p className="opacity-80 leading-relaxed">
        {t('about.mission.p2')}
          </p>
        </div>

        <div className="relative h-72 w-full">
          <Image
            src= 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
            alt="Event crowd in Nepal"
            fill
            className="rounded-xl shadow-lg object-cover"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t('about.stats.title')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
           { count: t('about.stats.count.events'), label: t('about.stats.eventsListed') },
        { count: t('about.stats.count.tickets'), label: t('about.stats.ticketsSold') },
        { count: t('about.stats.count.cities'), label: t('about.stats.citiesCovered') },
        { count: t('about.stats.count.secure'), label: t('about.stats.securePayments') },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-gray-50 shadow-md border border-gray-200"
              >
                <h3 className="text-3xl font-bold text-primary">{item.count}</h3>
                <p className="mt-2 opacity-70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-semibold mb-6 text-center">{t('about.story.title')}</h2>
        <p className="opacity-85 leading-relaxed mb-6">
       {t('about.story.p1')}
        </p>
        <p className="opacity-85 leading-relaxed mb-10">
         {t('about.story.p2')}
        </p>

        <blockquote className="italic text-xl opacity-75 text-center">
          {t('about.story.slogan')}
        </blockquote>
      </section>

      {/* CTA */}

            <section className="py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="glass-strong rounded-2xl p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                    {t('about.cta.title')}
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    {t('about.cta.subtitle')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <FigmaButton
                      variant="primary"
                      size="xl"
                      showGlow={true}
                    >
                      <UsersIcon weight="duotone" size={20} />
                      {t('about.cta.becomeOrganizer')}
                    </FigmaButton>
                  </div>
                </div>
              </div>
            </section>
    </main>
  );
}
