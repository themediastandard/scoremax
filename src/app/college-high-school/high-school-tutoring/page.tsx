import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High School Tutoring Services | Math, Science & Test Prep | ScoreMax',
  description: 'Expert high school tutoring services in mathematics, science, and test preparation. Personalized learning plans, flexible scheduling, and proven academic success.',
  keywords: 'high school tutoring, math tutoring, science tutoring, high school math, high school science, academic tutoring, grade improvement',
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
    url: 'https://scoremax.com/college-high-school/high-school-tutoring',
    siteName: 'ScoreMax',
    title: 'High School Tutoring Services | Math, Science & Test Prep',
    description: 'Expert high school tutoring services in mathematics, science, and test preparation. Personalized learning plans and proven academic success.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'High School Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'High School Tutoring Services',
    description: 'Expert high school tutoring in math, science, and test preparation.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/college-high-school/high-school-tutoring',
  },
};

export default function HighSchoolTutoringPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">High School</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Expert High School Tutoring
          </h1>
          <div className="w-10 h-[2px] bg-[#c79d3c] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            We are your partner in academic excellence. Our high school tutoring helps students master challenging subjects, boost test scores, and excel. Whether it&apos;s math, science, or test prep, our expert tutors guide you every step of the way.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">
            Book Free Consultation
          </Link>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Our Services</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Comprehensive High School Support
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Tutoring services designed to help high school students excel in their academic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Mathematics</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                Algebra I & II, Geometry, Pre-Calculus, Calculus, Statistics, and competition math. We focus on understanding and problem-solving.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Algebra I & II</li>
                <li>• Geometry</li>
                <li>• Pre-Calculus & Calculus</li>
                <li>• Statistics</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Science</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                Chemistry, Physics, Biology, and Environmental Science. Our tutors make complex principles understandable.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Chemistry</li>
                <li>• Physics</li>
                <li>• Biology</li>
                <li>• Environmental Science</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Personalized Learning</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                A personalized approach tailored to each student&apos;s strengths, weaknesses, and learning style in a supportive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Expertise, Flexibility & Results
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
              We provide the expertise, flexibility, and personalized attention that high school students need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Expert Tutors</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our highly skilled professionals hold advanced degrees and have a proven track record of student success.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Flexible Schedule</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We offer flexible scheduling to fit your busy high school lifestyle with convenient times that work for you.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#c79d3c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Success-Driven</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our core mission is to empower students academically and guide them toward their goals.
                </p>
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
            Ready to Excel in High School?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join hundreds of high school students who have achieved academic success with ScoreMax.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">
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
