import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Step Up For Students Partnership | ScoreMax Tutoring',
  description: 'ScoreMax partners with Step Up For Students to provide quality tutoring services. Learn about our partnership and how we support student success through educational scholarships.',
  keywords: 'Step Up For Students, educational scholarships, tutoring partnership, student success, educational funding, tutoring scholarships',
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
    url: 'https://scoremax.com/step-up-for-students',
    siteName: 'ScoreMax',
    title: 'Step Up For Students Partnership | ScoreMax Tutoring',
    description: 'ScoreMax partners with Step Up For Students to provide quality tutoring services and support student success.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Step Up For Students Partnership - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Step Up For Students Partnership',
    description: 'ScoreMax partners with Step Up For Students to support student success.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/step-up-for-students',
  },
};

export default function StepUpForStudentsPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Image 
              src="/step-up.avif" 
              alt="Step Up For Students Logo" 
              width={200}
              height={128}
              className="w-40 mx-auto"
            />
          </div>
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Florida Scholarship</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Step Up For Students
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Step Up For Students supports families through scholarships for tuition, transportation, and educational resources. As a provider, ScoreMax delivers expert tutoring at no cost to scholarship recipients.
          </p>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Partnership</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Two Organizations, One Mission
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              ScoreMax Tutoring and Step Up For Students work together to provide expert tutoring services at no cost to scholarship recipients.
            </p>
          </div>

          {/* Partnership Visual */}
          <div className="max-w-4xl mx-auto">
            {/* Top Row - Both Logos */}
            <div className="flex justify-center items-center gap-16 mb-12">
              <div className="text-center">
                <Image 
                  src="/Images/score-max-logo-black.png" 
                  alt="ScoreMax Tutoring Logo" 
                  width={280}
                  height={180}
                  className="w-56 lg:w-64 mx-auto"
                />
              </div>
              
              {/* Partnership Arrow */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#b08a30] rounded-circle flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <Image 
                  src="/step-up.avif" 
                  alt="Step Up For Students Logo" 
                  width={240}
                  height={240}
                  className="w-48 mx-auto"
                />
              </div>
            </div>

            {/* Bottom Row - Partnership Result */}
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900">Partnership Success</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  <span className="font-semibold text-[#b08a30]">Free expert tutoring</span> for Step Up scholarship recipients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">How to Get Started</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Use Your Step Up Scholarship
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Follow these simple steps to use your Step Up scholarship with ScoreMax Tutoring.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b08a30] text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Get Started</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Log in or apply for your student&apos;s scholarship here.
                  </p>
                  <Link href="https://www.stepupforstudents.org" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center text-[#b08a30] font-semibold hover:text-[#9a7628] transition-colors text-sm">
                    Visit Step Up For Students
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b08a30] text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Find us on the Education Market Assistant</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Search for ScoreMax Tutoring using these details:
                  </p>
                  <div className="bg-gray-50 p-4">
                    <div className="space-y-2 text-sm text-gray-500">
                      <div><span className="font-semibold text-gray-900">Provider Name:</span> Avi Spiller</div>
                      <div><span className="font-semibold text-gray-900">Location Name:</span> Scoremax Tutoring</div>
                      <div><span className="font-semibold text-gray-900">Catalog Item #:</span> 20019985</div>
                      <div><span className="font-semibold text-gray-900">Service Category:</span> Part Time Tutoring Services K-12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b08a30] text-sm font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Choose ScoreMax as your provider</h3>
                  <p className="text-gray-500 text-sm">
                    Once you&apos;ve chosen ScoreMax Tutoring as your provider, let us know by filling out the form below to schedule your sessions at no cost.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b08a30] text-sm font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Complete Your Registration</h3>
                  <p className="text-gray-500 text-sm">Fill out the form below to get started with your Step Up scholarship tutoring sessions.</p>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Email Address <span className="text-[#b08a30]">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors"
                  >
                    Start Your Tutoring Journey
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join thousands of students who have achieved their academic goals with ScoreMax through the Step Up For Students program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer now global in layout */}
    </div>
  );
}
