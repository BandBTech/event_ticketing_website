"use client";

import { FigmaButton } from "@/components/ui/figma-button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { UsersIcon, ChartBarIcon, TicketIcon, ShieldCheckIcon, MapPinIcon } from "@phosphor-icons/react";
import Image from "next/image";

export default function AboutPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const stats = [
    { 
      icon: TicketIcon, 
      count: t('about.stats.count.events'), 
      label: t('about.stats.eventsListed') 
    },
    { 
      icon: UsersIcon, 
      count: t('about.stats.count.tickets'), 
      label: t('about.stats.ticketsSold') 
    },
    { 
      icon: MapPinIcon, 
      count: t('about.stats.count.cities'), 
      label: t('about.stats.citiesCovered') 
    },
    { 
      icon: ShieldCheckIcon, 
      count: t('about.stats.count.secure'), 
      label: t('about.stats.securePayments') 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-15 bg-secondary">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl text-primary font-bold mb-6">
            {t('about.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('about.description')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  {t('about.mission.title')}
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.p1')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.p2')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src='https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
                alt="Event crowd in Nepal"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('about.stats.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('about.stats.subtitle', 'Our impact in numbers across Nepal')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-2xl shadow-md p-8 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Icon size={24} weight="duotone" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      {stat.count}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('about.story.title')}
              </h2>
            </div>

            <div className="space-y-6 mb-10">
              <p className="text-muted-foreground leading-relaxed">
                {t('about.story.p1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.story.p2')}
              </p>
            </div>

            <blockquote className="text-center">
              <div className="relative">
                <div className="absolute -top-2 -left-4 text-3xl text-primary opacity-30">&quot;</div>
                <p className="text-xl italic text-muted-foreground max-w-2xl mx-auto relative z-10">
                  {t('about.story.slogan')}
                </p>
                <div className="absolute -bottom-2 -right-4 text-3xl text-primary opacity-30">&quot;</div>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about.cta.title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                {t('about.cta.subtitle')}
              </p>
              <div className="flex justify-center">
                <FigmaButton
                  variant="primary"
                  size="xl"
                  showGlow={true}
                >
                  <UsersIcon weight="duotone" size={20} className="mr-2" />
                  {t('about.cta.becomeOrganizer')}
                </FigmaButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}