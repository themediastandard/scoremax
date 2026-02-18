import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'In-Person SAT & ACT Classes | ScoreMax Test Prep',
  description: 'Join our in-person SAT and ACT test prep classes. Small group sessions with expert instructors, comprehensive study materials, and proven strategies for test success.',
  keywords: 'in-person SAT classes, in-person ACT classes, test prep classes, SAT group tutoring, ACT group tutoring, classroom test prep',
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
    url: 'https://scoremax.com/test-prep/in-person-classes',
    siteName: 'ScoreMax',
    title: 'In-Person SAT & ACT Classes | ScoreMax Test Prep',
    description: 'Join our in-person SAT and ACT test prep classes. Small group sessions with expert instructors and proven strategies.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'In-Person Test Prep Classes - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'In-Person SAT & ACT Classes',
    description: 'Join our in-person SAT and ACT test prep classes with expert instructors.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/test-prep/in-person-classes',
  },
};

export default function InPersonClassesPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">In Person</div>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
                SAT & ACT In-Person Classes
              </h1>
              <div className="w-10 h-[2px] bg-[#c79d3c] mb-5" />
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-8">
                Join our comprehensive in-person course designed to maximize your test scores. Learn from expert instructors in a structured classroom with proven strategies and hands-on practice.
              </p>
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">
                Enroll Now
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-1">In-Person Course</div>
                  <div className="text-sm text-gray-500">2 hours per session</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-100">
                    <div className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#c79d3c] mb-1">2</div>
                    <div className="text-xs text-gray-500">Days per Week</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-100">
                    <div className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#c79d3c] mb-1">5</div>
                    <div className="text-xs text-gray-500">Weeks Total</div>
                  </div>
                </div>
                <div className="text-center mt-4 text-sm text-gray-500">Expert instruction and practice tests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose In-Person Classes Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Your Path to Test Success
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Experience the benefits of face-to-face learning with expert instructors and a structured classroom environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Expert Instruction</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learn from certified SAT/ACT experts with years of experience helping students achieve their target scores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Structured Learning</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Follow a comprehensive curriculum designed to cover all test sections systematically and effectively.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Hands-on Practice</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Practice with real test questions and receive immediate feedback from instructors in a supportive environment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Peer Learning</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learn alongside motivated peers in small class sizes, fostering collaboration and healthy competition.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Immediate Feedback</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get instant clarification on difficult concepts and personalized guidance to address your specific weaknesses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Join hundreds of students who have achieved significant score improvements through our in-person program.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 rounded-2xl bg-gray-100 border border-gray-100 p-10">
            <div className="text-center mb-8">
              <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-2">Proven Results</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">Our Track Record</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#c79d3c] mb-1">+200</div>
                <div className="text-sm text-gray-500">Average Score Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#c79d3c] mb-1">95%</div>
                <div className="text-sm text-gray-500">Students See Improvement</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#c79d3c] mb-1">300+</div>
                <div className="text-sm text-gray-500">Students Enrolled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Schedule Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Course Details</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Schedule & Curriculum
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our structured in-person program is designed to maximize your learning and test performance.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-6">Course Schedule</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>2 days per week</p>
                <p>5 weeks total</p>
                <p>2-hour sessions</p>
              </div>
              <h4 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-4">What You&apos;ll Get</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="text-[#c79d3c]">✓</span> Expert instruction from certified tutors</li>
                <li className="flex items-center gap-2"><span className="text-[#c79d3c]">✓</span> Comprehensive study materials</li>
                <li className="flex items-center gap-2"><span className="text-[#c79d3c]">✓</span> Practice tests and assessments</li>
                <li className="flex items-center gap-2"><span className="text-[#c79d3c]">✓</span> Small class sizes for individual attention</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-6">Curriculum</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Reading & Comprehension</h4>
                  <p className="text-sm text-gray-500">Strategies for critical analysis and comprehension.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Writing & Language</h4>
                  <p className="text-sm text-gray-500">Grammar rules and writing section strategies.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Math Mastery</h4>
                  <p className="text-sm text-gray-500">Formulas and problem-solving techniques.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Test Strategies</h4>
                  <p className="text-sm text-gray-500">Step-by-step approaches for tough questions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Join Our In-Person Course?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Take the first step toward your dream score. Limited spots available for our next session.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">
              Enroll Now
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
