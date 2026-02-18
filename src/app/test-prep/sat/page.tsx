import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SAT Tutoring Services | Expert SAT Test Prep | ScoreMax',
  description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation, proven strategies, and comprehensive study plans. Book your free consultation today.',
  keywords: 'SAT tutoring, SAT test prep, SAT preparation, SAT scores, SAT practice, SAT strategies, college entrance exam, SAT tutoring services',
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
    url: 'https://scoremax.com/test-prep/sat',
    siteName: 'ScoreMax',
    title: 'SAT Tutoring Services | Expert SAT Test Prep | ScoreMax',
    description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation, proven strategies, and comprehensive study plans.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'SAT Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAT Tutoring Services | Expert SAT Test Prep',
    description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/test-prep/sat',
  },
};

export default function SATPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Prep</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Expert SAT Tutoring
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            We understand the importance of achieving high SAT scores for college admissions. Our expert tutors provide personalized preparation to maximize your potential and help you reach your desired score.
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
              Your Path to SAT Success
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We provide everything you need to maximize your SAT score and achieve your college admission goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Experienced Tutors</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our team consists of highly qualified SAT experts with years of experience helping students achieve their target scores. 
                Each tutor is carefully selected for their expertise and proven track record.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Customized Approach</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We provide personalized tutoring sessions tailored to your individual needs and learning style. 
                Our approach adapts to your strengths and weaknesses for maximum effectiveness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Comprehensive Curriculum</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our curriculum covers all aspects of the SAT exam, including study materials, practice tests, and detailed explanations. 
                We ensure you&apos;re fully prepared for every section of the test.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Proven Strategies</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learn effective strategies and time-management techniques taught by our experienced tutors. 
                Our methods are time-tested and have helped thousands of students improve their scores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Continuous Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive ongoing support beyond your tutoring sessions. We&apos;re here to help you stay motivated, 
                track your progress, and provide guidance throughout your SAT preparation journey.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Score Improvement Track Record</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We&apos;re so confident in our methods that we guarantee score improvement. 
                Join the thousands of students who have achieved their target SAT scores with ScoreMax.
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
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">+280</div>
                <div className="text-sm text-gray-500">Average Score Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">95%</div>
                <div className="text-sm text-gray-500">Students See Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#b08a30] mb-1">800+</div>
                <div className="text-sm text-gray-500">SAT Students Helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAT Test Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Test Structure</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Master All SAT Sections
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our comprehensive approach covers every aspect of the SAT to ensure you&apos;re fully prepared for test day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Reading</h3>
              <p className="text-gray-500 text-sm mb-3">52 questions, 65 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Literature</li>
                <li>• History/Social Studies</li>
                <li>• Science</li>
                <li>• Paired Passages</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Writing & Language</h3>
              <p className="text-gray-500 text-sm mb-3">44 questions, 35 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Standard English Conventions</li>
                <li>• Expression of Ideas</li>
                <li>• Grammar & Usage</li>
                <li>• Sentence Structure</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Math</h3>
              <p className="text-gray-500 text-sm mb-3">58 questions, 80 minutes</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Heart of Algebra</li>
                <li>• Problem Solving & Data Analysis</li>
                <li>• Passport to Advanced Math</li>
                <li>• Additional Topics in Math</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Essay (Discontinued)</h3>
              <p className="text-gray-500 text-sm mb-3">College Board discontinued the SAT essay in 2021.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Ace Your SAT?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join hundreds of students who have achieved their target SAT scores with ScoreMax.
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

      {/* Footer */}
      {/* Footer removed; global in layout */}
    </div>
  );
}
