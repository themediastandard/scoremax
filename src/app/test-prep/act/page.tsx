import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACT Tutoring Services | Expert ACT Test Prep | ScoreMax',
  description: 'Professional ACT tutoring services with expert tutors. Improve your ACT scores with personalized test preparation, proven strategies, and comprehensive study plans. Book your free consultation today.',
  keywords: 'ACT tutoring, ACT test prep, ACT preparation, ACT scores, ACT practice, ACT strategies, college entrance exam, ACT tutoring services',
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
    url: 'https://scoremax.com/test-prep/act',
    siteName: 'ScoreMax',
    title: 'ACT Tutoring Services | Expert ACT Test Prep | ScoreMax',
    description: 'Professional ACT tutoring services with expert tutors. Improve your ACT scores with personalized test preparation, proven strategies, and comprehensive study plans.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'ACT Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACT Tutoring Services | Expert ACT Test Prep',
    description: 'Professional ACT tutoring services with expert tutors. Improve your ACT scores with personalized test preparation.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/test-prep/act',
  },
};

export default function ACTPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Prep</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Expert ACT Tutoring
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            We understand the significance of achieving exceptional ACT scores for college admissions. Our expert tutors provide personalized preparation to maximize your potential and help you conquer the test.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            Book Free Consultation
          </Link>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Your Path to ACT Success
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We provide everything you need to maximize your ACT score and achieve your college admission goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Seasoned Tutors</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our team consists of experienced ACT experts who have helped hundreds of students achieve their target scores. 
                Each tutor is carefully selected for their expertise and teaching ability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Personalized Approach</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We customize our tutoring sessions to meet your individual learning needs and goals. 
                No two students are the same, and neither are our teaching methods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Comprehensive Curriculum</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our meticulously designed curriculum covers all ACT subject areas including English, Math, Reading, and Science. 
                We provide study materials, practice tests, and proven strategies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Proven Strategies</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learn effective test-taking strategies and tactics that have helped thousands of students improve their scores. 
                Our methods are time-tested and results-driven.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Ongoing Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive continuous support and guidance throughout your ACT preparation journey. 
                We&apos;re here to help you stay motivated and on track to achieve your goals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Score Improvement Track Record</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We&apos;re so confident in our methods that we guarantee score improvement. 
                Join the thousands of students who have achieved their target scores with ScoreMax.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 rounded-2xl bg-gray-100 border border-gray-100 p-10">
            <div className="text-center mb-8">
              <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-2">Proven Results</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">Our Track Record</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">+7</div>
                <div className="text-sm text-gray-500">Average Composite Point Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">95%</div>
                <div className="text-sm text-gray-500">Students See Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">500+</div>
                <div className="text-sm text-gray-500">ACT Students Helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT Test Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Structure</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Master All ACT Sections
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our comprehensive approach covers every aspect of the ACT to ensure you&apos;re fully prepared for test day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">English</h3>
              <p className="text-gray-500 text-sm mb-3">75 questions, 45 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Grammar & Usage</li>
                <li>• Sentence Structure</li>
                <li>• Rhetorical Skills</li>
                <li>• Writing Strategy</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Math</h3>
              <p className="text-gray-500 text-sm mb-3">60 questions, 60 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Pre-Algebra</li>
                <li>• Elementary Algebra</li>
                <li>• Intermediate Algebra</li>
                <li>• Coordinate Geometry</li>
                <li>• Plane Geometry</li>
                <li>• Trigonometry</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Reading</h3>
              <p className="text-gray-500 text-sm mb-3">40 questions, 35 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Prose Fiction</li>
                <li>• Social Studies</li>
                <li>• Humanities</li>
                <li>• Natural Sciences</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Science</h3>
              <p className="text-gray-500 text-sm mb-3">40 questions, 35 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Data Representation</li>
                <li>• Research Summaries</li>
                <li>• Conflicting Viewpoints</li>
                <li>• Scientific Reasoning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Ace Your ACT?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join hundreds of students who have achieved their target ACT scores with ScoreMax.
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

      {/* Footer now global in layout */}
    </div>
  );
}
