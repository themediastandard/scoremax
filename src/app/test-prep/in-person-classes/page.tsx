import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'In-Person SAT & ACT Classes | ScoreMax Test Prep',
  description: 'Join our in-person SAT and ACT test prep classes. Small group sessions with expert instructors, comprehensive study materials, and proven strategies for test success.',
  keywords: 'in-person SAT classes, in-person ACT classes, test prep classes, SAT group tutoring, ACT group tutoring, classroom test prep',
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
    url: 'https://scoremax.com/test-prep/in-person-classes',
    siteName: 'ScoreMax',
    title: 'In-Person SAT & ACT Classes | ScoreMax Test Prep',
    description: 'Join our in-person SAT and ACT test prep classes. Small group sessions with expert instructors and proven strategies.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'In-Person Test Prep Classes - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'In-Person SAT & ACT Classes',
    description: 'Join our in-person SAT and ACT test prep classes with expert instructors.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/test-prep/in-person-classes',
  },
};

export default function InPersonClassesPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero Section */}
      <section className="relative pt-[130px] pb-20 bg-gradient-to-b from-white to-gray-50">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute top-40 right-80 w-32 h-32 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute bottom-40 right-60 w-20 h-20 bg-gray-200 rounded-full opacity-20"></div>
          <div className="absolute bottom-80 left-40 w-40 h-40 bg-gray-300 rounded-full opacity-12"></div>
          <div className="absolute top-60 left-20 w-24 h-24 bg-gray-200 rounded-full opacity-18"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-10 text-center lg:text-left">

              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-black">
                The Ultimate
                <br />
                <span className="text-[#517cad]">SAT/ACT Course</span>
                <br />
                <span className="text-4xl lg:text-5xl xl:text-6xl">In-Person Classes</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0">
                Join our comprehensive in-person SAT/ACT course designed to maximize your test scores. 
                Learn from expert instructors in a structured classroom environment with 
                <span className="text-[#517cad] font-semibold"> proven strategies</span> and 
                <span className="text-gray-700 font-semibold"> hands-on practice</span>.
              </p>
              
              <div className="flex flex-col lg:flex-row gap-4 pt-4">
                <Link href="/contact"
                  className="bg-[#c79d3c] text-white px-8 py-3 rounded-none font-medium text-sm hover:brightness-95 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center">
                  Enroll Now
                </Link>
                <button className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group whitespace-nowrap">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z"/>
                    </svg>
                  </div>
                  <span className="text-base font-semibold text-gray-800">Learn More</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - Course Visual */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl border border-white/60">
                {/* Course Schedule Visual */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-black text-yellow-600 mb-4 relative">
                    📚
                  </div>
                  <div className="text-2xl font-bold text-gray-800">In-Person Course</div>
                </div>
                
                {/* Course Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-yellow-50/80 rounded-2xl border border-yellow-100">
                    <div className="text-3xl font-black text-yellow-600 mb-2">2</div>
                    <div className="text-sm text-gray-600">Days per Week</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50/80 rounded-2xl border border-blue-100">
                    <div className="text-3xl font-black text-blue-600 mb-2">5</div>
                    <div className="text-sm text-gray-600">Weeks Total</div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <div className="text-2xl font-bold text-gray-800">2-Hour Sessions</div>
                  <div className="text-sm text-gray-600 mt-1">Expert Instruction & Practice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose In-Person Classes Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gray-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-6xl font-black text-black mb-6 leading-tight">
              Your Path to <span className="text-[#517cad]">Test Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of face-to-face learning with expert instructors and structured classroom environment
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Benefit 1 - Expert Instruction */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Instruction</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from certified SAT/ACT experts with years of experience helping students achieve their target scores.
              </p>
            </div>

            {/* Benefit 2 - Structured Learning */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Structured Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Follow a comprehensive curriculum designed to cover all test sections systematically and effectively.
              </p>
            </div>

            {/* Benefit 3 - Hands-on Practice */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hands-on Practice</h3>
              <p className="text-gray-600 leading-relaxed">
                Practice with real test questions and receive immediate feedback from instructors in a supportive environment.
              </p>
            </div>

            {/* Benefit 4 - Peer Learning */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Peer Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn alongside motivated peers in small class sizes, fostering collaboration and healthy competition.
              </p>
            </div>

            {/* Benefit 5 - Immediate Feedback */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Immediate Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant clarification on difficult concepts and personalized guidance to address your specific weaknesses.
              </p>
            </div>

            {/* Benefit 6 - Proven Results */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-md transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Join hundreds of students who have achieved significant score improvements through our in-person program.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-800 rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-8">Proven Results</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black mb-2">+200</div>
                <div className="text-lg opacity-90">Average Score Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">95%</div>
                <div className="text-lg opacity-90">Students See Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">300+</div>
                <div className="text-lg opacity-90">Students Enrolled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Schedule Section */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              Course <span className="text-[#517cad]">Schedule & Details</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our structured in-person program is designed to maximize your learning and test performance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Course Schedule */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Course Schedule</h3>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-[#c79d3c] mb-4">Duration</div>
                  <div className="text-2xl text-gray-800 font-semibold mb-2">2-Days a week</div>
                  <div className="text-2xl text-gray-800 font-semibold mb-2">5 Weeks Total</div>
                  <div className="text-2xl text-gray-800 font-semibold">2-Hour Sessions</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-900 mb-4">What You&apos;ll Get:</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Expert instruction from certified tutors</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Comprehensive study materials</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Practice tests and assessments</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Small class sizes for individual attention</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum Details */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Comprehensive Curriculum</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Reading Comprehension</h4>
                    <p className="text-gray-600">Expert strategies for SAT Reading comprehension and critical analysis.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Writing & Language</h4>
                    <p className="text-gray-600">Grammar rules and secrets to ace the writing section with confidence.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Math Mastery</h4>
                    <p className="text-gray-600">Essential formulas and problem-solving techniques for all math sections.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Test Strategies</h4>
                    <p className="text-gray-600">Step-by-step approaches for tackling even the toughest questions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Practice & Assessment</h4>
                    <p className="text-gray-600">Hands-on practice and in-class testing to sharpen your skills.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800 text-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gray-600 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-40 w-16 h-16 bg-gray-600 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Join Our In-Person Course?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Take the first step toward your dream future with our comprehensive SAT/ACT preparation program. 
            Limited spots available for our next session.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/contact" 
              className="bg-[#517cad] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#4568a3] transition shadow-lg">
              Enroll Now
            </Link>
            <Link href="/pricing" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-800 transition">
              View Pricing
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Small class sizes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Expert instructors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Proven curriculum</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Immediate feedback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer now global in layout */}
    </div>
  );
}
