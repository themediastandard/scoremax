import Link from 'next/link';
import { Check } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - ScoreMax Tutoring | Memberships, Packages & Courses',
  description: 'Transparent pricing for SAT, ACT, and academic tutoring. Monthly memberships from $299, prepaid packages, and in-person courses. Book a free consultation.',
  keywords: 'ScoreMax pricing, tutoring cost, SAT tutoring price, ACT tutoring, membership, tutoring packages',
};

const oneOnOneRates = [
  { name: 'SAT / ACT', rate: '$250', note: 'Includes materials' },
  { name: 'AP Math & Science', rate: '$200', note: 'Per hour' },
  { name: 'Middle & High School', rate: '$175', note: 'Math & Science (non-AP)' },
  { name: 'Elementary', rate: '$150', note: 'Reading, math, science' },
];

const memberships = [
  { name: 'Starter', price: 299, hours: 2, perks: ['$10 off additional hours', 'Month-to-month', '1 rollover session/month'], featured: false },
  { name: 'Core', price: 549, hours: 4, perks: ['Priority scheduling', 'Access to Avi\'s video library', 'Month-to-month', '1 rollover session/month'], featured: true },
  { name: 'Premier', price: 899, hours: 8, perks: ['Priority + weekend access', 'Monthly expert chat', 'SAT diagnostics', '1 rollover session/month'], featured: false },
];

const packages = [
  { hours: 10, price: 1200, perHour: 120 },
  { hours: 20, price: 2300, perHour: 115 },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-32 pb-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Pricing</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Invest in Your Student&apos;s Success
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Choose the option that fits your goals. All plans include expert tutors, personalized support, and proven results.
          </p>
        </div>
      </section>

      {/* 1:1 Tutoring Rates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Pay As You Go</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-1">1:1 Tutoring</h2>
            <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mt-4 mb-5" />
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Single sessions for flexibility. Materials included for SAT & ACT.</p>
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 font-[family-name:var(--font-playfair)]">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {oneOnOneRates.map((row) => (
                  <tr key={row.name} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4">
                      <span className="font-[family-name:var(--font-playfair)] font-medium text-gray-900">{row.name}</span>
                      <span className="text-gray-400 text-sm ml-2">{row.note}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-[family-name:var(--font-playfair)] text-xl text-gray-900">{row.rate}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100">
              <Link href="/book" className="inline-flex items-center justify-center w-full sm:w-auto bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
                Book a Single Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Memberships - Recommended */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Recommended</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-1">Monthly Memberships</h2>
            <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mt-4 mb-5" />
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Lock in your rate, guarantee a weekly slot, and get consistent support. Month-to-month with no long-term commitment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {memberships.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.featured
                    ? 'border-[#b08a30] bg-amber-50/30 shadow-lg relative'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#b08a30] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{plan.hours} hours included</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#b08a30] shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book"
                  className={`block text-center py-3 text-sm font-medium transition-colors font-[family-name:var(--font-playfair)] ${
                    plan.featured
                      ? 'bg-[#b08a30] text-white hover:bg-[#9a7628]'
                      : 'border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages & SAT Course - Two columns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Prepaid Packages */}
            <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Short-Term</div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-1">Prepaid Packages</h2>
              <div className="w-10 h-[2px] bg-[#b08a30] mt-4 mb-6" />
              <p className="text-gray-500 text-sm mb-6">Best for short-term goals or families who prefer to prepay without a subscription.</p>
              <div className="space-y-4 mb-8">
                {packages.map((pkg) => (
                  <div key={pkg.hours} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900">{pkg.hours} hours</span>
                      <span className="text-gray-400 text-sm ml-2">${pkg.perHour}/hr effective</span>
                    </div>
                    <span className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">${pkg.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Link href="/book" className="block text-center py-3 border border-gray-300 text-gray-700 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors font-[family-name:var(--font-playfair)]">
                Book a Package
              </Link>
            </div>

            {/* In-Person SAT Course */}
            <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Prep</div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-1">In-Person SAT Course</h2>
              <div className="w-10 h-[2px] bg-[#b08a30] mt-4 mb-6" />
              <p className="text-gray-500 text-sm mb-6">8-week program with small groups. Strategy, practice tests, and expert instruction.</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#b08a30] shrink-0 mt-0.5" /> 2 sessions per week, 2 hours each</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#b08a30] shrink-0 mt-0.5" /> 32 total contact hours</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#b08a30] shrink-0 mt-0.5" /> Diagnostics + practice tests included</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#b08a30] shrink-0 mt-0.5" /> Bonus: 2 hours of 1:1 tutoring</li>
              </ul>
              <div className="mb-6">
                <span className="font-[family-name:var(--font-playfair)] text-3xl text-gray-900">$1,200 – $1,500</span>
              </div>
              <Link href="/test-prep/in-person-classes" className="block text-center py-3 bg-[#b08a30] text-white text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
                Learn About Classes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Not sure which option is right?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">
            Book a free consultation and we&apos;ll help you choose the best plan for your student&apos;s goals.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-8 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            Book Free Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
