'use client';

import { 
  Ticket, 
  EnvelopeSimple, 
  Phone, 
  MapPin, 
  FacebookLogo, 
  TwitterLogo, 
  InstagramLogo, 
  LinkedinLogo,
  ArrowRight
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
    ],
    organizers: [
      { name: 'Create Event', href: '#create-event' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Event Management', href: '#management' },
      { name: 'Analytics', href: '#analytics' },
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Support', href: '#support' },
      { name: 'Event Guidelines', href: '#guidelines' },
      { name: 'Refund Policy', href: '#refunds' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Security', href: '#security' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: FacebookLogo, href: '#facebook' },
    { name: 'Twitter', icon: TwitterLogo, href: '#twitter' },
    { name: 'Instagram', icon: InstagramLogo, href: '#instagram' },
    { name: 'LinkedIn', icon: LinkedinLogo, href: '#linkedin' },
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-[25px] border-t border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <Ticket size={24} className="text-blue-600" />
                  <span className="text-xl font-bold text-gray-900 font-poppins">
                    E-Ticket
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Nepal&apos;s premier event ticketing platform. Discover amazing events, 
                connect with your community, and create unforgettable experiences.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <EnvelopeSimple size={16} className="text-blue-500" />
                  <span>hello@e-ticket.com.np</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-blue-500" />
                  <span>+977-1-4567890</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-500" />
                  <span>Kathmandu, Nepal</span>
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
                <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
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
                <h3 className="font-semibold text-gray-900 mb-4">Organizers</h3>
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
                <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
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
              <h3 className="font-semibold text-gray-900">Stay Updated</h3>
              <p className="text-sm text-gray-600">
                Get notified about new events and exclusive offers.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="glass border text-gray-900 placeholder:text-gray-500 flex-1"
                />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md px-3"
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 E-Ticket. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Developed by <a href='https://thebandbtech.com/'>B&B Tech Group.</a></span>
              <div className="flex items-center gap-4">
                <a href="#privacy" className="hover:text-blue-600 transition-colors">
                  Privacy
                </a>
                <a href="#terms" className="hover:text-blue-600 transition-colors">
                  Terms
                </a>
                <a href="#cookies" className="hover:text-blue-600 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
