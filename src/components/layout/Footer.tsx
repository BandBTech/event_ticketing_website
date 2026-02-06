'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname } from 'next/navigation';
import { ArrowRightIcon, EnvelopeSimpleIcon, FacebookLogoIcon, InstagramLogoIcon, LinkedinLogoIcon, MapPinIcon, PhoneIcon, TicketIcon, TwitterLogoIcon } from '@phosphor-icons/react';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';

export function Footer() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp'];

  if (authPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }
  const footerLinks = {
    company: [
      { name: t('footer.links.company.aboutUs'), href: '/about' },
      { name: t('footer.links.company.howItWorks'), href: '#how-it-works' },
      // { name: t('footer.links.company.careers'), href: '#careers' },
      // { name: t('footer.links.company.press'), href: '#press' },
    ],
    organizers: [
      { name: t('footer.links.organizers.createEvent'), href: '#create-event' },
      { name: t('footer.links.organizers.pricing'), href: '#pricing' },
      { name: t('footer.links.organizers.eventManagement'), href: '#management' },
      { name: t('footer.links.organizers.analytics'), href: '#analytics' },
    ],
    support: [
      { name: t('footer.links.support.helpCenter'), href: '#help' },
      { name: t('footer.links.support.contactSupport'), href: '#support' },
      { name: t('footer.links.support.eventGuidelines'), href: '#guidelines' },
      { name: t('footer.links.support.refundPolicy'), href: '#refunds' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Security', href: '#security' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: FacebookLogoIcon, href: '#facebook' },
    { name: 'Twitter', icon: TwitterLogoIcon, href: '#twitter' },
    { name: 'Instagram', icon: InstagramLogoIcon, href: '#instagram' },
    { name: 'LinkedIn', icon: LinkedinLogoIcon, href: '#linkedin' },
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-[25px] border-t border-white/30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <TicketIcon size={24} className="text-blue-600" />
                  <span className="text-xl font-bold text-gray-900 font-poppins">
                    Timro-Ticket
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                {t('footer.description')}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <EnvelopeSimpleIcon size={16} className="text-blue-500" />
                  <span>{t('footer.contact.email')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <PhoneIcon size={16} className="text-blue-500" />
                  <span>{t('footer.contact.phone')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon size={16} className="text-blue-500" />
                  <span>{t('footer.contact.address')}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-lg glass border hover:bg-white/90 transition-all duration-200"
                      aria-label={social.name}
                    >
                      <Icon size={20} className="text-gray-600" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">{t('footer.links.company.title')}</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">{t('footer.links.organizers.title')}</h3>
                <ul className="space-y-3">
                  {footerLinks.organizers.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">{t('footer.links.support.title')}</h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="font-semibold text-gray-900">{t('newsletter.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('newsletter.subtitle')}
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t('newsletter.email.placeholder')}
                  className="glass border text-gray-900 placeholder:text-gray-500 flex-1"
                />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md px-3"
                >
                  <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} {t('footer.copyright')}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Developed by <a href='https://thebandbtech.com/'>B&B Tech Group.</a></span>
              <div className="flex items-center gap-4">
                <a href="#privacy" className="hover:text-blue-600 transition-colors">
                  {t('footer.links.legal.privacyPolicy')}
                </a>
                <a href="#terms" className="hover:text-blue-600 transition-colors">
                  {t('footer.links.legal.termsOfService')}
                </a>
                <a href="#cookies" className="hover:text-blue-600 transition-colors">
                  {t('footer.links.legal.cookiePolicy')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
