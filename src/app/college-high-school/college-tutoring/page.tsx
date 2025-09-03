import Link from 'next/link';
import Header from '../../../components/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'College Tutoring Services | Advanced Math & Science | ScoreMax',
  description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students with flexible scheduling.',
  keywords: 'college tutoring, college math tutoring, college science tutoring, advanced math, calculus tutoring, college academic support, university tutoring',
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
    url: 'https://scoremax.com/college-high-school/college-tutoring',
    siteName: 'ScoreMax',
    title: 'College Tutoring Services | Advanced Math & Science',
    description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'College Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Tutoring Services',
    description: 'Expert college tutoring for advanced math, science, and academic subjects.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/college-high-school/college-tutoring',
  },
};

export default function CollegeTutoringPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />

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
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-black mb-8">
              Excel in College with
              <br />
              <span className="text-[#517cad]">Expert Tutoring</span>
              <br />
              Services
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium mb-8">
              At ScoreMax, we provide specialized college tutoring services designed to help students 
              master advanced subjects and achieve academic excellence in their college journey.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12">
              Whether you&apos;re tackling complex mathematics, advanced sciences, or need support with 
              challenging coursework, our expert tutors are here to guide you toward success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact"
                className="bg-[#517cad] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-[#4568a3] transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center">
                Book Free Consultation
              </Link>
              <button className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group whitespace-nowrap">
                <div className="w-8 h-8 bg-[#517cad] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
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

      {/* Our Services Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gray-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black text-black mb-6 leading-tight">
              Our <span className="text-[#517cad]">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tutoring services designed to help college students excel in advanced coursework
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Accelerated Algebra & Calculus Competence */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accelerated Algebra & Calculus Competence</h3>
              <p className="text-gray-600 leading-relaxed">
                Our expert tutors provide comprehensive support in advanced mathematics including College Algebra, 
                Pre-Calculus, Calculus I, II, and III, Differential Equations, Linear Algebra, and Statistics. 
                We focus on building deep understanding and problem-solving skills that will serve you throughout 
                your academic and professional career.
              </p>
            </div>

            {/* Superior Science Understanding */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚗️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Superior Science Understanding</h3>
              <p className="text-gray-600 leading-relaxed">
                Master the complexities of college-level Physics and Chemistry with our experienced tutors. 
                We break down complex scientific principles into understandable concepts, helping you apply 
                theoretical knowledge to practical problems. Our approach ensures you not only pass your courses 
                but develop a genuine appreciation for these fundamental sciences.
              </p>
            </div>

            {/* Customized Learning Experience */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-[#517cad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customized Learning Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Every college student has unique learning needs and academic goals. Our personalized tutoring 
                approach is tailored to your individual strengths, weaknesses, and learning style. We provide 
                a supportive environment where you can ask questions, explore concepts deeply, and build 
                confidence in your academic abilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScoreMax Section */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-black mb-6 leading-tight">
                Why Choose <span className="text-[#517cad]">ScoreMax?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We provide the expertise, flexibility, and personalized attention that college students need to succeed in their academic journey.
              </p>
            </div>

            {/* Right Content - Benefits */}
            <div className="space-y-8">
              {/* Expert Tutors */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👨‍🏫</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Tutors</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our highly skilled professionals hold advanced degrees, possess a passion for teaching, and have a proven track record of helping college students achieve academic success.
                  </p>
                </div>
              </div>

              {/* Flexible Schedule */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Schedule</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We offer flexible scheduling options to fit your busy college lifestyle, providing convenient times that work around your classes, work, and other commitments.
                  </p>
                </div>
              </div>

              {/* Success-Driven */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Success-Driven</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our core mission is to empower students academically and bolster confidence, guiding them towards their academic goals and preparing them for future success.
                  </p>
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
          <div className="absolute top-40 left-40 w-16 h-16 bg-gray-400 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Excel in College?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of college students who have achieved academic success with ScoreMax. 
            Your path to excellence starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/contact" 
              className="bg-[#517cad] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#4568a3] transition shadow-lg">
              Book Free Consultation
            </Link>
            <Link href="/pricing" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-800 transition">
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
              <span>Expert college tutors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Flexible scheduling</span>
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
