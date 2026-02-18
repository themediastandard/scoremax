import Link from 'next/link';
import Image from 'next/image';
import VideoHero from '../components/VideoHero';
import DualCTA from '../components/DualCTA';
import StepUpSection from '../components/StepUpSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ScoreMax - Expert SAT & ACT Tutoring | Boost Your Test Scores',
  description: 'Professional SAT and ACT tutoring services. Expert tutors help students improve test scores by 280+ points. Flexible scheduling, proven results, and personalized learning plans.',
  keywords: 'SAT tutoring, ACT tutoring, test prep, college prep, tutoring services, SAT scores, ACT scores, test preparation, academic tutoring',
  authors: [{ name: 'ScoreMax Tutoring' }],
  creator: 'ScoreMax Tutoring',
  publisher: 'ScoreMax Tutoring',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scoremax.com',
    siteName: 'ScoreMax',
    title: 'ScoreMax - Expert SAT & ACT Tutoring | Boost Your Test Scores',
    description: 'Professional SAT and ACT tutoring services. Expert tutors help students improve test scores by 280+ points. Flexible scheduling, proven results, and personalized learning plans.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'ScoreMax Tutoring - Expert SAT and ACT Test Preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreMax - Expert SAT & ACT Tutoring',
    description: 'Professional SAT and ACT tutoring services. Expert tutors help students improve test scores by 280+ points.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com',
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ScoreMax",
    "description": "Professional SAT and ACT tutoring services with expert tutors. Help students improve test scores by 280+ points.",
    "url": "https://scoremax.com",
    "logo": "https://scoremax.com/logo.avif",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://scoremax.com/contact"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "offers": {
      "@type": "Offer",
      "description": "SAT and ACT tutoring services",
      "category": "Educational Services"
    },
    "serviceType": ["SAT Tutoring", "ACT Tutoring", "Test Preparation", "Academic Tutoring"],
    "areaServed": "United States"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much can I improve my SAT score with ScoreMax tutoring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Students typically improve their SAT scores by 280+ points with our expert tutoring services. Our personalized approach and proven strategies help students achieve significant score improvements."
        }
      },
      {
        "@type": "Question", 
        "name": "What subjects does ScoreMax offer tutoring for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ScoreMax offers comprehensive tutoring services including SAT preparation, ACT preparation, mathematics, science, and academic subject tutoring for both high school and college students."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer in-person and online tutoring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, ScoreMax offers both in-person tutoring sessions and online tutoring options to accommodate different learning preferences and schedules."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get started with ScoreMax tutoring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Getting started is easy! Simply contact us to book your free consultation. We&apos;ll assess your needs, create a personalized learning plan, and match you with the perfect tutor."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {/* Header now rendered globally in RootLayout */}

      {/* Video Hero */}
      <VideoHero mp4Src="/video/video1.mp4" />

      {/* IntroBanner removed */}

      {/* Highlight two primary offerings */}
      <DualCTA />

      {/* Browse Services */}
      <section className="pt-4 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Our Services</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900">Browse by Subject</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/test-prep/sat" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop" alt="SAT Prep" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">SAT Prep</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
            </Link>
            <Link href="/test-prep/act" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop" alt="ACT Prep" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">ACT Prep</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
            </Link>
            <Link href="/test-prep/in-person-classes" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" alt="In-Person Classes" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Classes</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">LSAT Prep</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </div>
            </Link>
            <Link href="/college-high-school/college-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="/Images/student-1.png" alt="College Tutoring" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">College</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">College Tutoring</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
            </Link>
            <Link href="/college-high-school/high-school-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop" alt="High School Tutoring" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">High School</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">High School Tutoring</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
            </Link>
            <Link href="/subjects" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=1200&auto=format&fit=crop" alt="Meet Our Tutors" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Subjects</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-[family-name:var(--font-playfair)]">Browse Subjects</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </div>
            </Link>
                    </div>
                    </div>
      </section>

      {/* About + inline video section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Why ScoreMax</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-1">Results Without Compromise</h2>
            <div className="w-10 h-[2px] bg-[#c79d3c] mt-4 mb-5" />
            <p className="text-gray-500 text-sm leading-relaxed">We combine certified tutors, adaptive plans, and ongoing support to help students master content and perform with confidence.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors font-[family-name:var(--font-playfair)]">Book Free Consultation</Link>
            </div>
            <div className="mt-5 flex gap-5 text-xs text-gray-400">
              <span>Step Up For Students accepted</span>
              <span>A+ BBB Rating</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 aspect-video rounded-2xl overflow-hidden bg-white [&>div]:rounded-lg">
            <div className="relative">
              <Image src="/Images/student-2.png" alt="Students studying" fill className="object-cover" />
            </div>
            <div className="relative">
              <Image src="/Images/student-1.png" alt="College student" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Step Up for Students highlight - remains below Browse Services */}
      <StepUpSection />

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Testimonials</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900">Students Love ScoreMax</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white border border-gray-100 p-8">
              <div className="text-2xl font-bold text-[#c79d3c] mb-1">+280</div>
              <div className="text-xs text-gray-400 mb-4">SAT Point Increase</div>
              <p className="text-gray-600 text-sm leading-relaxed">&quot;I improved my SAT by 280 points in 3 months. The plan kept me focused.&quot;</p>
              <div className="mt-4 text-xs text-gray-400">Sarah M.</div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-8">
              <div className="text-2xl font-bold text-[#c79d3c] mb-1">3.7</div>
              <div className="text-xs text-gray-400 mb-4">GPA from 2.8</div>
              <p className="text-gray-600 text-sm leading-relaxed">&quot;Went from struggling to confident in AP Calc thanks to weekly sessions.&quot;</p>
              <div className="mt-4 text-xs text-gray-400">Marcus T.</div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-8">
              <div className="text-2xl font-bold text-[#c79d3c] mb-1">Top Choice</div>
              <div className="text-xs text-gray-400 mb-4">College Accepted</div>
              <p className="text-gray-600 text-sm leading-relaxed">&quot;Improved my ACT and got into my first choice. The coaching was amazing.&quot;</p>
              <div className="mt-4 text-xs text-gray-400">Emma L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer now rendered globally in RootLayout */}
    </div>
  );
}
