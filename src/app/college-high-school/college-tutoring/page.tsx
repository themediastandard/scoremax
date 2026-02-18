import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'College Tutoring Services | Advanced Math & Science | ScoreMax',
  description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students with flexible scheduling.',
  keywords: 'college tutoring, college math tutoring, college science tutoring, advanced math, calculus tutoring, college academic support, university tutoring',
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
    url: 'https://scoremax.com/college-high-school/college-tutoring',
    siteName: 'ScoreMax',
    title: 'College Tutoring Services | Advanced Math & Science',
    description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'College Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Tutoring Services',
    description: 'Expert college tutoring for advanced math, science, and academic subjects.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/college-high-school/college-tutoring',
  },
};

export default function CollegeTutoringPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">College</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Expert College Tutoring
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            We provide specialized college tutoring to help you master advanced subjects and achieve academic excellence. Whether you&apos;re tackling complex mathematics, sciences, or challenging coursework, our expert tutors are here to guide you.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            Book Free Consultation
          </Link>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Our Services</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Comprehensive College Support
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Tutoring services designed to help college students excel in advanced coursework.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Algebra & Calculus</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our expert tutors provide comprehensive support in advanced mathematics including College Algebra, 
                Pre-Calculus, Calculus I, II, and III, Differential Equations, Linear Algebra, and Statistics. 
                We focus on building deep understanding and problem-solving skills that will serve you throughout 
                your academic and professional career.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Physics & Chemistry</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Master the complexities of college-level Physics and Chemistry with our experienced tutors. 
                We break down complex scientific principles into understandable concepts, helping you apply 
                theoretical knowledge to practical problems. Our approach ensures you not only pass your courses 
                but develop a genuine appreciation for these fundamental sciences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">✓</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Personalized Learning</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every college student has unique learning needs and academic goals. Our personalized tutoring 
                approach is tailored to your individual strengths, weaknesses, and learning style. We provide 
                a supportive environment where you can ask questions, explore concepts deeply, and build 
                confidence in your academic abilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Expertise, Flexibility & Results
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
              We provide the expertise, flexibility, and personalized attention that college students need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Expert Tutors</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our highly skilled professionals hold advanced degrees and a proven track record of helping college students achieve academic success.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Flexible Schedule</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We offer flexible scheduling to fit your busy college lifestyle, with times that work around your classes and commitments.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Excel in College?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join hundreds of college students who have achieved academic success with ScoreMax.
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
