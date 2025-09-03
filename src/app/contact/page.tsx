import Header from '@/components/Header';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
              Get In <span className="text-[#517cad]">Touch</span>
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-700 leading-relaxed max-w-5xl mx-auto font-medium mb-12">
              Ready to start your academic journey? Let&apos;s discuss how we can help you achieve your goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/60 shadow-lg">
                <div className="w-10 h-10 bg-[#517cad] rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-800">Free Consultation</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/60 shadow-lg">
                <div className="w-10 h-10 bg-[#517cad] rounded-full flex items-center justify-center shadow-md">
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
              Tell Us About <span className="text-[#517cad]">Yourself</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Help us understand your academic background and goals so we can create the perfect learning plan for you.
            </p>
          </div>
          
          <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm">
            <form className="space-y-8">
              {/* Student Name & School */}
              <div>
                <label htmlFor="studentName" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="phone" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="currentCourses" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="psatScores" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="satScores" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="actScores" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="strengths" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="weaknesses" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                <label htmlFor="helpNeeded" className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
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
                  className="w-full bg-[#517cad] text-white px-12 py-6 rounded-2xl font-bold text-lg hover:bg-[#4568a3] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">🎓</span>
                </div>
                <span className="text-3xl font-black">SCOREMAX</span>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="mb-8">
              <div className="text-lg text-gray-300 mb-2">
                (954) 214-8880 | (954) 224-1511
              </div>
              <div className="text-gray-400">
                info@scoremaxtutoring.com
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            

          </div>
        </div>
      </footer>
    </div>
  );
}
