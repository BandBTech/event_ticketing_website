"use client";

import { 
  CookieIcon, 
  GearIcon, 
  ChartLineIcon,
  UserFocusIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { PhoneIcon } from "lucide-react";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function CookiePolicyPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const lastUpdated = "January 1, 2024";

  const cookieTypes = [
    {
      icon: GearIcon,
      name: "Essential Cookies",
      description: "Required for the website to function properly",
      alwaysActive: true,
      examples: ["Authentication", "Security", "Shopping cart", "Session management"]
    },
    {
      icon: UserFocusIcon,
      name: "Functional Cookies",
      description: "Enhance functionality and personalization",
      alwaysActive: false,
      examples: ["Language preferences", "Region selection", "User interface customization", "Remember login details"]
    },
    {
      icon: ChartLineIcon,
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our site",
      alwaysActive: false,
      examples: ["Page views", "Click tracking", "Traffic sources", "User behavior analysis"]
    },
    {
      icon: CookieIcon,
      name: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      alwaysActive: false,
      examples: ["Targeted ads", "Campaign tracking", "Retargeting", "Social media integration"]
    }
  ];

  const howToManage = [
    {
      browser: "Chrome",
      steps: [
        "Click the three dots menu in the top-right corner",
        "Go to Settings > Privacy and Security",
        "Click on 'Cookies and other site data'",
        "Adjust your cookie preferences"
      ]
    },
    {
      browser: "Firefox",
      steps: [
        "Click the menu button (three lines) in the top-right",
        "Select Options > Privacy & Security",
        "Go to 'Cookies and Site Data' section",
        "Choose your preferred settings"
      ]
    },
    {
      browser: "Safari",
      steps: [
        "Go to Safari > Preferences",
        "Click on the Privacy tab",
        "Adjust 'Cookies and website data' settings",
        "Choose your preferred option"
      ]
    },
    {
      browser: "Edge",
      steps: [
        "Click the three dots menu in the top-right",
        "Go to Settings > Cookies and site permissions",
        "Select 'Manage and delete cookies and site data'",
        "Adjust your cookie settings"
      ]
    }
  ];

  return (
    <>
    <PageTitle title={t("cookiesPolicy.title","Cookies-Policy")} />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CookieIcon size={48} className="mx-auto mb-4" weight="duotone" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              Cookie Policy
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Learn how we use cookies and similar technologies to improve your experience.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work more efficiently and provide valuable information to website owners.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This Cookie Policy explains what cookies are, how we use them, and how you can control your cookie preferences.
          </p>
        </div>

        {/* Types of Cookies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
          <div className="space-y-4">
            {cookieTypes.map((cookie, index) => {
              const Icon = cookie.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon size={24} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">{cookie.name}</h3>
                    </div>
                    {cookie.alwaysActive ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        <CheckCircleIcon size={14} />
                        Always Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        <XCircleIcon size={14} />
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{cookie.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {cookie.examples.map((example, idx) => (
                        <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Manage Cookies */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Manage Cookies</h2>
          <p className="text-gray-600 mb-6">
            You can control and manage cookies in various ways. Most browsers allow you to:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">View and delete cookies stored on your device</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Block third-party cookies</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Set preferences for specific websites</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon size={18} className="text-green-500 mt-0.5" />
              <span className="text-gray-700">Clear all cookies when closing the browser</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Browser-Specific Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {howToManage.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{item.browser}</h4>
                <ul className="space-y-1">
                  {item.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may also use cookies from third-party services such as Google Analytics, social media platforms, 
            and payment processors. These cookies are set by the third parties and are subject to their own 
            privacy policies.
          </p>
          <p className="text-gray-600 leading-relaxed">
            While we do not have direct control over these cookies, you can manage them through your browser 
            settings or the third-party&apos;s privacy preferences.
          </p>
        </div>

        {/* Cookie Consent */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Consent</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            When you first visit our website, you will see a cookie banner asking for your consent to place 
            non-essential cookies on your device. You can change your cookie preferences at any time by:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span className="text-gray-700">Clicking the cookie settings link in our footer</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span className="text-gray-700">Adjusting your browser settings</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span className="text-gray-700">Using third-party opt-out tools</span>
            </li>
          </ul>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, 
            legal requirements, or our practices. We will notify you of any material changes by 
            posting the new policy on this page and updating the &quot;Last Updated&quot; date.
          </p>
        </div>

        {/* Contact */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
          <p className="text-blue-100 mb-6">
            If you have any questions about our use of cookies, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="flex items-center justify-center gap-2">
              <CookieIcon size={20} />
              <span>cookies@timroticket.com</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <PhoneIcon size={20} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
    </>
  );
}