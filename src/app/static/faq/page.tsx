"use client";

import { useState } from "react";
import { 
  TicketIcon,
  CreditCardIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowLeftIcon,
  EnvelopeSimpleIcon
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import { PageTitle } from "@/components/pagetitle/PageTitle";

export default function FAQPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const categories = [
    { id: "all", name: t("faq.categories.all", "All Questions"), icon: null },
    { id: "tickets", name: t("faq.categories.tickets", "Tickets & Booking"), icon: TicketIcon },
    { id: "payments", name: t("faq.categories.payments", "Payments & Refunds"), icon: CreditCardIcon },
    { id: "account", name: t("faq.categories.account", "Account & Profile"), icon: UserIcon },
    { id: "security", name: t("faq.categories.security", "Security & Privacy"), icon: ShieldCheckIcon },
    { id: "events", name: t("faq.categories.events", "Events & Venues"), icon: ClockIcon },
  ];

  const faqs = [
    // Tickets & Booking
    {
      id: 1,
      category: "tickets",
      question: t("faq.questions.q1.question", "How do I purchase tickets?"),
      answer: t("faq.questions.q1.answer", "To purchase tickets, simply browse events on our platform, select your desired event, choose the number of tickets, and proceed to checkout. You'll receive digital tickets via email after successful payment.")
    },
    {
      id: 2,
      category: "tickets",
      question: t("faq.questions.q2.question", "Where can I find my tickets after purchase?"),
      answer: t("faq.questions.q2.answer", "Your tickets are available in two places: 1) Your email inbox (check spam folder if not found), and 2) Your account dashboard under 'My Tickets' section. You can also download them from the order confirmation page.")
    },
    {
      id: 3,
      category: "tickets",
      question: t("faq.questions.q3.question", "Can I transfer my tickets to someone else?"),
      answer: t("faq.questions.q3.answer", "Yes, most tickets are transferable. You can transfer tickets through your account dashboard by selecting the ticket and clicking 'Transfer'. The recipient will receive an email with instructions to claim the ticket.")
    },
    {
      id: 4,
      category: "tickets",
      question: t("faq.questions.q4.question", "What if I lose my ticket QR code?"),
      answer: t("faq.questions.q4.answer", "Don't worry! You can always access your tickets from your account dashboard. Simply log in, go to 'My Tickets', and you'll find all your QR codes there. You can also request a resend of the confirmation email.")
    },
    {
      id: 5,
      category: "tickets",
      question: t("faq.questions.q5.question", "Is there a limit on how many tickets I can buy?"),
      answer: t("faq.questions.q5.answer", "Ticket limits vary by event. Some events may have a maximum purchase limit per person to ensure fair distribution. This information is displayed on the event page before purchase.")
    },

    // Payments & Refunds
    {
      id: 6,
      category: "payments",
      question: t("faq.questions.q6.question", "What payment methods do you accept?"),
      answer: t("faq.questions.q6.answer", "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), mobile banking, digital wallets (Google Pay, Apple Pay), and bank transfers. Available methods vary by region.")
    },
    {
      id: 7,
      category: "payments",
      question: t("faq.questions.q7.question", "Is my payment information secure?"),
      answer: t("faq.questions.q7.answer", "Absolutely! We use industry-standard encryption and never store your full payment details. All transactions are processed through secure, PCI-compliant payment gateways.")
    },
    {
      id: 8,
      category: "payments",
      question: t("faq.questions.q8.question", "How do I request a refund?"),
      answer: t("faq.questions.q8.answer", "To request a refund, contact our support team within the refund window with your order ID. Refunds are processed according to our Refund Policy. Visit our Refund Policy page for detailed information.")
    },
    {
      id: 9,
      category: "payments",
      question: t("faq.questions.q9.question", "How long does it take to process a refund?"),
      answer: t("faq.questions.q9.answer", "Refunds typically take 5-10 business days to process, depending on your payment method and bank. You'll receive a confirmation email once the refund is initiated.")
    },
    {
      id: 10,
      category: "payments",
      question: t("faq.questions.q10.question", "What are the service fees for?"),
      answer: t("faq.questions.q10.answer", "Service fees cover platform maintenance, customer support, secure payment processing, and feature development. These fees are clearly displayed before checkout.")
    },

    // Account & Profile
    {
      id: 11,
      category: "account",
      question: t("faq.questions.q11.question", "How do I create an account?"),
      answer: t("faq.questions.q11.answer", "Click the 'Sign Up' button on our homepage, enter your email address, create a password, and follow the verification steps. You can also sign up using Google or Facebook for faster registration.")
    },
    {
      id: 12,
      category: "account",
      question: t("faq.questions.q12.question", "I forgot my password. How do I reset it?"),
      answer: t("faq.questions.q12.answer", "Click 'Forgot Password' on the login page, enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.")
    },
    {
      id: 13,
      category: "account",
      question: t("faq.questions.q13.question", "How do I update my profile information?"),
      answer: t("faq.questions.q13.answer", "Log into your account, go to 'Profile Settings', and update your information. You can change your name, email address, phone number, and notification preferences.")
    },
    {
      id: 14,
      category: "account",
      question: t("faq.questions.q14.question", "Can I delete my account?"),
      answer: t("faq.questions.q14.answer", "Yes, you can delete your account by contacting our support team. Please note that this action is permanent and will remove all your data, including ticket purchase history.")
    },

    // Security & Privacy
    {
      id: 15,
      category: "security",
      question: t("faq.questions.q15.question", "How do you protect my personal information?"),
      answer: t("faq.questions.q15.answer", "We use advanced security measures including encryption, secure servers, and regular security audits. We never share your personal information with third parties without your consent.")
    },
    {
      id: 16,
      category: "security",
      question: t("faq.questions.q16.question", "What should I do if I receive a suspicious email about my tickets?"),
      answer: t("faq.questions.q16.answer", "Do not click any links or provide personal information. Forward the suspicious email to our support team and delete it immediately. Always access your tickets through our official website.")
    },
    {
      id: 17,
      category: "security",
      question: t("faq.questions.q17.question", "How do I enable two-factor authentication?"),
      answer: t("faq.questions.q17.answer", "Go to Account Settings > Security > Two-Factor Authentication. You can enable it using an authenticator app (like Google Authenticator) or SMS verification for added security.")
    },

    // Events & Venues
    {
      id: 18,
      category: "events",
      question: t("faq.questions.q18.question", "What happens if an event is canceled?"),
      answer: t("faq.questions.q18.answer", "If an event is canceled, all ticket holders will receive a full refund automatically. You'll be notified via email with further instructions. No action is required on your part.")
    },
    {
      id: 19,
      category: "events",
      question: t("faq.questions.q19.question", "What if an event is rescheduled?"),
      answer: t("faq.questions.q19.answer", "If an event is rescheduled, your tickets will be valid for the new date. You'll receive an email notification with the updated details. If you cannot attend the new date, you can request a refund.")
    },
    {
      id: 20,
      category: "events",
      question: t("faq.questions.q20.question", "What items are prohibited at events?"),
      answer: t("faq.questions.q20.answer", "Prohibited items vary by venue and event type. Common prohibited items include weapons, outside food/drinks, professional cameras, and large bags. Check the event page for specific restrictions.")
    },
    {
      id: 21,
      category: "events",
      question: t("faq.questions.q21.question", "Can I get a refund if I can't attend?"),
      answer: t("faq.questions.q21.answer", "Refunds for non-attendance are generally not provided unless specified in the event terms. However, most tickets can be transferred to someone else. Check our Refund Policy for more details.")
    }
  ];

  const toggleQuestion = (id: number) => {
    setOpenQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
    <PageTitle title={t("faq.title", "faq")}/>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              {t("static.faq.hero.title", "Frequently Asked Questions")}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t("static.faq.hero.subtitle", "Find answers to common questions about tickets, payments, events, and more")}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t("faq.search.placeholder", "Search for answers...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "bg-white text-gray-7700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {Icon && <Icon size={18} />}
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {t("faq.results.found", "Found")} {filteredFaqs.length} {filteredFaqs.length !== 1 ? t("faq.results.multiple", "results") : t("faq.results.single", "result")} {t("faq.results.for", "for")} &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openQuestions.includes(faq.id);
              return (
                <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUpIcon size={20} className="text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon size={20} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-0 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("faq.noResults.title", "No results found")}
              </h3>
              <p className="text-gray-600">
                {t("faq.noResults.desc", "We couldn't find any answers matching your search. Try different keywords or contact our support team.")}
              </p>
            </div>
          )}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
            {t("faq.cta.title", "Still have questions?")}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("faq.cta.subtitle", "Can't find the answer you're looking for? Our support team is here to help.")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <EnvelopeSimpleIcon size={20} />
              {t("faq.cta.btnContact", "Contact Support")}
            </a>
            <a 
              href="/static/how-it-works" 
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon size={20} />
              {t("faq.cta.btnHow", "Learn How It Works")}
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}