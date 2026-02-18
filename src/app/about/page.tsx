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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header removed; global in layout */}

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

      {/* Leadership Section Header */}
      <section className="pt-32 pb-4 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-sm tracking-widest text-[#c79d3c] font-semibold mb-3">Our Leadership</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">The People Behind ScoreMax</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Decades of combined experience in education, test preparation, and business leadership.</p>
        </div>
      </section>

      {/* Avi Spiller */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 bg-gray-50 rounded-2xl overflow-hidden">
            <div className="relative min-h-[280px] md:min-h-[auto]">
              <Image src="/Images/avi-new.png" alt="Avi Spiller" fill className="object-cover object-top" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-2">President</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">Avi Spiller</h3>
              <div className="w-10 h-[2px] bg-[#c79d3c] mb-6" />

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">30+</div>
                  <div className="text-xs text-gray-500 mt-1">Years Tutoring</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">23+</div>
                  <div className="text-xs text-gray-500 mt-1">Years Teaching</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">B.S.</div>
                  <div className="text-xs text-gray-500 mt-1">Math Education</div>
                </div>
              </div>

              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Avi, a seasoned educator and dedicated mathematician from Cherry Hill, New Jersey, attended Florida International University where he pursued a Bachelor of Science in Mathematics Education, marking the start of a career spanning over three decades.</p>
                <p>A recognized authority in SAT and ACT preparation, Avi has developed curriculum models adopted by some of the most prestigious private schools in the nation. He also holds certification in Special Education, reinforcing his commitment to empowering all students.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Taimir Terrell */}
      <section className="pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-0 bg-gray-50 rounded-2xl overflow-hidden">
            <div className="p-8 md:p-12 flex flex-col justify-center md:order-1 order-2">
              <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-2">Vice President</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">Taimir Terrell</h3>
              <div className="w-10 h-[2px] bg-[#c79d3c] mb-6" />

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">17+</div>
                  <div className="text-xs text-gray-500 mt-1">Years as CEO</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">13</div>
                  <div className="text-xs text-gray-500 mt-1">Started Age</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c79d3c]">VP</div>
                  <div className="text-xs text-gray-500 mt-1">ScoreMax</div>
                </div>
              </div>

              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Taimir is a highly accomplished entrepreneur whose career is a testament to her innate business acumen. Born into a business-oriented family, she made her first investment at just 13 years old and went on to acquire and grow Pest-Logic over 17 years before selling to a national firm.</p>
                <p>Now as Vice President at ScoreMax, Taimir brings invaluable insights, seasoned leadership, and a strategic mindset. She is not just a leader but a visionary, a strong, determined, and impactful force behind the company.</p>
              </div>
            </div>
            <div className="relative min-h-[280px] md:min-h-[auto] md:order-2 order-1">
              <Image src="/Images/tai-new.png" alt="Taimir Terrell" fill className="object-cover object-top" />
            </div>
          </div>
        </div>
      </section>


      {/* CTA Footer Banner removed for cleaner layout */}

      {/* Footer now global in layout */}
    </div>
  );
}


