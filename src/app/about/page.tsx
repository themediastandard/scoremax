// import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ScoreMax - Expert Tutoring Team & Company Mission',
  description: 'Learn about ScoreMax\'s expert tutoring team led by Avi and Taimir. Discover our mission to help students achieve academic success through personalized SAT, ACT, and subject tutoring.',
  keywords: 'about ScoreMax, tutoring team, expert tutors, Avi, Taimir, tutoring company, academic success, personalized tutoring',
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
    url: 'https://scoremax.com/about',
    siteName: 'ScoreMax',
    title: 'About ScoreMax - Expert Tutoring Team & Company Mission',
    description: 'Learn about ScoreMax\'s expert tutoring team led by Avi and Taimir. Discover our mission to help students achieve academic success through personalized SAT, ACT, and subject tutoring.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'About ScoreMax Tutoring Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ScoreMax - Expert Tutoring Team',
    description: 'Learn about ScoreMax\'s expert tutoring team and mission to help students achieve academic success.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Header removed; global in layout */}

      {/* Hero */}
      <section className="relative pt-[130px] pb-24 lg:pt-[134px] bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Person JSON-LD for leadership */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: [
                {
                  '@type': 'Person',
                  name: 'Avi Spiller',
                  jobTitle: 'President',
                  worksFor: { '@type': 'Organization', name: 'ScoreMax' }
                },
                {
                  '@type': 'Person',
                  name: 'Taimir Terrell',
                  jobTitle: 'Vice President',
                  worksFor: { '@type': 'Organization', name: 'ScoreMax' }
                }
              ]
            })
          }}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 right-24 w-56 h-56 bg-gray-200 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-72 w-24 h-24 bg-gray-300 rounded-full opacity-25"></div>
          <div className="absolute bottom-24 left-24 w-32 h-32 bg-gray-200 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="min-h-[380px] flex items-center justify-center">
            <div className="space-y-6 text-center max-w-3xl mx-auto">

              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-black">Committed to Helping Students Reach Their <span className="text-[#c79d3c]">Full Potential</span></h1>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">With decades of combined experience, our leadership team brings a passion for education, data-driven instruction, and a relentless commitment to student success.</p>
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
              <div className="uppercase text-sm tracking-widest text-[#c79d3c] font-semibold mb-2">Avi Spiller</div>
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
                  Avi&apos;s expertise is not confined to general mathematics education. He is a recognized authority in SAT and ACT preparation, having developed robust curriculum models adopted by some of the most prestigious private schools in the nation. His methodology integrates a deep understanding of standardized testing mechanisms, curricular coherence, and individualized student needs, making his approach uniquely effective and efficient.
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
              <div className="uppercase text-sm tracking-widest text-[#c79d3c] font-semibold mb-2">Taimir Terrell</div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">Vice President</h3>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6">
                  <span className="float-left mr-6 mb-2 w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                    <Image src="/staff/taimir-profile.JPG" alt="Taimir Terrell" width={256} height={256} className="object-cover w-full h-full" style={{objectPosition: 'center 20%'}} />
                  </span>
                  Taimir is a highly accomplished entrepreneur whose impressive career is a testament to her innate business acumen and unwavering commitment to customer relations. Born into a business-oriented family, Taimir grew up learning sales strategies from her father. Demonstrating extraordinary initiative, she made her first foray into entrepreneurship at just 13 years old when she made her first investment in a business venture.
                </p>
                
                <p className="mb-6">
                  Taimir showcased her transformative leadership abilities when she acquired and rebranded Ed&apos;s Pest Control into Pest-Logic. With her at the helm, she efficiently managed all aspects of the business, from marketing and sales to operations. Her hands-on approach ensured not only efficient service delivery but also the development of cutting-edge office operations. Under her stewardship, the company flourished and emerged as a reputable pest control service provider.
                </p>
                
                <p className="mb-6">
                  Taimir&apos;s relentless drive and strategic decision-making led to a monumental achievement for the company when, after 17 years at the helm, she sold Pest-Logic to one of the largest pest control companies in the nation. This landmark accomplishment further solidified her reputation as a seasoned businesswoman with a knack for making shrewd business decisions.
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

      {/* CTA Footer Banner removed for cleaner layout */}

      {/* Footer now global in layout */}
    </div>
  );
}


