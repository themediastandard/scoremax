import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';

export default function StepUpForStudentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-white to-gray-50">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-80 w-32 h-32 bg-blue-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-40 right-60 w-20 h-20 bg-green-200 rounded-full opacity-40"></div>
          <div className="absolute bottom-80 left-40 w-40 h-40 bg-purple-200 rounded-full opacity-25"></div>
          <div className="absolute top-60 left-20 w-24 h-24 bg-orange-200 rounded-full opacity-35"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <Image 
                src="/step-up.avif" 
                alt="Step Up For Students Logo" 
                width={200}
                height={128}
                className="w-48 mx-auto"
              />
            </div>
            
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-black mt-2 mb-6">
              Scholarship Program
            </h1>
            
            <p className="text-xl lg:text-2xl text-black leading-relaxed max-w-4xl mx-auto font-medium mb-10">
              Step Up For Students supports students and families in building a stronger future through an education that fits their needs. 
              Their scholarships open doors with 
              <span className="text-red-700 font-semibold"> tuition, transportation</span>, and 
              <span className="text-gray-700 font-semibold"> educational resources</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#steps"
                className="bg-red-700 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-red-800 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center">
                Get Started
              </Link>
              <button className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group whitespace-nowrap">
                <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l7-5z"/>
                  </svg>
                </div>
                <span className="text-base font-semibold text-gray-800">Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              Two Organizations, <span className="text-red-700">One Mission</span>
            </h2>
            <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
              ScoreMax Tutoring and Step Up For Students are now working together to provide 
              expert tutoring services at no cost to scholarship recipients.
            </p>
          </div>

          {/* Partnership Visual */}
          <div className="max-w-4xl mx-auto">
            {/* Top Row - Both Logos */}
            <div className="flex justify-center items-center gap-16 mb-12">
              <div className="text-center">
                <Image 
                  src="/logo.avif" 
                  alt="ScoreMax Tutoring Logo" 
                  width={300}
                  height={300}
                  className="w-60 mx-auto"
                />
              </div>
              
              {/* Partnership Arrow */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center shadow-lg">
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
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black">Partnership Success</h3>
                </div>
                <p className="text-lg text-black leading-relaxed">
                  <span className="font-semibold text-red-700">Free expert tutoring</span> for Step Up scholarship recipients
                </p>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              How to Get Started with <span className="text-red-700">Step Up</span>
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              Follow these simple steps to use your Step Up scholarship with ScoreMax Tutoring
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-4">Get Started!</h3>
                  <p className="text-black mb-4">
                    Log in or apply for your student&apos;s scholarship here.
                  </p>
                  <Link href="https://www.stepupforstudents.org" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center text-red-700 font-semibold hover:text-red-800 transition-colors">
                    Visit Step Up For Students
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-4">Find us on the Education Market Assistant</h3>
                  <p className="text-black mb-4">
                    Search for ScoreMax Tutoring using these details:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="space-y-2 text-sm">
                      <div><span className="font-semibold text-black">Provider Name:</span> <span className="text-black">Avi Spiller</span></div>
                      <div><span className="font-semibold text-black">Location Name:</span> <span className="text-black">Scoremax Tutoring</span></div>
                      <div><span className="font-semibold text-black">Catalog Item #:</span> <span className="text-black">20019985</span></div>
                      <div><span className="font-semibold text-black">Service Category:</span> <span className="text-black">Part Time Tutoring Services K-12</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-4">Choose ScoreMax as your provider</h3>
                  <p className="text-black">
                    Once you&apos;ve chosen ScoreMax Tutoring as your provider, let us know by filling out the form below to schedule your sessions at no cost!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 - Contact Form */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-2">Complete Your Registration</h3>
                  <p className="text-gray-600">Fill out the form below to get started with your Step Up scholarship tutoring sessions.</p>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-gray-200 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-gray-200 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-gray-200 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-gray-200 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-red-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
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
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600 text-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-40 w-16 h-16 bg-pink-400 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have achieved their academic goals with ScoreMax Tutoring through the Step Up For Students program.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="#steps" 
              className="bg-[#517cad] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#4568a3] transition shadow-lg">
              Get Started Now
            </Link>
            <Link href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-red-700 transition">
              Contact Us
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>No cost to you</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Expert tutors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Step Up approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Proven results</span>
            </div>
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
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-3">
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
            </div>
            
            {/* Social Media */}
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-all duration-300 shadow-lg hover:shadow-xl">
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
