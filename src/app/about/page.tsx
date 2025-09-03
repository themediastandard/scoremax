import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />

      {/* Hero */}
      <section className="relative pt-36 pb-24 lg:pt-40 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 right-24 w-56 h-56 bg-gray-200 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-72 w-24 h-24 bg-gray-300 rounded-full opacity-25"></div>
          <div className="absolute bottom-24 left-24 w-32 h-32 bg-gray-200 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-full">
                <div className="text-sm font-bold text-[#517cad] tracking-wider uppercase">About ScoreMax</div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-black">Committed to Helping Students Reach Their <span className="text-[#517cad]">Full Potential</span></h1>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">With decades of combined experience, our leadership team brings a passion for education, data-driven instruction, and a relentless commitment to student success.</p>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl h-56 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-white rounded-3xl h-56 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-white rounded-3xl h-56 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold">Hero Placeholder</div>
                </div>
                <div className="bg-white rounded-3xl h-56 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold">Hero Placeholder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Bios */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gray-300 rounded-full opacity-15"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Avi Spiller */}
          <div className="mb-32">
            <div className="max-w-4xl mx-auto">
              <div className="uppercase text-sm tracking-widest text-[#517cad] font-semibold mb-2">Avi Spiller</div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">President</h3>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6">
                  <span className="float-left mr-6 mb-2 w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                    <Image src="/staff/avi.avif" alt="Avi Spiller" width={256} height={256} className="object-cover w-full h-full object-top" />
                  </span>
                  Avi, a seasoned educator and dedicated mathematician, hails from Cherry Hill, New Jersey. He attended Florida International University, where he pursued a Bachelor of Science in Mathematics Education, marking the inception of a thriving career that spans over three decades. Avi is renowned for his profound dedication to tutoring, having spent more than 30 years supporting students and igniting their passion for mathematics.
                </p>
                
                <p className="mb-6">
                  With over 23 years of experience in a traditional classroom setting, Avi has a deep understanding of the pedagogical processes that help students learn effectively. He couples this with a comprehensive understanding of standardized tests, studying them meticulously to unravel the methodology behind their creation. This unique approach has been instrumental in helping students prepare for these crucial examinations.
                </p>
                
                <p className="mb-6">
                  Avi's expertise is not confined to general mathematics education. He is a recognized authority in SAT and ACT preparation, having developed robust curriculum models adopted by some of the most prestigious private schools in the nation. His methodology integrates a deep understanding of standardized testing mechanisms, curricular coherence, and individualized student needs, making his approach uniquely effective and efficient.
                </p>
                
                <p>
                  In addition, Avi holds certification in Special Education, reinforcing his commitment to inclusive education. He believes in empowering all students, regardless of their abilities or backgrounds, and showcases this through his commitment, designed meticulously to nurture the academic potential of students and empower them with the knowledge they need to succeed.
                </p>
              </div>
            </div>
          </div>

          {/* Taimir Terrell */}
          <div>
            <div className="max-w-4xl mx-auto">
              <div className="uppercase text-sm tracking-widest text-[#517cad] font-semibold mb-2">Taimir Terrell</div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">Vice President</h3>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6">
                  <span className="float-left mr-6 mb-2 w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                    <Image src="/staff/taimir.avif" alt="Taimir Terrell" width={256} height={256} className="object-cover w-full h-full" style={{objectPosition: 'center 20%'}} />
                  </span>
                  Taimir is a highly accomplished entrepreneur whose impressive career is a testament to her innate business acumen and unwavering commitment to customer relations. Born into a business-oriented family, Taimir grew up learning sales strategies from her father. Demonstrating extraordinary initiative, she made her first foray into entrepreneurship at just 13 years old when she made her first investment in a business venture.
                </p>
                
                <p className="mb-6">
                  Taimir showcased her transformative leadership abilities when she acquired and rebranded Ed's Pest Control into Pest-Logic. With her at the helm, she efficiently managed all aspects of the business, from marketing and sales to operations. Her hands-on approach ensured not only efficient service delivery but also the development of cutting-edge office operations. Under her stewardship, the company flourished and emerged as a reputable pest control service provider.
                </p>
                
                <p className="mb-6">
                  Taimir's relentless drive and strategic decision-making led to a monumental achievement for the company when, after 12 years at the helm, she sold Pest-Logic to one of the largest pest control companies in the nation. This landmark accomplishment further solidified her reputation as a seasoned businesswoman with a knack for making shrewd business decisions.
                </p>
                
                <p>
                  Transitioning to a new challenge when she assumed the role of Vice President at ScoreMax, Taimir brought her rich experience and deep-seated passion for making a difference. Taimir continues to bring invaluable insights, seasoned leadership, and a strategic mindset to her role. She is not just a leader but a visionary—a strong, determined, and impactful leader.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Involvement */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-8 left-1/4 w-20 h-20 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-8 right-1/3 w-16 h-16 bg-gray-300 rounded-full opacity-15"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-full mb-4">
              <div className="text-sm font-bold text-[#517cad] tracking-wider uppercase">Our Community Involvement</div>
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
      <section className="py-20 bg-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gray-600 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Learn More?</h2>
          <p className="text-lg mb-8 opacity-90">Book a free consultation and discover how ScoreMax can help you reach your goals.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#517cad] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#4568a3] transition shadow-lg">Book Free Consultation</Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-800 transition">View Pricing</Link>
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


