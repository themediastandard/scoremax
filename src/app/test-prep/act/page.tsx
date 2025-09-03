import Link from 'next/link';
import Image from 'next/image';
import Header from '../../../components/Header';

export default function ACTPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-white to-gray-50">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-80 w-32 h-32 bg-red-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-40 right-60 w-20 h-20 bg-yellow-200 rounded-full opacity-40"></div>
          <div className="absolute bottom-80 left-40 w-40 h-40 bg-green-200 rounded-full opacity-25"></div>
          <div className="absolute top-60 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-35"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-10">
              <div className="inline-block">
                <div className="bg-gradient-to-r from-blue-100 to-red-100 px-4 py-2 rounded-full">
                  <div className="text-sm font-bold text-blue-800 tracking-wide uppercase flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Expert ACT Tutoring
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-black">
                Welcome to
                <br />
                <span className="text-blue-600">SCOREMAX</span>
                <br />
                <span className="text-4xl lg:text-5xl xl:text-6xl">Your Expert ACT</span>
                <br />
                <span className="text-4xl lg:text-5xl xl:text-6xl">Tutoring Solution!</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                At ScoreMax, we understand the significance of achieving exceptional scores on the ACT for college admissions. 
                That&apos;s why we&apos;re here to provide you with unparalleled ACT tutoring services that will empower you to 
                <span className="text-blue-600 font-semibold"> maximize your potential</span> and 
                <span className="text-red-600 font-semibold"> conquer the test</span>.
              </p>
              
              <div className="flex flex-col lg:flex-row gap-4 pt-4">
                <Link href="/contact"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-3 rounded-full font-semibold text-sm hover:from-yellow-500 hover:to-orange-500 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center">
                  Book Free Consultation
                </Link>
                <button className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group whitespace-nowrap">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z"/>
                    </svg>
                  </div>
                  <span className="text-base font-semibold text-gray-800">See How It Works</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - ACT Logo and Visual */}
            <div className="relative">
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">
                {/* ACT Logo Placeholder */}
                <div className="text-center mb-8">
                  <div className="text-8xl font-black text-blue-600 mb-4 relative">
                    ACT
                    <div className="absolute -top-2 -right-2 w-16 h-4 bg-red-500 rounded-full transform rotate-12"></div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">American College Testing</div>
                </div>
                
                {/* Score Improvement Visual */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-2xl">
                    <div className="text-3xl font-black text-blue-600 mb-2">25</div>
                    <div className="text-sm text-gray-600">Average Starting Score</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-2xl">
                    <div className="text-3xl font-black text-green-600 mb-2">32</div>
                    <div className="text-sm text-gray-600">Average Final Score</div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <div className="text-2xl font-bold text-gray-800">+7 Point Average Improvement</div>
                  <div className="text-sm text-gray-600 mt-1">With ScoreMax ACT Tutoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-red-200 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-red-100 px-6 py-3 rounded-full mb-8">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">
                Why Choose ScoreMax
              </div>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-black mb-6 leading-tight">
              Your Path to <span className="text-blue-600">ACT Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide everything you need to maximize your ACT score and achieve your college admission goals
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Benefit 1 - Seasoned Tutors */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Seasoned Tutors</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team consists of experienced ACT experts who have helped hundreds of students achieve their target scores. 
                Each tutor is carefully selected for their expertise and teaching ability.
              </p>
            </div>

            {/* Benefit 2 - Personalized Approach */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                We customize our tutoring sessions to meet your individual learning needs and goals. 
                No two students are the same, and neither are our teaching methods.
              </p>
            </div>

            {/* Benefit 3 - Comprehensive Curriculum */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Curriculum</h3>
              <p className="text-gray-600 leading-relaxed">
                Our meticulously designed curriculum covers all ACT subject areas including English, Math, Reading, and Science. 
                We provide study materials, practice tests, and proven strategies.
              </p>
            </div>

            {/* Benefit 4 - Proven Strategies */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-red-200">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Strategies</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn effective test-taking strategies and tactics that have helped thousands of students improve their scores. 
                Our methods are time-tested and results-driven.
              </p>
            </div>

            {/* Benefit 5 - Ongoing Support */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-yellow-200">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ongoing Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive continuous support and guidance throughout your ACT preparation journey. 
                We&apos;re here to help you stay motivated and on track to achieve your goals.
              </p>
            </div>

            {/* Benefit 6 - Score Guarantee */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-indigo-200">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Score Improvement Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re so confident in our methods that we guarantee score improvement. 
                Join the thousands of students who have achieved their target scores with ScoreMax.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-8">Proven Results</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black mb-2">+7</div>
                <div className="text-lg opacity-90">Average Score Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">95%</div>
                <div className="text-lg opacity-90">Students See Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">500+</div>
                <div className="text-lg opacity-90">ACT Students Helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT Test Sections */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              Master All <span className="text-blue-600">ACT Sections</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach covers every aspect of the ACT to ensure you&apos;re fully prepared for test day
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* English Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">English</h3>
              <p className="text-gray-600 mb-4">75 questions, 45 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Grammar & Usage</li>
                <li>• Sentence Structure</li>
                <li>• Rhetorical Skills</li>
                <li>• Writing Strategy</li>
              </ul>
            </div>

            {/* Math Section */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Math</h3>
              <p className="text-gray-600 mb-4">60 questions, 60 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Pre-Algebra</li>
                <li>• Elementary Algebra</li>
                <li>• Intermediate Algebra</li>
                <li>• Coordinate Geometry</li>
                <li>• Plane Geometry</li>
                <li>• Trigonometry</li>
              </ul>
            </div>

            {/* Reading Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reading</h3>
              <p className="text-gray-600 mb-4">40 questions, 35 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Prose Fiction</li>
                <li>• Social Studies</li>
                <li>• Humanities</li>
                <li>• Natural Sciences</li>
              </ul>
            </div>

            {/* Science Section */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Science</h3>
              <p className="text-gray-600 mb-4">40 questions, 35 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Data Representation</li>
                <li>• Research Summaries</li>
                <li>• Conflicting Viewpoints</li>
                <li>• Scientific Reasoning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-red-600 text-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-40 w-16 h-16 bg-pink-400 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Ace Your ACT?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of students who have achieved their target ACT scores with ScoreMax. 
            Your path to college success starts here.
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
              <span>Personalized study plans</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Expert ACT tutors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Proven strategies</span>
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
              <a href="#" className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl">
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
