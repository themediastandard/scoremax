import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center pt-16">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-80 w-32 h-32 bg-purple-400 rounded-full opacity-30"></div>
          <div className="absolute bottom-40 right-60 w-20 h-20 bg-teal-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-80 left-40 w-40 h-40 bg-green-400 rounded-full opacity-25"></div>
          <div className="absolute top-60 left-20 w-24 h-24 bg-orange-400 rounded-full opacity-35"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-10">
              <div className="inline-block">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                  <div className="text-sm font-bold text-blue-800 tracking-wide uppercase flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    100% SATISFACTION GUARANTEE
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight font-heading text-black">
                Unlock Your
                <br />
                <span className="text-blue-600">Test Score</span> 
                <br />
                Potential
              </h1>
              
                              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                  Expert 1-on-1 tutoring for <span className="text-blue-600 font-semibold">SAT, ACT, GMAT, GRE</span> and academic subjects. 
                  Join <span className="text-purple-600 font-semibold">thousands of students</span> who&apos;ve boosted their scores with personalized learning.
                </p>
              
              <div className="flex flex-col lg:flex-row gap-6 pt-4">
                <Link href="/contact"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full font-semibold text-base hover:from-yellow-500 hover:to-orange-500 transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 whitespace-nowrap inline-flex items-center justify-center">
                  Book Free Consultation
                </Link>
                <button className="flex items-center space-x-4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full border border-white/60 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group whitespace-nowrap">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300 ring-2 ring-white/30">
                    <svg className="w-5 h-5 text-white ml-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z"/>
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">See How It Works</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - Image Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Top Left - Study Session */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl h-64 relative overflow-hidden group cursor-pointer">
                  <Image
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Student studying with books and notes"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-blue-600/30 group-hover:bg-blue-600/40 transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"></div>
                  {/* Play Button */}
                  <div className="absolute top-4 left-4">
                    <div className="border-2 border-white/80 text-white px-3 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm flex items-center space-x-1">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l7-5z"/>
                      </svg>
                      <span className="text-xs font-semibold">Watch</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="text-white font-black text-xl tracking-wide uppercase">
                      Study Session
                    </div>
                    <div className="text-white/80 text-sm font-medium mt-1">
                      Personalized Learning
                    </div>
                  </div>
                </div>
                
                {/* Top Right - Success */}
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl h-64 relative overflow-hidden group cursor-pointer">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Happy student celebrating test score success"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-green-600/30 group-hover:bg-green-600/40 transition-colors duration-300"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded-full shadow-lg"></div>
                  {/* Play Button */}
                  <div className="absolute top-4 left-4">
                    <div className="border-2 border-white/80 text-white px-3 py-2 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm flex items-center space-x-1">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l7-5z"/>
                      </svg>
                      <span className="text-xs font-semibold">Watch</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="text-white font-black text-xl tracking-wide uppercase">
                      Success!
                    </div>
                    <div className="text-white/80 text-sm font-medium mt-1">
                      Score Improvement
                    </div>
                  </div>
                </div>
                
                {/* Bottom Left - Online Learning */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl h-64 relative overflow-hidden group cursor-pointer">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Students collaborating with laptops for online learning"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-purple-600/30 group-hover:bg-purple-600/40 transition-colors duration-300"></div>
                  <div className="absolute top-4 left-4 w-4 h-4 bg-teal-400 rounded-full shadow-lg"></div>
                  {/* Play Button */}
                  <div className="absolute top-4 left-4">
                    <div className="border-2 border-white/80 text-white px-3 py-2 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm flex items-center space-x-1">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l7-5z"/>
                      </svg>
                      <span className="text-xs font-semibold">Watch</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="text-white font-black text-xl tracking-wide uppercase">
                      Online Learning
                    </div>
                    <div className="text-white/80 text-sm font-medium mt-1">
                      Virtual Sessions
                    </div>
                  </div>
                </div>
                
                {/* Bottom Right - Achievement */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl h-64 relative overflow-hidden group cursor-pointer">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Students celebrating graduation and academic achievement"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-orange-600/30 group-hover:bg-orange-600/40 transition-colors duration-300"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-400 rounded-full shadow-lg"></div>
                  {/* Play Button */}
                  <div className="absolute top-4 left-4">
                    <div className="border-2 border-white/80 text-white px-3 py-2 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm flex items-center space-x-1">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l7-5z"/>
                      </svg>
                      <span className="text-xs font-semibold">Watch</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="text-white font-black text-xl tracking-wide uppercase">
                      Achievement
                    </div>
                    <div className="text-white/80 text-sm font-medium mt-1">
                      Academic Excellence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-8 left-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-8 right-1/3 w-16 h-16 bg-purple-200 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* A+ BBB Rating */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">A+ BBB Rating</h4>
              <p className="text-gray-600 text-sm">Trusted by families nationwide</p>
            </div>

            {/* Step Up For Students */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Step Up Approved</h4>
              <p className="text-gray-600 text-sm">State scholarship accepted</p>
            </div>

            {/* 100% Satisfaction Guarantee */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">100% Guarantee</h4>
              <p className="text-gray-600 text-sm">Satisfaction promised</p>
            </div>

            {/* Certified Expert Tutors */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Expert Tutors</h4>
              <p className="text-gray-600 text-sm">Certified & experienced</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-40 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-32 right-32 w-32 h-32 bg-purple-200 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-6">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">
                How It Works
              </div>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-black mb-8 leading-tight">
              Getting Started is as
              <br />
              <span className="text-blue-600">Easy as 1-2-3</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of successful students in just three simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-16 lg:gap-20">
            {/* Step 1 */}
            <div className="text-center group relative">
              <div className="relative mb-12">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-blue-100">
                  <span className="text-4xl font-black text-white drop-shadow-lg">1</span>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"></div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">Schedule Free Consultation</h3>
              <p className="text-gray-600 text-xl leading-relaxed max-w-sm mx-auto">
                Tell us about your goals and learning needs. We&apos;ll assess your current level and create a personalized plan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group relative">
              <div className="relative mb-12">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-purple-100">
                  <span className="text-4xl font-black text-white drop-shadow-lg">2</span>
                </div>
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">Get Matched with Expert Tutor</h3>
              <p className="text-gray-600 text-xl leading-relaxed max-w-sm mx-auto">
                We&apos;ll pair you with a certified tutor who specializes in your subject and understands your learning style.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group relative">
              <div className="relative mb-12">
                <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-green-100">
                  <span className="text-4xl font-black text-white drop-shadow-lg">3</span>
                </div>
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-3 -left-3 w-9 h-9 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full shadow-lg"></div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">Start Improving</h3>
              <p className="text-gray-600 text-xl leading-relaxed max-w-sm mx-auto">
                Begin your personalized tutoring sessions and watch your confidence and scores improve week by week.
              </p>
            </div>
          </div>

          <div className="text-center mt-20">
            <Link href="/contact"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Start Your Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Our Expert Tutors */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-200 rounded-full opacity-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">
                Meet Our Expert Tutors
              </div>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-black mb-8 leading-tight">
              Learn from the
              <br />
              <span className="text-blue-600">Best in the Field</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our certified tutors are passionate educators with proven track records of helping students achieve their academic goals
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Tutor 1 - Sarah Chen */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Sarah Chen - SAT/ACT Math Specialist"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-96 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 h-8">Sarah Chen</h3>
                <div className="text-blue-600 font-semibold mb-4 h-6">SAT/ACT Math Specialist</div>
                <p className="text-gray-600 text-base mb-6 leading-relaxed h-40 overflow-hidden">
                  Master&apos;s in Mathematics from MIT. Helped 200+ students improve their SAT math scores by an average of 150 points. 
                  Specializes in breaking down complex concepts into simple, understandable steps.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500 flex-wrap h-8 items-center mt-auto">
                  <span className="bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">8+ Years Experience</span>
                  <span className="bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">200+ Students</span>
                </div>
              </div>
            </div>

            {/* Tutor 2 - Marcus Johnson */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Marcus Johnson - English & Writing Expert"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-96 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 h-8">Marcus Johnson</h3>
                <div className="text-green-600 font-semibold mb-4 h-6">English & Writing Expert</div>
                <p className="text-gray-600 text-base mb-6 leading-relaxed h-40 overflow-hidden">
                  PhD in English Literature from Harvard. Former college admissions counselor with expertise in essay writing and reading comprehension. 
                  Known for his engaging teaching style and ability to boost student confidence.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500 flex-wrap h-8 items-center mt-auto">
                  <span className="bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">12+ Years Experience</span>
                  <span className="bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">Harvard PhD</span>
                </div>
              </div>
            </div>

            {/* Tutor 3 - Dr. Emily Rodriguez */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Dr. Emily Rodriguez - Science & STEM Specialist"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-96 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 h-8">Dr. Emily Rodriguez</h3>
                <div className="text-purple-600 font-semibold mb-4 h-6">Science & STEM Specialist</div>
                <p className="text-gray-600 text-base mb-6 leading-relaxed h-40 overflow-hidden">
                  PhD in Chemistry from Stanford. Specializes in AP Chemistry, Physics, and Biology. 
                  Her students consistently achieve 4s and 5s on AP exams. Passionate about making science accessible and fun.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500 flex-wrap h-8 items-center mt-auto">
                  <span className="bg-purple-50 px-3 py-1 rounded-full whitespace-nowrap">10+ Years Experience</span>
                  <span className="bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap">AP Expert</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/tutors"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Meet All Our Tutors
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-40 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Enhanced Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-25 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">
                WHY CHOOSE US
              </div>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-black mb-8 leading-tight">
              Choose Your Path to <span className="text-blue-600">Success</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Whether you&apos;re preparing for standardized tests or need help with academic subjects, 
              we have expert tutors ready to help you succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Test Prep Card */}
            <div className="bg-white p-10 rounded-3xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden border border-gray-100 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-3xl">📚</div>
                </div>
                <h3 className="text-4xl font-black mb-6 text-black">Test Prep</h3>
                <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                  Prepare for SAT, ACT, GMAT, or GRE with proven strategies and personalized study plans 
                  designed to maximize your score improvement.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Personalized study plans</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Practice tests and materials</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Test-taking strategies</span>
                  </div>
                </div>
                
                <Link href="/services" 
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Academic Help Card */}
            <div className="bg-white p-10 rounded-3xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden border border-gray-100 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full opacity-40 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-3xl">🎓</div>
                </div>
                <h3 className="text-4xl font-black mb-6 text-black">Academic Help</h3>
                <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                  Get expert help with AP classes, Calculus, Physics, Chemistry, Algebra, Geometry, 
                  and Statistics from certified tutors.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Subject matter experts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Homework assistance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Concept reinforcement</span>
                  </div>
                </div>
                
                <Link href="/services" 
                  className="inline-block bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Section */}
      <section className="py-40 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-40 right-32 w-20 h-20 bg-pink-200 rounded-full opacity-15"></div>
          <div className="absolute top-3/4 right-1/4 w-16 h-16 bg-teal-200 rounded-full opacity-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">
                Experience the Magic of Learning
              </div>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-black mb-8 leading-tight">
              Real Results from
              <br />
              <span className="text-green-600">Real Students</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of students who have achieved their academic goals with ScoreMax Tutoring
            </p>
          </div>

          {/* Success Stories Grid */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
            {/* Story 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-24 h-24 rounded-full mb-8 mx-auto overflow-hidden ring-4 ring-blue-100">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Sarah M. - SAT Success Student"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  +280 SAT Points
                </div>
                <h4 className="font-bold text-2xl mb-4 text-gray-900">SAT Score Boost</h4>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  &quot;Improved my SAT score by 280 points in just 3 months! The personalized approach made all the difference.&quot;
                </p>
                <div className="text-blue-600 font-bold text-lg">- Sarah M.</div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-24 h-24 rounded-full mb-8 mx-auto overflow-hidden ring-4 ring-green-100">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Marcus T. - GPA Improvement Student"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  2.8 → 3.7 GPA
                </div>
                <h4 className="font-bold text-2xl mb-4 text-gray-900">GPA Improvement</h4>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  &quot;Went from a 2.8 to 3.7 GPA in my AP Calculus class. My tutor helped me understand concepts I&apos;d struggled with for months.&quot;
                </p>
                <div className="text-green-600 font-bold text-lg">- Marcus T.</div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-24 h-24 rounded-full mb-8 mx-auto overflow-hidden ring-4 ring-purple-100">
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Emma L. - College Acceptance Student"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  Dream School Accepted ✓
                </div>
                <h4 className="font-bold text-2xl mb-4 text-gray-900">College Acceptance</h4>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  &quot;Got into my dream school thanks to my improved ACT score! ScoreMax gave me the confidence I needed.&quot;
                </p>
                <div className="text-purple-600 font-bold text-lg">- Emma L.</div>
              </div>
            </div>

            {/* Story 4 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-24 h-24 rounded-full mb-8 mx-auto overflow-hidden ring-4 ring-orange-100">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="David K. - Chemistry Confidence Student"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  Chemistry Mastered 🧪
                </div>
                <h4 className="font-bold text-2xl mb-4 text-gray-900">Confidence Boost</h4>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  &quot;Finally understand chemistry! My tutor is amazing and made complex topics feel simple.&quot;
                </p>
                <div className="text-orange-600 font-bold text-lg">- David K.</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-blue-600 mb-4">95%</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Students see score improvement</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-green-600 mb-4">250+</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Average SAT point increase</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-purple-600 mb-4">1000+</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Successful students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-40 w-16 h-16 bg-pink-400 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Unlock Your Potential?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of successful students who have achieved their academic goals with ScoreMax Tutoring. 
            Your success story starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/contact" 
              className="bg-yellow-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500 transition shadow-lg">
              Book Free Consultation
            </Link>
            <Link href="/pricing" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              View Pricing
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Free consultation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>No commitment required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Step Up For Students accepted</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>A+ BBB Rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
