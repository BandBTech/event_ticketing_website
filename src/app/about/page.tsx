"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 gap-4 text-gray-900 ">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          About <span className="text-primary">Timro-Ticket</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto mt-4 opacity-85 leading-relaxed">
          Events bring people together — and we believe every connection creates
          a story worth remembering. We make those moments simpler, smoother,
          and more accessible to everyone in Nepal.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold">Our Mission</h2>
          <p className="opacity-80 leading-relaxed">
            We empower organizers with smart tools to manage, promote, and sell
            events — while giving audiences the easiest way to discover and book
            exciting experiences happening around them.
          </p>
          <p className="opacity-80 leading-relaxed">
            From concerts to conferences, we support Nepal&apos;s growing event
            culture with seamless digital solutions.
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
            The Platform Trusted Across Nepal
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { count: "500+", label: "Events Listed" },
              { count: "50K+", label: "Tickets Sold" },
              { count: "25+", label: "Cities Covered" },
              { count: "100%", label: "Secure Payments" },
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
        <h2 className="text-3xl font-semibold mb-6 text-center">Our Story</h2>
        <p className="opacity-85 leading-relaxed mb-6">
          We started with a simple idea: Nepal has countless events happening
          every day — but discovering them shouldn&apos;t be so complicated. There
          was enthusiasm, creativity, passion… yet a lack of digital connection
          between organizers and audiences.
        </p>
        <p className="opacity-85 leading-relaxed mb-10">
          Today, thousands of people rely on Timro-Ticket to find their next
          unforgettable experience — and we&apos;re just getting started.
        </p>

        <blockquote className="italic text-xl opacity-75 text-center">
          “Your next greatest memory starts with a ticket.”
        </blockquote>
      </section>

      {/* CTA */}
      <section className="text-center pb-24">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to Host Your Own Event?
        </h2>
        <p className="max-w-xl mx-auto opacity-80 mb-8">
          Whether it&apos;s a small gathering or a large festival — we&apos;re here to
          help you create and grow unforgettable experiences.
        </p>
        <a
          href="/organizer/register"
          className="bg-primary text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition"
        >
          Become an Organizer
        </a>
      </section>
    </main>
  );
}
