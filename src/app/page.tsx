import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">ScoreMax</div>
                <div className="text-xs text-gray-500 font-medium -mt-1">PREMIUM TUTORING</div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 font-semibold text-sm tracking-wide hover:text-blue-600 transition">HOME</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 font-semibold text-sm tracking-wide transition">ABOUT</Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 font-semibold text-sm tracking-wide transition">SERVICES</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 font-semibold text-sm tracking-wide transition">PRICING</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 font-semibold text-sm tracking-wide transition">CONTACT</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">A+ Rated</span>
              </div>
              <Link href="/contact" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden flex items-center px-3 py-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center pt-20">
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
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight">
                Unlock Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Test Score</span> 
                <br />
                Potential
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                Expert 1-on-1 tutoring for <span className="text-blue-600 font-semibold">SAT, ACT, GMAT, GRE</span> and academic subjects. 
                Join <span className="text-purple-600 font-semibold">thousands of students</span> who've boosted their scores with personalized learning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link href="/contact"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-10 py-5 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200">
                  Get Free Consultation
                </Link>
                <button className="flex items-center space-x-4 text-gray-800 font-bold group">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-200">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z"/>
                    </svg>
                  </div>
                  <span className="text-lg">SEE HOW IT WORKS</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - Image Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Top Left - Study Session */}
                <div className="bg-blue-100 rounded-3xl p-8 h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full"></div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      📚
                    </div>
                    <div className="font-semibold text-gray-800">Study Session</div>
                  </div>
                </div>
                
                {/* Top Right - Success */}
                <div className="bg-green-100 rounded-3xl p-8 h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded-full"></div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      🎉
                    </div>
                    <div className="font-semibold text-gray-800">Success!</div>
                  </div>
                </div>
                
                {/* Bottom Left - Online Learning */}
                <div className="bg-purple-100 rounded-3xl p-8 h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 left-4 w-4 h-4 bg-teal-400 rounded-full"></div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      💻
                    </div>
                    <div className="font-semibold text-gray-800">Online Learning</div>
                  </div>
                </div>
                
                {/* Bottom Right - Achievement */}
                <div className="bg-orange-100 rounded-3xl p-8 h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-400 rounded-full"></div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      🏆
                    </div>
                    <div className="font-semibold text-gray-800">Achievement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-medium text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⭐</span>
              <span>A+ BBB Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Step Up For Students Accepted</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🛡️</span>
              <span>100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">🎓</span>
              <span>Certified Expert Tutors</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-300 rounded-full opacity-25"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-gray-600 tracking-wide uppercase mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Getting Started is as Easy as 1-2-3
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful students in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Schedule Free Consultation</h3>
              <p className="text-gray-600 text-lg">
                Tell us about your goals and learning needs. We'll assess your current level and create a personalized plan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-400 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Matched with Expert Tutor</h3>
              <p className="text-gray-600 text-lg">
                We'll pair you with a certified tutor who specializes in your subject and understands your learning style.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-400 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Start Improving</h3>
              <p className="text-gray-600 text-lg">
                Begin your personalized tutoring sessions and watch your confidence and scores improve week by week.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/contact"
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg">
              Start Your Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 right-10 w-40 h-40 bg-purple-300 rounded-full opacity-15"></div>
          <div className="absolute bottom-10 left-20 w-28 h-28 bg-yellow-300 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-gray-600 tracking-wide uppercase mb-4">
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Path to <span className="text-blue-600">Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're preparing for standardized tests or need help with academic subjects, 
              we have expert tutors ready to help you succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Test Prep Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-4 right-4 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-300 rounded-full opacity-60"></div>
              
              <div className="text-5xl mb-6">📚</div>
              <h3 className="text-3xl font-bold mb-4">Test Prep</h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Prepare for SAT, ACT, GMAT, or GRE with proven strategies and personalized study plans 
                designed to maximize your score improvement.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Personalized study plans</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Practice tests and materials</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Test-taking strategies</span>
                </div>
              </div>
              
              <Link href="/services" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition group-hover:scale-105">
                Learn More
              </Link>
            </div>

            {/* Academic Help Card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 bg-green-200 rounded-full opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-20 h-20 bg-teal-300 rounded-full opacity-40"></div>
              
              <div className="text-5xl mb-6">🎓</div>
              <h3 className="text-3xl font-bold mb-4">Academic Help</h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Get expert help with AP classes, Calculus, Physics, Chemistry, Algebra, Geometry, 
                and Statistics from certified tutors.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Subject matter experts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Homework assistance</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Concept reinforcement</span>
                </div>
              </div>
              
              <Link href="/services" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition group-hover:scale-105">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Section */}
      <section className="py-20 bg-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-36 h-36 bg-orange-300 rounded-full opacity-15"></div>
          <div className="absolute bottom-40 right-20 w-24 h-24 bg-pink-300 rounded-full opacity-20"></div>
          <div className="absolute top-60 right-40 w-16 h-16 bg-teal-300 rounded-full opacity-25"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-gray-600 tracking-wide uppercase mb-4">
              EXPERIENCE THE MAGIC OF LEARNING
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Real Results from Real Students
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who have achieved their academic goals with ScoreMax Tutoring
            </p>
          </div>

          {/* Success Stories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Story 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">SAT Score Boost</h4>
                <p className="text-gray-600 text-sm mb-3">
                  "Improved my SAT score by 280 points in just 3 months!"
                </p>
                <div className="text-blue-600 font-semibold">- Sarah M.</div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">GPA Improvement</h4>
                <p className="text-gray-600 text-sm mb-3">
                  "Went from a 2.8 to 3.7 GPA in my AP Calculus class."
                </p>
                <div className="text-green-600 font-semibold">- Marcus T.</div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">College Acceptance</h4>
                <p className="text-gray-600 text-sm mb-3">
                  "Got into my dream school thanks to my improved ACT score!"
                </p>
                <div className="text-purple-600 font-semibold">- Emma L.</div>
              </div>
            </div>

            {/* Story 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💡</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">Confidence Boost</h4>
                <p className="text-gray-600 text-sm mb-3">
                  "Finally understand chemistry! My tutor is amazing."
                </p>
                <div className="text-orange-600 font-semibold">- David K.</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Students see score improvement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">250+</div>
              <div className="text-gray-600">Average SAT point increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Successful students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
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
              Get Free Consultation
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
