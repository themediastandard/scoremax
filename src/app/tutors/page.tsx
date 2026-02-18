import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Our Team</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Meet Our Expert Tutoring Team
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            Our tutors bring years of experience, advanced degrees, and a passion for helping students succeed. 
            Each is carefully selected for expertise and proven track record.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            Book Free Consultation
          </Link>
        </div>
      </section>

      {/* Our Tutors Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Expert Tutors</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Dedicated to Your Success
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Meet the professionals committed to helping you achieve your academic goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tutor 1 - Dr. Sarah Chen */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" 
                    alt="Dr. Sarah Chen" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">Dr. Sarah Chen</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Mathematics Specialist</p>
                <p className="text-xs text-gray-500">Ph.D. in Mathematics, MIT</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dr. Chen specializes in advanced mathematics including Calculus, Linear Algebra, and Statistics. 
                  With over 8 years of tutoring experience, she has helped hundreds of students improve their grades and confidence.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">SAT Math</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">ACT Math</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Calculus</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Statistics</span>
                </div>
              </div>
            </div>

            {/* Tutor 2 - Michael Rodriguez */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    alt="Michael Rodriguez" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">Michael Rodriguez</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Science Expert</p>
                <p className="text-xs text-gray-500">M.S. in Chemistry, Stanford</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Michael brings 6 years of experience in chemistry and physics tutoring. His patient approach and 
                  real-world examples help students understand complex scientific concepts and excel in their coursework.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Chemistry</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Physics</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">AP Sciences</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">ACT Science</span>
                </div>
              </div>
            </div>

            {/* Tutor 3 - Emily Johnson */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
                    alt="Emily Johnson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">Emily Johnson</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Test Prep Specialist</p>
                <p className="text-xs text-gray-500">M.Ed. in Education, Harvard</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Emily is our go-to expert for SAT and ACT preparation. With a perfect score on both tests and 
                  5 years of tutoring experience, she knows exactly what it takes to help students achieve their target scores.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">SAT</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">ACT</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">PSAT</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Test Strategy</span>
                </div>
              </div>
            </div>

            {/* Tutor 4 - David Kim */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                    alt="David Kim" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">David Kim</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Advanced Mathematics</p>
                <p className="text-xs text-gray-500">Ph.D. in Applied Mathematics, Caltech</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dr. Kim specializes in advanced mathematics and has helped students prepare for competitive math 
                  competitions. His structured approach and problem-solving techniques have led to remarkable student achievements.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">AP Calculus</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Competition Math</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Differential Equations</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Linear Algebra</span>
                </div>
              </div>
            </div>

            {/* Tutor 5 - Lisa Thompson */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" 
                    alt="Lisa Thompson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">Lisa Thompson</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Biology & Chemistry</p>
                <p className="text-xs text-gray-500">Ph.D. in Biochemistry, Johns Hopkins</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dr. Thompson combines her research background with excellent teaching skills to help students 
                  master biology and chemistry. Her interactive approach makes complex topics accessible and engaging.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">AP Biology</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">AP Chemistry</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Organic Chemistry</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Biochemistry</span>
                </div>
              </div>
            </div>

            {/* Tutor 6 - James Wilson */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ">
                  <Image 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" 
                    alt="James Wilson" 
                    width={96} 
                    height={96} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">James Wilson</h3>
                <p className="text-sm text-[#b08a30] font-medium mb-2">Physics & Engineering</p>
                <p className="text-xs text-gray-500">M.S. in Physics, Georgia Tech</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  James brings real-world engineering experience to his physics tutoring. His practical approach 
                  helps students understand how physics principles apply to everyday life and future careers.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">AP Physics</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Mechanics</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Electromagnetism</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1">Engineering Prep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Tutors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Rigorous Selection, Proven Results
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our tutors are carefully selected for expertise, teaching ability, and commitment to student success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Rigorous Selection Process</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Every tutor undergoes a comprehensive screening process including background checks, 
                    subject matter expertise verification, and teaching ability assessments.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Advanced Degrees</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Our tutors hold advanced degrees from top universities including MIT, Stanford, Harvard, 
                    and other prestigious institutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Proven Track Record</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Each tutor has a demonstrated history of helping students improve their grades, 
                    test scores, and overall academic confidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Ongoing Training</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Our tutors participate in regular professional development to stay current with 
                    curriculum changes and teaching best practices.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Tutor Matching Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Our Process</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              How We Match You
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We match each student with the perfect tutor based on needs, learning style, and academic goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#b08a30] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Assessment</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We evaluate your academic needs, learning style, and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#b08a30] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Matching</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We match you with a tutor who has the right expertise and teaching style.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#b08a30] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Success</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You work with your matched tutor to achieve your academic goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            Ready to Meet Your Perfect Tutor?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Join hundreds of students who have found their ideal tutor match and achieved academic success with ScoreMax.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
              Book Free Consultation
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
