import Link from 'next/link';
import { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'GMAT Tutoring Services | Expert GMAT Test Prep | ScoreMax',
  description: 'One-on-one online GMAT tutoring with expert tutors. Prepare for all three sections of the current GMAT — Quantitative Reasoning, Verbal Reasoning and Data Insights — and raise your 205-805 score. Book your free consultation.',
  keywords: 'GMAT tutoring, GMAT test prep, GMAT preparation, GMAT scores, data insights, quantitative reasoning, verbal reasoning, business school admission, MBA, GMAT tutoring services',
  authors: [{ name: 'ScoreMax Tutoring' }],
  creator: 'ScoreMax Tutoring',
  publisher: 'ScoreMax Tutoring',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.scoremaxtutoring.com/test-prep/gmat',
    siteName: 'ScoreMax',
    title: 'GMAT Tutoring Services | Expert GMAT Test Prep | ScoreMax',
    description: 'One-on-one online GMAT tutoring with expert tutors across Quantitative Reasoning, Verbal Reasoning and Data Insights.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'GMAT Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GMAT Tutoring Services | Expert GMAT Test Prep',
    description: 'One-on-one online GMAT tutoring with expert tutors across Quantitative Reasoning, Verbal Reasoning and Data Insights.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/test-prep/gmat',
  },
};

export default function GMATPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PageHero
        eyebrow="Test Prep"
        title="Expert GMAT Tutoring"
        intro="Data Insights now counts for a full third of your GMAT score, and it is the section most applicants underestimate. Our tutors prepare you across all three sections one-on-one, with the pacing and the review discipline a competitive business school score requires."
        image="/Images/hero-gmat-tutoring.jpg"
        imageAlt="A business school case-study classroom with tiered wooden desks facing a lit screen showing a rising chart."
      />

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Your Path to a Competitive GMAT Score
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Three sections, equally weighted. We find which one is actually costing you points and build the plan
              from there.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">The Current GMAT</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sentence Correction and the essay are gone, Data Sufficiency moved into Data Insights, and the test
                is now 2 hours 15 minutes. We teach the exam as it is administered today.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Data Insights Depth</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Multi-source reasoning, table analysis, graphics interpretation and two-part analysis are unlike
                anything in undergraduate coursework. This section rewards focused practice more than any other.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Equal Section Weighting</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Quant, Verbal and Data Insights contribute equally to your Total Score. A weak third section caps
                your result no matter how strong the other two are.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Review &amp; Edit Strategy</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You can bookmark questions and change a limited number of answers within each section. We rehearse
                how to spend that allowance rather than discovering it on test day.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Choose Your Section Order</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You select the order you sit the three sections in. We test different orders in practice so you walk
                in with a decision already made and rehearsed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Built for Working Applicants</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Most GMAT students are studying around a full-time job. Sessions are one-on-one, held online over
                live video, and scheduled around your working week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GMAT Test Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Structure</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Master All Three GMAT Sections
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Three sections of 45 minutes each, 2 hours 15 minutes in total, taken in whichever order you choose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Quantitative Reasoning</h3>
              <p className="text-gray-500 text-sm mb-3">21 questions, 45 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Problem Solving</li>
                <li>• Arithmetic &amp; Algebra</li>
                <li>• Word Problems</li>
                <li>• No On-Screen Calculator</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Verbal Reasoning</h3>
              <p className="text-gray-500 text-sm mb-3">23 questions, 45 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Reading Comprehension</li>
                <li>• Critical Reasoning</li>
                <li>• Argument Evaluation</li>
                <li>• Sentence Correction Retired</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Data Insights</h3>
              <p className="text-gray-500 text-sm mb-3">20 questions, 45 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Data Sufficiency</li>
                <li>• Multi-Source Reasoning</li>
                <li>• Table Analysis &amp; Graphics</li>
                <li>• Two-Part Analysis</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Scoring</h3>
              <p className="text-gray-500 text-sm">
                Total Scores run from 205 to 805, built from all three sections weighted equally. The exam is
                adaptive, so the difficulty of each question responds to how you have answered so far.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Test format and scoring per GMAC. Confirm current details at mba.com before you register.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Take On the GMAT?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Start with a free consultation. We will look at your target programs, your test date, and which of the
            three sections is holding your score down.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
              Book Free Consultation
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
