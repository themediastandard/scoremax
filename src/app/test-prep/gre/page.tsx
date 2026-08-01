import Link from 'next/link';
import { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'GRE Tutoring Services | Expert GRE Test Prep | ScoreMax',
  description: 'One-on-one online GRE tutoring with expert tutors. Prepare for the shorter GRE General Test: Verbal Reasoning, Quantitative Reasoning and Analytical Writing in under two hours. Book your free consultation.',
  keywords: 'GRE tutoring, GRE test prep, GRE preparation, GRE scores, verbal reasoning, quantitative reasoning, analytical writing, graduate school admission, GRE tutoring services',
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
    url: 'https://www.scoremaxtutoring.com/test-prep/gre',
    siteName: 'ScoreMax',
    title: 'GRE Tutoring Services | Expert GRE Test Prep | ScoreMax',
    description: 'One-on-one online GRE tutoring with expert tutors. Prepare for the shorter GRE General Test across Verbal, Quantitative and Analytical Writing.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'GRE Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GRE Tutoring Services | Expert GRE Test Prep',
    description: 'One-on-one online GRE tutoring with expert tutors across Verbal, Quantitative and Analytical Writing.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/test-prep/gre',
  },
};

export default function GREPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PageHero
        eyebrow="Test Prep"
        title="Expert GRE Tutoring"
        intro="The GRE is now under two hours, which leaves very little room for a slow start. Our tutors work with you one-on-one on the reasoning, vocabulary in context, and quantitative fundamentals that graduate programs weigh most, and on the pacing the shorter test demands."
        image="/Images/hero-gre-tutoring.jpg"
        imageAlt="A graduate seminar room with a glass writing wall of worked equations beside a table stacked with academic journals."
      />

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Your Path to a Strong GRE Score
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Graduate programs read your Verbal and Quantitative scores differently depending on the field. We
              prepare you for the sections that matter to yours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">The Shorter GRE</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The test was cut to about 1 hour 58 minutes: no unscored research section, no scheduled break, and
                no &ldquo;Analyze an Argument&rdquo; essay. We prepare you for the current version, not the old one.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Section-Adaptive Strategy</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your performance on the first Verbal and Quant section sets the difficulty of the second. That makes
                the opening section unusually valuable, and we build your approach around it.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Vocabulary in Context</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Text Completion and Sentence Equivalence reward reading the logic of a sentence, not memorising word
                lists. We teach you to find the pivot word before you look at the choices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Quant Without Calculus</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                GRE Quant covers arithmetic, algebra, geometry and data analysis &mdash; no calculus, no trigonometry.
                For many students the work is rebuilding fundamentals they last used years ago.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Use the Navigation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You can skip within a section, mark questions and change answers freely. We practise a deliberate
                two-pass approach so easy points are never left on the table.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Planned Around Deadlines</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Official scores arrive roughly 8&ndash;10 days after your test. We schedule sessions back from your
                application deadlines so there is room to retake if you want one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRE Test Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Structure</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Master Every GRE Section
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Five sections, about 1 hour 58 minutes total. Analytical Writing is always first; the Verbal and
              Quantitative sections follow in any order.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Analytical Writing</h3>
              <p className="text-gray-500 text-sm mb-3">1 task, 30 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• &ldquo;Analyze an Issue&rdquo; Essay</li>
                <li>• Always the First Section</li>
                <li>• Scored 0&ndash;6, Half-Point Steps</li>
                <li>• Argument Essay Retired</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Verbal Reasoning</h3>
              <p className="text-gray-500 text-sm mb-3">2 sections, 27 questions, 41 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Reading Comprehension</li>
                <li>• Text Completion</li>
                <li>• Sentence Equivalence</li>
                <li>• Scored 130&ndash;170</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Quantitative Reasoning</h3>
              <p className="text-gray-500 text-sm mb-3">2 sections, 27 questions, 47 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Arithmetic &amp; Algebra</li>
                <li>• Geometry &amp; Data Analysis</li>
                <li>• Quantitative Comparison</li>
                <li>• Scored 130&ndash;170</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">How the Sections Split</h3>
              <p className="text-gray-500 text-sm">
                Verbal runs as a 12-question section in 18 minutes followed by a 15-question section in 23 minutes.
                Quantitative runs 12 questions in 21 minutes, then 15 questions in 26 minutes. Both measures are
                section-level adaptive.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Test format and scoring per ETS. Confirm current details at ets.org before you register.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Take On the GRE?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Start with a free consultation. We will look at your target programs, your test date, and which section
            will move your application furthest.
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
