import Link from 'next/link';
import { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { heroImages } from '@/lib/hero-images';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList, tutoringService } from '@/lib/structured-data';

// The hero intro, verbatim — see the SAT page for why schema restates visible copy.
const INTRO =
  'The LSAT rewards a small set of reasoning skills practiced deliberately. Our tutors work through real argument structures and dense passages with you one-on-one, building both the accuracy and the pacing that a competitive law school score demands.';

export const metadata: Metadata = {
  title: 'LSAT Tutoring Services | Expert LSAT Test Prep | ScoreMax',
  description: 'One-on-one online LSAT tutoring with expert tutors. Master Logical Reasoning and Reading Comprehension on the current LSAT format, build timing strategy, and raise your 120-180 score. Book your free consultation.',
  keywords: 'LSAT tutoring, LSAT test prep, LSAT preparation, LSAT scores, logical reasoning, reading comprehension, law school admission test, LSAT tutoring services',
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
    url: 'https://www.scoremaxtutoring.com/test-prep/lsat',
    siteName: 'ScoreMax',
    title: 'LSAT Tutoring Services | Expert LSAT Test Prep | ScoreMax',
    description: 'One-on-one online LSAT tutoring with expert tutors. Master Logical Reasoning and Reading Comprehension, build timing strategy, and raise your score.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'LSAT Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LSAT Tutoring Services | Expert LSAT Test Prep',
    description: 'One-on-one online LSAT tutoring with expert tutors. Master Logical Reasoning and Reading Comprehension and raise your score.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/test-prep/lsat',
  },
};

export default function LSATPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <JsonLd
        data={[
          tutoringService({
            path: '/test-prep/lsat',
            name: 'LSAT Tutoring',
            serviceType: 'Online 1:1 LSAT preparation tutoring',
            description: INTRO,
            audienceType: 'Law school applicants',
          }),
          breadcrumbList([
            { name: 'Home', path: '/' },
            { name: 'LSAT Tutoring', path: '/test-prep/lsat' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Test Prep"
        title="Expert LSAT Tutoring"
        intro={INTRO}
        image={heroImages.lsat}
        imageAlt="A law library reading room lined with bound case reporters, with an open casebook and legal pad on a study table."
      />

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Your Path to a Competitive LSAT Score
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Law school admissions weigh the LSAT heavily. We prepare you for the test as it is written today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Current Test Format</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Analytical Reasoning &mdash; the old logic games &mdash; was retired after June 2024. We teach the test you will
                actually sit: two scored Logical Reasoning sections and one Reading Comprehension section.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Argument Structure First</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Logical Reasoning is now two-thirds of your scored sections. We drill assumption, flaw, strengthen
                and weaken families until you recognise the structure before you finish reading the stimulus.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Timed From Day One</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every section is 35 minutes. We build a per-question pacing plan and practise the triage decisions
                that keep a hard question from costing you three easy ones.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Review That Compounds</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Score gains on the LSAT come from reviewing misses properly, not from volume. Your tutor works
                through your wrong answers with you and tracks which question types keep recurring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Writing Sample Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                LSAT Argumentative Writing is unscored, but your score will not be released without a completed
                sample on file. We prepare you for the prewriting stage and the 35-minute essay.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Built Around Your Deadline</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Most students work with us for six to twelve one-hour sessions, scheduled back from their test date
                and application deadlines. Sessions are one-on-one and held online over live video.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LSAT Test Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Structure</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              What the LSAT Looks Like Now
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Four 35-minute multiple-choice sections. Three are scored; one unscored variable section is used to
              validate future questions, and you will not be told which one it is.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Logical Reasoning</h3>
              <p className="text-gray-500 text-sm mb-3">Two scored sections, 35 minutes each</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Assumption &amp; Flaw</li>
                <li>• Strengthen &amp; Weaken</li>
                <li>• Inference &amp; Must Be True</li>
                <li>• Parallel Reasoning</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Reading Comprehension</h3>
              <p className="text-gray-500 text-sm mb-3">One scored section, 35 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Dense Academic Passages</li>
                <li>• Comparative Reading Pair</li>
                <li>• Author Attitude &amp; Tone</li>
                <li>• Structure &amp; Main Point</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Variable Section</h3>
              <p className="text-gray-500 text-sm mb-3">One unscored section, 35 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Logical Reasoning or Reading</li>
                <li>• Not Identified During the Test</li>
                <li>• Does Not Affect Your Score</li>
                <li>• Treat Every Section as Real</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Scoring</h3>
              <p className="text-gray-500 text-sm">
                Scored on a 120&ndash;180 scale from your three scored sections. Total testing time is 140 minutes,
                with a 10-minute intermission between the second and third sections.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Argumentative Writing</h3>
              <p className="text-gray-500 text-sm">
                A separate, unscored, remotely proctored essay: up to 15 minutes of prewriting analysis, then 35
                minutes to write. Required before your score is released.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Test format and scoring per the Law School Admission Council. Confirm current details at lsac.org before
            you register.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Take On the LSAT?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Start with a free consultation. We will look at your target schools, your test date, and where your
            practice scores sit today.
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
