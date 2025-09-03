import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Navigation (matches home) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center">
              <Image src="/logo.avif" alt="ScoreMax Logo" width={100} height={100} priority />
            </Link>
            <div className="hidden lg:flex items-center space-x-10">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/about" className="text-gray-900 font-semibold text-sm tracking-wider hover:text-blue-600 transition-colors duration-300 relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
              </Link>
              <Link href="/test-prep" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group">
                Test Prep
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/college-high-school" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group">
                College & High School
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/step-up-for-students" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group">
                Step Up For Students
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            <Link href="/contact" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 border border-blue-500/20">Book Free Consultation</Link>
            <button className="lg:hidden">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 lg:pt-40 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 right-24 w-56 h-56 bg-yellow-300 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-72 w-24 h-24 bg-purple-400 rounded-full opacity-25"></div>
          <div className="absolute bottom-24 left-24 w-32 h-32 bg-teal-300 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">About ScoreMax</div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-black">Committed to Helping Students Reach Their Full Potential</h1>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">With decades of combined experience, our leadership team brings a passion for education, data-driven instruction, and a relentless commitment to student success.</p>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl h-56 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl h-56 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-green-700 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl h-56 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-purple-700 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl h-56 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-orange-700 font-bold">Hero Placeholder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Bios */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-15"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Avi Spiller */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-24">
            <div className="relative">
              <div className="w-full max-w-sm h-[380px] bg-gray-200 rounded-3xl shadow-xl overflow-hidden">
                <Image src="/window.svg" alt="Placeholder headshot" width={600} height={600} className="object-cover w-full h-full" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gray-300 rounded-2xl -z-10"></div>
            </div>
            <div>
              <div className="uppercase text-sm tracking-widest text-blue-600 font-semibold mb-2">Avi Spiller</div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">President</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed text-base">
                <p>Avi, a seasoned educator and dedicated mathematician, hails from Cherry Hill, New Jersey. He attended Florida International University, where he pursued a Bachelor of Science in Mathematics Education, marking the inception of a thriving career that spans over three decades. Avi is renowned for his profound dedication to tutoring, having spent more than 30 years supporting students and igniting their passion for mathematics.</p>
                <p>With over 23 years of experience in a traditional classroom setting, Avi has a deep understanding of the pedagogical processes that help students learn effectively. He couples this with a comprehensive understanding of standardized tests, studying them meticulously to unravel the methodology behind their creation. This unique approach has been instrumental in helping students prepare for these crucial examinations.</p>
                <p>Avi’s expertise is not confined to general mathematics education. He is a recognized authority in SAT and ACT preparation, having developed robust curriculum models adopted by some of the most prestigious private schools in the nation. His methodology integrates a deep understanding of standardized testing mechanisms, curricular coherence, and individualized student needs, making his approach uniquely effective and efficient.</p>
                <p>In addition, Avi holds certification in Special Education, reinforcing his commitment to inclusive education. He believes in empowering all students, regardless of their abilities or backgrounds, and showcases this through his commitment, designed meticulously to nurture the academic potential of students and empower them with the knowledge they need to succeed.</p>
              </div>
            </div>
          </div>

          {/* Taimir Terrell */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1">
              <div className="uppercase text-sm tracking-widest text-blue-600 font-semibold mb-2">Taimir Terrell</div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Vice President</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed text-base">
                <p>Taimir is a highly accomplished entrepreneur whose impressive career is a testament to her innate business acumen and unwavering commitment to customer relations. Born into a business-oriented family, Taimir grew up learning sales strategies from her father. Demonstrating extraordinary initiative, she made her first foray into entrepreneurship at just 13 years old when she made her first investment in a business venture.</p>
                <p>Taimir showcased her transformative leadership abilities when she acquired and rebranded Ed’s Pest Control into Pest-Logic. With her at the helm, she efficiently managed all aspects of the business, from marketing and sales to operations. Her hands-on approach ensured not only efficient service delivery but also the development of cutting-edge office operations. Under her stewardship, the company flourished and emerged as a reputable pest control service provider.</p>
                <p>Taimir’s relentless drive and strategic decision-making led to a monumental achievement for the company when, after 12 years at the helm, she sold Pest-Logic to one of the largest pest control companies in the nation. This landmark accomplishment further solidified her reputation as a seasoned businesswoman with a knack for making shrewd business decisions.</p>
                <p>Transitioning to a new challenge when she assumed the role of Vice President at ScoreMax, Taimir brought her rich experience and deep-seated passion for making a difference. Taimir continues to bring invaluable insights, seasoned leadership, and a strategic mindset to her role. She is not just a leader but a visionary—a strong, determined, and impactful leader.</p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="w-full max-w-sm h-[380px] bg-gray-200 rounded-3xl shadow-xl overflow-hidden ml-auto">
                <Image src="/window.svg" alt="Placeholder headshot" width={600} height={600} className="object-cover w-full h-full" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gray-300 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Involvement */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-8 left-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-8 right-1/3 w-16 h-16 bg-purple-200 rounded-full opacity-15"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-4">
              <div className="text-sm font-bold text-blue-800 tracking-wider uppercase">Our Community Involvement</div>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">We are committed to making a positive impact in our communities. Through partnerships and scholarship donations, we help pave the way for the next generation of leaders and innovators.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
                <span className="text-gray-400 text-sm">Logo</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Learn More?</h2>
          <p className="text-lg mb-8 opacity-90">Book a free consultation and discover how ScoreMax can help you reach your goals.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-yellow-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500 transition shadow-lg">Book Free Consultation</Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition">View Pricing</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


