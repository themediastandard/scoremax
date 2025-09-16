import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SAT Tutoring Services | Expert SAT Test Prep | ScoreMax',
  description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation, proven strategies, and comprehensive study plans. Book your free consultation today.',
  keywords: 'SAT tutoring, SAT test prep, SAT preparation, SAT scores, SAT practice, SAT strategies, college entrance exam, SAT tutoring services',
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
    url: 'https://scoremax.com/test-prep/sat',
    siteName: 'ScoreMax',
    title: 'SAT Tutoring Services | Expert SAT Test Prep | ScoreMax',
    description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation, proven strategies, and comprehensive study plans.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'SAT Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAT Tutoring Services | Expert SAT Test Prep',
    description: 'Professional SAT tutoring services with expert tutors. Improve your SAT scores with personalized test preparation.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/test-prep/sat',
  },
};

export default function SATPage() {
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
          <div className="text-center">
            

            
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-relaxed tracking-tight text-black mb-8 space-y-4">
              <div className="text-3xl lg:text-4xl xl:text-5xl text-gray-600 font-semibold mb-2">
                Welcome to
              </div>
              <div className="text-6xl lg:text-7xl xl:text-8xl text-[#c79d3c] font-black mb-4">
                SCOREMAX
              </div>
              <div className="text-4xl lg:text-5xl xl:text-6xl text-gray-800 font-bold">
                Your Expert SAT Tutoring Solution!
              </div>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium mb-12">
              At ScoreMax, we understand the importance of achieving high scores on the SAT for college admissions. 
              That&apos;s why we&apos;re here to provide you with 
              <span className="text-[#c79d3c] font-medium"> top-notch SAT tutoring services</span> that will 
              <span className="text-gray-700 font-semibold"> maximize your potential</span> and help you reach your desired score.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact"
                  className="bg-[#c79d3c] text-white px-8 py-3 rounded-none font-medium text-sm hover:brightness-95 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center">
                  Book Free Consultation
                </Link>
                <button className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group whitespace-nowrap">
                  <div className="w-8 h-8 bg-[#c79d3c] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z"/>
                    </svg>
                  </div>
                  <span className="text-base font-semibold text-gray-800">See How It Works</span>
                </button>
              </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs items={[
            { label: 'Test Prep', href: '/test-prep' },
            { label: 'SAT Tutoring' }
          ]} />
          {/* Header */}
          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-6xl font-black text-black mb-6 leading-tight">
              Your Path to <span className="text-[#c79d3c]">SAT Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide everything you need to maximize your SAT score and achieve your college admission goals
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Benefit 1 - Experienced Tutors */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Experienced Tutors</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team consists of highly qualified SAT experts with years of experience helping students achieve their target scores. 
                Each tutor is carefully selected for their expertise and proven track record.
              </p>
            </div>

            {/* Benefit 2 - Customized Approach */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customized Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide personalized tutoring sessions tailored to your individual needs and learning style. 
                Our approach adapts to your strengths and weaknesses for maximum effectiveness.
              </p>
            </div>

            {/* Benefit 3 - Comprehensive Curriculum */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Curriculum</h3>
              <p className="text-gray-600 leading-relaxed">
                Our curriculum covers all aspects of the SAT exam, including study materials, practice tests, and detailed explanations. 
                We ensure you&apos;re fully prepared for every section of the test.
              </p>
            </div>

            {/* Benefit 4 - Proven Strategies */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Strategies</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn effective strategies and time-management techniques taught by our experienced tutors. 
                Our methods are time-tested and have helped thousands of students improve their scores.
              </p>
            </div>

            {/* Benefit 5 - Continuous Support */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Continuous Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive ongoing support beyond your tutoring sessions. We&apos;re here to help you stay motivated, 
                track your progress, and provide guidance throughout your SAT preparation journey.
              </p>
            </div>

            {/* Benefit 6 - Score Improvement Guarantee */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Score Improvement Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re so confident in our methods that we guarantee score improvement. 
                Join the thousands of students who have achieved their target SAT scores with ScoreMax.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-800 rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-8">Proven Results</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black mb-2">+250</div>
                <div className="text-lg opacity-90">Average Score Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">95%</div>
                <div className="text-lg opacity-90">Students See Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">800+</div>
                <div className="text-lg opacity-90">SAT Students Helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAT Test Sections */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6">
              Master All <span className="text-[#c79d3c]">SAT Sections</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach covers every aspect of the SAT to ensure you&apos;re fully prepared for test day
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Reading Section */}
            <div className="bg-white p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reading</h3>
              <p className="text-gray-600 mb-4">52 questions, 65 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Literature</li>
                <li>• History/Social Studies</li>
                <li>• Science</li>
                <li>• Paired Passages</li>
              </ul>
            </div>

            {/* Writing & Language Section */}
            <div className="bg-white p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Writing & Language</h3>
              <p className="text-gray-600 mb-4">44 questions, 35 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Standard English Conventions</li>
                <li>• Expression of Ideas</li>
                <li>• Grammar & Usage</li>
                <li>• Sentence Structure</li>
              </ul>
            </div>

            {/* Math Section */}
            <div className="bg-white p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Math</h3>
              <p className="text-gray-600 mb-4">58 questions, 80 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Heart of Algebra</li>
                <li>• Problem Solving & Data Analysis</li>
                <li>• Passport to Advanced Math</li>
                <li>• Additional Topics in Math</li>
              </ul>
            </div>
          </div>

          {/* Optional Essay Section */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#c79d3c] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Optional Essay</h3>
              <p className="text-gray-600 mb-4">1 essay, 50 minutes</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Reading Analysis</li>
                <li>• Writing Analysis</li>
                <li>• Argument Analysis</li>
                <li>• College Board Discontinued (2021)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800 text-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-orange-400 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-40 w-16 h-16 bg-pink-400 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Ace Your SAT?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of students who have achieved their target SAT scores with ScoreMax. 
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
              <span>Expert SAT tutors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Proven strategies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer removed; global in layout */}
    </div>
  );
}
