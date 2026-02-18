import { Metadata } from 'next';
import { User, Mail, Phone, BookOpen, FileText, Sparkles, Target, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact ScoreMax | Book Free Tutoring Consultation | Get Started Today',
  description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today. Get personalized tutoring plans and start improving your test scores.',
  keywords: 'contact ScoreMax, book tutoring consultation, free consultation, tutoring services, SAT tutoring, ACT tutoring, get started',
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
    url: 'https://scoremax.com/contact',
    siteName: 'ScoreMax',
    title: 'Contact ScoreMax | Book Free Tutoring Consultation',
    description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today and start improving your test scores.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Contact ScoreMax Tutoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact ScoreMax | Book Free Consultation',
    description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Contact
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Ready to start your academic journey? Let&apos;s discuss how we can help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Tell Us About Yourself</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
              We&apos;ll Create Your Perfect Plan
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
              Help us understand your academic background and goals so we can create the perfect learning plan for you.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
            <form className="space-y-8">
              {/* Student Name & School */}
              <div>
                <label htmlFor="studentName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Student Name & Current School
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter student name and school"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Current Courses */}
              <div>
                <label htmlFor="currentCourses" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Current Math & English Course
                </label>
                <input
                  type="text"
                  id="currentCourses"
                  name="currentCourses"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter current math and English courses"
                />
              </div>

              {/* PSAT Scores */}
              <div>
                <label htmlFor="psatScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Past PSAT Scores
                </label>
                <input
                  type="text"
                  id="psatScores"
                  name="psatScores"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter PSAT scores"
                />
              </div>

              {/* SAT Scores */}
              <div>
                <label htmlFor="satScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Past SAT Scores
                </label>
                <input
                  type="text"
                  id="satScores"
                  name="satScores"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter SAT scores"
                />
              </div>

              {/* ACT Scores */}
              <div>
                <label htmlFor="actScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  Past ACT Scores
                </label>
                <input
                  type="text"
                  id="actScores"
                  name="actScores"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
                  placeholder="Enter ACT scores"
                />
              </div>

              {/* Strengths */}
              <div>
                <label htmlFor="strengths" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  What do you believe are your strengths?
                </label>
                <textarea
                  id="strengths"
                  name="strengths"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
                  placeholder="Describe your academic strengths"
                />
              </div>

              {/* Weaknesses */}
              <div>
                <label htmlFor="weaknesses" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  What do you believe your weaknesses are?
                </label>
                <textarea
                  id="weaknesses"
                  name="weaknesses"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
                  placeholder="Describe areas where you need improvement"
                />
              </div>

              {/* Help Needed */}
              <div>
                <label htmlFor="helpNeeded" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-[#b08a30]" />
                  </div>
                  What do you believe you need the most help in?
                </label>
                <textarea
                  id="helpNeeded"
                  name="helpNeeded"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
                  placeholder="Describe the areas where you need the most assistance"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  className="w-full bg-[#b08a30] text-white px-8 py-4 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer now global in layout */}
    </div>
  );
}
