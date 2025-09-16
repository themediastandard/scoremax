import { Metadata } from 'next';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="pt-[130px] pb-20 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gray-200 rounded-full opacity-40 blur-sm"></div>
          <div className="absolute bottom-40 right-60 w-24 h-24 bg-gray-300 rounded-full opacity-50 blur-sm"></div>
          <div className="absolute bottom-80 left-40 w-48 h-48 bg-gray-200 rounded-full opacity-30 blur-sm"></div>
          <div className="absolute top-60 left-20 w-32 h-32 bg-gray-300 rounded-full opacity-45 blur-sm"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-8">

            </div>
            
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tight text-black mb-8">
              Get In <span className="text-[#c79d3c]">Touch</span>
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-700 leading-relaxed max-w-5xl mx-auto font-medium mb-12">
              Ready to start your academic journey? Let&apos;s discuss how we can help you achieve your goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/60 shadow-lg">
                <div className="w-10 h-10 bg-[#c79d3c] rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-800">Free Consultation</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/60 shadow-lg">
                <div className="w-10 h-10 bg-[#c79d3c] rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-800">Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              Tell Us About <span className="text-[#c79d3c]">Yourself</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Help us understand your academic background and goals so we can create the perfect learning plan for you.
            </p>
          </div>
          
          <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm">
            <form className="space-y-8">
              {/* Student Name & School */}
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  Student Name & Current School
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter student name and school"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Current Courses */}
              <div>
                <label htmlFor="currentCourses" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  Current Math & English Course
                </label>
                <input
                  type="text"
                  id="currentCourses"
                  name="currentCourses"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter current math and English courses"
                />
              </div>

              {/* PSAT Scores */}
              <div>
                <label htmlFor="psatScores" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  Past PSAT Scores
                </label>
                <input
                  type="text"
                  id="psatScores"
                  name="psatScores"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter PSAT scores"
                />
              </div>

              {/* SAT Scores */}
              <div>
                <label htmlFor="satScores" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  Past SAT Scores
                </label>
                <input
                  type="text"
                  id="satScores"
                  name="satScores"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter SAT scores"
                />
              </div>

              {/* ACT Scores */}
              <div>
                <label htmlFor="actScores" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  Past ACT Scores
                </label>
                <input
                  type="text"
                  id="actScores"
                  name="actScores"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter ACT scores"
                />
              </div>

              {/* Strengths */}
              <div>
                <label htmlFor="strengths" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  What do you believe are your strengths?
                </label>
                <textarea
                  id="strengths"
                  name="strengths"
                  rows={4}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium resize-none"
                  placeholder="Describe your academic strengths"
                />
              </div>

              {/* Weaknesses */}
              <div>
                <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  What do you believe your weaknesses are?
                </label>
                <textarea
                  id="weaknesses"
                  name="weaknesses"
                  rows={4}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium resize-none"
                  placeholder="Describe areas where you need improvement"
                />
              </div>

              {/* Help Needed */}
              <div>
                <label htmlFor="helpNeeded" className="block text-sm font-medium text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#c79d3c] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  What do you believe you need the most help in?
                </label>
                <textarea
                  id="helpNeeded"
                  name="helpNeeded"
                  rows={4}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-gray-200 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 placeholder-gray-500 text-gray-800 font-medium resize-none"
                  placeholder="Describe the areas where you need the most assistance"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  className="w-full bg-[#c79d3c] text-white px-12 py-6 rounded-none font-medium text-lg hover:brightness-95 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Submit
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
