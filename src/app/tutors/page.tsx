import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Tutors | Professional SAT, ACT & Subject Tutoring | ScoreMax',
  description: 'Meet our team of expert tutors with advanced degrees from top universities. Professional SAT, ACT, math, science, and test prep tutoring with proven track records of student success.',
  keywords: 'expert tutors, SAT tutors, ACT tutors, math tutors, science tutors, test prep tutors, professional tutoring, certified tutors, advanced degrees',
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
    url: 'https://scoremax.com/tutors',
    siteName: 'ScoreMax',
    title: 'Expert Tutors | Professional SAT, ACT & Subject Tutoring | ScoreMax',
    description: 'Meet our team of expert tutors with advanced degrees from top universities. Professional SAT, ACT, math, science, and test prep tutoring with proven track records.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Expert Tutors - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert Tutors | Professional Tutoring Services',
    description: 'Meet our team of expert tutors with advanced degrees from top universities. Professional SAT, ACT, and subject tutoring.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/tutors',
  },
};

export default function TutorsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "ScoreMax Expert Tutors",
    "description": "Meet our team of expert tutors with advanced degrees from top universities",
    "url": "https://scoremax.com/tutors",
    "itemListElement": [
      {
        "@type": "Person",
        "name": "Dr. Sarah Chen",
        "jobTitle": "Mathematics Specialist",
        "description": "Ph.D. in Mathematics, MIT. Specializes in advanced mathematics including Calculus, Linear Algebra, and Statistics."
      },
      {
        "@type": "Person", 
        "name": "Michael Rodriguez",
        "jobTitle": "Science Expert",
        "description": "M.S. in Chemistry, Stanford. Brings 6 years of experience in chemistry and physics tutoring."
      },
      {
        "@type": "Person",
        "name": "Emily Johnson", 
        "jobTitle": "Test Prep Specialist",
        "description": "M.Ed. in Education, Harvard. Expert for SAT and ACT preparation with perfect scores on both tests."
      },
      {
        "@type": "Person",
        "name": "David Kim",
        "jobTitle": "Advanced Mathematics",
        "description": "Ph.D. in Applied Mathematics, Caltech. Specializes in advanced mathematics and competitive math competitions."
      },
      {
        "@type": "Person",
        "name": "Lisa Thompson",
        "jobTitle": "Biology & Chemistry", 
        "description": "Ph.D. in Biochemistry, Johns Hopkins. Combines research background with excellent teaching skills."
      },
      {
        "@type": "Person",
        "name": "James Wilson",
        "jobTitle": "Physics & Engineering",
        "description": "M.S. in Physics, Georgia Tech. Brings real-world engineering experience to physics tutoring."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              Meet Our Expert
              <br />
              <span className="text-[#517cad]">Tutoring Team</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium mb-8">
              Our highly qualified tutors bring years of experience, advanced degrees, and a passion for helping students succeed. 
              Each tutor is carefully selected for their expertise and proven track record of student success.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12">
              From mathematics and science to test preparation, our diverse team of educators is here to guide you 
              toward your academic goals with personalized, one-on-one instruction.
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

      {/* Our Tutors Section */}
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
              Our <span className="text-[#517cad]">Expert Tutors</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated professionals who are committed to helping you achieve your academic goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tutor 1 - Dr. Sarah Chen */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" 
                    alt="Dr. Sarah Chen" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Sarah Chen</h3>
                <p className="text-[#517cad] font-semibold mb-2">Mathematics Specialist</p>
                <p className="text-sm text-gray-600">Ph.D. in Mathematics, MIT</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Dr. Chen specializes in advanced mathematics including Calculus, Linear Algebra, and Statistics. 
                  With over 8 years of tutoring experience, she has helped hundreds of students improve their grades and confidence.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">SAT Math</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">ACT Math</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Calculus</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Statistics</span>
                </div>
              </div>
            </div>

            {/* Tutor 2 - Michael Rodriguez */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    alt="Michael Rodriguez" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Michael Rodriguez</h3>
                <p className="text-[#517cad] font-semibold mb-2">Science Expert</p>
                <p className="text-sm text-gray-600">M.S. in Chemistry, Stanford</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Michael brings 6 years of experience in chemistry and physics tutoring. His patient approach and 
                  real-world examples help students understand complex scientific concepts and excel in their coursework.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Chemistry</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Physics</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AP Sciences</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">ACT Science</span>
                </div>
              </div>
            </div>

            {/* Tutor 3 - Emily Johnson */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
                    alt="Emily Johnson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Emily Johnson</h3>
                <p className="text-[#517cad] font-semibold mb-2">Test Prep Specialist</p>
                <p className="text-sm text-gray-600">M.Ed. in Education, Harvard</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Emily is our go-to expert for SAT and ACT preparation. With a perfect score on both tests and 
                  5 years of tutoring experience, she knows exactly what it takes to help students achieve their target scores.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">SAT</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">ACT</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">PSAT</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Test Strategy</span>
                </div>
              </div>
            </div>

            {/* Tutor 4 - David Kim */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                    alt="David Kim" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">David Kim</h3>
                <p className="text-[#517cad] font-semibold mb-2">Advanced Mathematics</p>
                <p className="text-sm text-gray-600">Ph.D. in Applied Mathematics, Caltech</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Dr. Kim specializes in advanced mathematics and has helped students prepare for competitive math 
                  competitions. His structured approach and problem-solving techniques have led to remarkable student achievements.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AP Calculus</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Competition Math</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Differential Equations</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Linear Algebra</span>
                </div>
              </div>
            </div>

            {/* Tutor 5 - Lisa Thompson */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" 
                    alt="Lisa Thompson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Lisa Thompson</h3>
                <p className="text-[#517cad] font-semibold mb-2">Biology & Chemistry</p>
                <p className="text-sm text-gray-600">Ph.D. in Biochemistry, Johns Hopkins</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  Dr. Thompson combines her research background with excellent teaching skills to help students 
                  master biology and chemistry. Her interactive approach makes complex topics accessible and engaging.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AP Biology</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AP Chemistry</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Organic Chemistry</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Biochemistry</span>
                </div>
              </div>
            </div>

            {/* Tutor 6 - James Wilson */}
            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" 
                    alt="James Wilson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">James Wilson</h3>
                <p className="text-[#517cad] font-semibold mb-2">Physics & Engineering</p>
                <p className="text-sm text-gray-600">M.S. in Physics, Georgia Tech</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  James brings real-world engineering experience to his physics tutoring. His practical approach 
                  helps students understand how physics principles apply to everyday life and future careers.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AP Physics</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Mechanics</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Electromagnetism</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Engineering Prep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Tutors Section */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6 leading-tight">
              Why Choose Our <span className="text-[#517cad]">Tutors?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Our tutors are carefully selected for their expertise, teaching ability, and commitment to student success.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8">
              {/* Rigorous Selection Process */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Rigorous Selection Process</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every tutor undergoes a comprehensive screening process including background checks, 
                    subject matter expertise verification, and teaching ability assessments.
                  </p>
                </div>
              </div>

              {/* Advanced Degrees */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Degrees</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our tutors hold advanced degrees from top universities including MIT, Stanford, Harvard, 
                    and other prestigious institutions.
                  </p>
                </div>
              </div>

              {/* Proven Track Record */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Track Record</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Each tutor has a demonstrated history of helping students improve their grades, 
                    test scores, and overall academic confidence.
                  </p>
                </div>
              </div>

              {/* Ongoing Training */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#517cad] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ongoing Training</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our tutors participate in regular professional development to stay current with 
                    curriculum changes and teaching best practices.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Tutor Matching Process */}
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
              How We <span className="text-[#517cad]">Match You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We carefully match each student with the perfect tutor based on their needs, learning style, and academic goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                We evaluate your academic needs, learning style, and goals to understand exactly what kind of support you need.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Based on your assessment, we match you with a tutor who has the right expertise and teaching style for your needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Success</h3>
              <p className="text-gray-600 leading-relaxed">
                You work with your matched tutor to achieve your academic goals with personalized, one-on-one instruction.
              </p>
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
            Ready to Meet Your Perfect Tutor?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of students who have found their ideal tutor match and achieved academic success with ScoreMax.
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
              <span>Free tutor matching</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Expert tutors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Personalized approach</span>
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
