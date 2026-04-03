"use client";

import { 
  ShieldCheckIcon, 
  EyeIcon, 
  DatabaseIcon, 
  CookieIcon,
  PhoneIcon,
  FileTextIcon,
  CheckCircleIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPolicyPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const lastUpdated = "January 1, 2024";

  const sections = [
    {
      icon: DatabaseIcon,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number, address)",
        "Payment information (processed securely through third-party providers)",
        "Ticket purchase history and event preferences",
        "Device information and usage data",
        "Location data (with your consent)",
        "Communication preferences and feedback"
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: "How We Use Your Information",
      content: [
        "Process and deliver ticket purchases",
        "Send event updates and important notifications",
        "Improve our services and user experience",
        "Prevent fraud and ensure platform security",
        "Personalize event recommendations",
        "Comply with legal obligations"
      ]
    },
    {
      icon: EyeIcon,
      title: "Information Sharing",
      content: [
        "We never sell your personal information to third parties",
        "Share necessary information with event organizers for ticket validation",
        "Work with trusted payment processors and service providers",
        "Disclose information when required by law",
        "Share anonymized data for analytics and improvements"
      ]
    },
    {
      icon: CookieIcon,
      title: "Cookies & Tracking",
      content: [
        "Use cookies to enhance your browsing experience",
        "Remember your preferences and login status",
        "Analyze website traffic and user behavior",
        "You can control cookie settings in your browser",
        "Third-party cookies for analytics and advertising"
      ]
    }
  ];

  const yourRights = [
    "Access your personal data",
    "Correct inaccurate information",
    "Delete your account and data",
    "Opt-out of marketing communications",
    "Data portability",
    "Restrict certain data processing"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy matters to us. Learn how we collect, use, and protect your information.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            At Timro-Ticket, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using Timro-Ticket, you consent to the data practices described in this policy. Please read this policy carefully 
            to understand our views and practices regarding your personal data.
          </p>
        </div>

        {/* Information Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Icon size={28} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Rights */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
          <p className="text-gray-600 mb-6">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yourRights.map((right, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">{right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. These include:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">SSL/TLS encryption for data transmission</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Regular security audits and vulnerability assessments</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Access controls and authentication measures</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Secure data storage with encryption at rest</span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
          <p className="text-blue-100 mb-6">
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="flex items-center justify-center gap-2">
              <MailIcon size={20} />
              <span>privacy@timroticket.com</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <PhoneIcon size={20} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}