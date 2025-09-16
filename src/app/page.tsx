import Link from 'next/link';
import Image from 'next/image';
import VideoHero from '../components/VideoHero';
import StickyBottomCTA from '../components/StickyBottomCTA';
import DualCTA from '../components/DualCTA';
import IntroBanner from '../components/IntroBanner';
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
      <VideoHero
        mp4Src="/video/video1.mp4"
        posterSrc="/logo.avif"
        headline="Clean, Efficient Tutoring"
        subheadline="Expert 1-on-1 SAT, ACT Tutoring"
        ctaHref="/contact"
        ctaLabel="Start Free Consultation"
      />

      {/* Ogee-style intro banner */}
      <IntroBanner />

      {/* Highlight two primary offerings */}
      <DualCTA />

      {/* Quick services strip (minimal) */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/test-prep/sat" className="group relative overflow-hidden p-5 min-h-[140px] border border-black/5 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-gray-800/90">Service</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">SAT Tutoring</div>
                  </div>
                <span className="text-gray-500 group-hover:text-gray-700 transition">→</span>
              </div>
              <div className="mt-2 text-sm text-gray-800/90 relative z-10">Personalized plans, practice, and strategies.</div>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5" />
            </Link>
            <Link href="/test-prep/act" className="group relative overflow-hidden p-5 min-h-[140px] border border-black/5 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-gray-800/90">Service</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">ACT Tutoring</div>
            </div>
                <span className="text-gray-500 group-hover:text-gray-700 transition">→</span>
                    </div>
              <div className="mt-2 text-sm text-gray-800/90 relative z-10">Targeted prep to raise composite scores.</div>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5" />
            </Link>
            <Link href="/subjects?interest=LSAT" className="group relative overflow-hidden p-5 min-h-[140px] border border-black/5 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-gray-800/90">Service</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">LSAT Tutoring</div>
                  </div>
                <span className="text-gray-500 group-hover:text-gray-700 transition">→</span>
                    </div>
              <div className="mt-2 text-sm text-gray-800/90 relative z-10">Focused prep for logic games, reasoning, and reading comp.</div>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5" />
            </Link>
                    </div>
                  </div>
      </section>

      {/* Browse by category grid (minimal) */}
      {/* About + inline video section (minimal) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Beyond clean tutoring. Results without compromise.</h2>
            <p className="mt-3 text-gray-600">We combine certified tutors, adaptive plans, and ongoing support to help students master content and perform with confidence.</p>
            <div className="mt-6">
              <Link href="/contact" className="inline-flex rounded-full bg-[#c79d3c] text-white px-6 py-3 font-semibold hover:brightness-95">Book Free Consultation</Link>
                    </div>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>✓ Step Up For Students accepted</span>
              <span>✓ A+ BBB Rating</span>
                  </div>
                    </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                  <Image
              src="/Images/student-2.png"
              alt="College students studying"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-black/10" />
                    </div>
                  </div>
      </section>

      {/* Step Up for Students highlight - move below Browse Services */}
      <StepUpSection />
      <section className="pt-4 pb-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Browse Services</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/test-prep/sat" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop" alt="SAT Prep" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">Test Prep</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">SAT Prep</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
            <Link href="/test-prep/act" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop" alt="ACT Prep" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">Test Prep</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">ACT Prep</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
            <Link href="/test-prep/in-person-classes" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" alt="In-Person Classes" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">Classes</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">In-Person Classes</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
            <Link href="/college-high-school/college-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="/Images/student-1.png" alt="College Tutoring" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">College</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">College Tutoring</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
            <Link href="/college-high-school/high-school-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop" alt="High School Tutoring" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">High School</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">High School Tutoring</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
            <Link href="/subjects" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=1200&auto=format&fit=crop" alt="Meet Our Tutors" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/80">Subjects</div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="text-xl font-bold">Browse Subjects</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </div>
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </Link>
                    </div>
                    </div>
      </section>

      {/* Testimonials lite (minimal) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Students love ScoreMax</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-semibold text-[#c79d3c] mb-2">+280 SAT Points</div>
              <p className="text-gray-700">"I improved my SAT by 280 points in 3 months. The plan kept me focused."</p>
              <div className="mt-3 text-sm text-gray-500">— Sarah M.</div>
                  </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-semibold text-green-600 mb-2">2.8 → 3.7 GPA</div>
              <p className="text-gray-700">"Went from struggling to confident in AP Calc thanks to weekly sessions."</p>
              <div className="mt-3 text-sm text-gray-500">— Marcus T.</div>
                </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-semibold text-purple-600 mb-2">Dream School ✓</div>
              <p className="text-gray-700">"Improved my ACT and got into my first choice. The coaching was amazing."</p>
              <div className="mt-3 text-sm text-gray-500">— Emma L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hide legacy sections below to keep page minimal */}
      <div className="hidden">

      {/* Trust Signals */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-gray-50 to-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-8 left-1/4 w-20 h-20 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-8 right-1/3 w-16 h-16 bg-gray-300 rounded-full opacity-15"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* A+ BBB Rating */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group text-center">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">A+ BBB Rating</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Trusted by families nationwide</p>
            </div>

            {/* Step Up For Students */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">Step Up Approved</h4>
              <p className="text-gray-600 text-xs sm:text-sm">State scholarship accepted</p>
            </div>

            {/* 100% Satisfaction Guarantee */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">100% Guarantee</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Satisfaction promised</p>
            </div>

            {/* Certified Expert Tutors */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#517cad] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">Expert Tutors</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Certified & experienced</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-40 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-32 right-32 w-32 h-32 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gray-200 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-6 sm:mb-8 leading-tight">
              Getting Started <span className="text-[#517cad]">Is Easy</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of successful students in just three simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-20">
            {/* Step 1 */}
            <div className="text-center group relative">
              <div className="relative mb-8 sm:mb-12">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#517cad] rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-gray-100">
                  <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">1</span>
                </div>
                <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Schedule Free Consultation</h3>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-sm mx-auto">
                Tell us about your goals and learning needs. We&apos;ll assess your current level and create a personalized plan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group relative">
              <div className="relative mb-8 sm:mb-12">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#517cad] rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-gray-100">
                  <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">2</span>
                </div>
                <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 bg-gray-500 rounded-full"></div>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Get Matched with Expert Tutor</h3>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-sm mx-auto">
                We&apos;ll pair you with a certified tutor who specializes in your subject and understands your learning style.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group relative">
              <div className="relative mb-8 sm:mb-12">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#517cad] rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-gray-100">
                  <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">3</span>
                </div>
                <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-5 h-5 sm:w-7 sm:h-7 bg-gray-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3 w-7 h-7 sm:w-9 sm:h-9 bg-gray-500 rounded-full shadow-lg"></div>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Start Improving</h3>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-sm mx-auto">
                Begin your personalized tutoring sessions and watch your confidence and scores improve week by week.
              </p>
            </div>
          </div>

          <div className="text-center mt-12 sm:mt-16 lg:mt-20">
            <Link href="/contact"
              className="bg-[#517cad] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full font-bold text-base sm:text-lg lg:text-xl hover:bg-[#4568a3] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Start Your Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Our Expert Tutors */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gray-200 rounded-full opacity-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-6 sm:mb-8 leading-tight">
              Learn from the
              <br />
              <span className="text-[#517cad]">Best in the Field</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our certified tutors are passionate educators with proven track records of helping students achieve their academic goals
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16">
            {/* Tutor 1 - Sarah Chen */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300 shadow-md group-hover:shadow-lg bg-gray-100">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Sarah Chen - SAT/ACT Math Specialist"
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#517cad] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 h-80 sm:h-96 flex flex-col">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-gray-900 h-6 sm:h-8">Sarah Chen</h3>
                <div className="text-[#517cad] font-semibold mb-3 sm:mb-4 h-5 sm:h-6 text-sm sm:text-base">SAT/ACT Math Specialist</div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed h-32 sm:h-40 overflow-hidden">
                  Master&apos;s in Mathematics from MIT. Helped 200+ students improve their SAT math scores by an average of 150 points. 
                  Specializes in breaking down complex concepts into simple, understandable steps.
                </p>
                <div className="flex justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 flex-wrap h-6 sm:h-8 items-center mt-auto">
                  <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">8+ Years Experience</span>
                  <span className="bg-green-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">200+ Students</span>
                </div>
              </div>
            </div>

            {/* Tutor 2 - Marcus Johnson */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300 shadow-md group-hover:shadow-lg bg-gray-100">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Marcus Johnson - English & Writing Expert"
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#517cad] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 h-80 sm:h-96 flex flex-col">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-gray-900 h-6 sm:h-8">Marcus Johnson</h3>
                <div className="text-green-600 font-semibold mb-3 sm:mb-4 h-5 sm:h-6 text-sm sm:text-base">English & Writing Expert</div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed h-32 sm:h-40 overflow-hidden">
                  PhD in English Literature from Harvard. Former college admissions counselor with expertise in essay writing and reading comprehension. 
                  Known for his engaging teaching style and ability to boost student confidence.
                </p>
                <div className="flex justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 flex-wrap h-6 sm:h-8 items-center mt-auto">
                  <span className="bg-green-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">12+ Years Experience</span>
                  <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Harvard PhD</span>
                </div>
              </div>
            </div>

            {/* Tutor 3 - Dr. Emily Rodriguez */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300 shadow-md group-hover:shadow-lg bg-gray-100">
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Dr. Emily Rodriguez - Science & STEM Specialist"
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#517cad] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 h-80 sm:h-96 flex flex-col">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-gray-900 h-6 sm:h-8">Dr. Emily Rodriguez</h3>
                <div className="text-purple-600 font-semibold mb-3 sm:mb-4 h-5 sm:h-6 text-sm sm:text-base">Science & STEM Specialist</div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed h-32 sm:h-40 overflow-hidden">
                  PhD in Chemistry from Stanford. Specializes in AP Chemistry, Physics, and Biology. 
                  Her students consistently achieve 4s and 5s on AP exams. Passionate about making science accessible and fun.
                </p>
                <div className="flex justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 flex-wrap h-6 sm:h-8 items-center mt-auto">
                  <span className="bg-purple-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">10+ Years Experience</span>
                  <span className="bg-orange-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">AP Expert</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <Link href="/tutors"
              className="bg-[#517cad] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg lg:text-xl hover:bg-[#4568a3] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Meet All Our Tutors
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-40 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Enhanced Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gray-300 rounded-full opacity-25 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gray-200 rounded-full opacity-30 blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-6 sm:mb-8 leading-tight">
              Choose Your Path to <span className="text-[#517cad]">Success</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Whether you&apos;re preparing for standardized tests or need help with academic subjects, 
              we have expert tutors ready to help you succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
            {/* Test Prep Card */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl hover:shadow-lg transition-all duration-500 group relative overflow-hidden border border-gray-100 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full opacity-40 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#517cad] rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <div className="text-2xl sm:text-3xl">📚</div>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-black">Test Prep</h3>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed">
                  Prepare for SAT, ACT, GMAT, or GRE with proven strategies and personalized study plans 
                  designed to maximize your score improvement.
                </p>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Personalized study plans</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Practice tests and materials</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Test-taking strategies</span>
                  </div>
                </div>
                
                <Link href="/services" 
                  className="inline-block bg-[#517cad] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:bg-[#4568a3] transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Academic Help Card */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl hover:shadow-lg transition-all duration-500 group relative overflow-hidden border border-gray-100 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full opacity-40 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#517cad] rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <div className="text-2xl sm:text-3xl">🎓</div>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-black">Academic Help</h3>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed">
                  Get expert help with AP classes, Calculus, Physics, Chemistry, Algebra, Geometry, 
                  and Statistics from certified tutors.
                </p>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Subject matter experts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Homework assistance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#517cad] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">Concept reinforcement</span>
                  </div>
                </div>
                
                <Link href="/services" 
                  className="inline-block bg-[#517cad] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:bg-[#4568a3] transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Section */}
      <section className="py-40 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 left-20 w-32 h-32 bg-gray-200 rounded-full opacity-10"></div>
          <div className="absolute bottom-40 right-32 w-20 h-20 bg-gray-300 rounded-full opacity-15"></div>
          <div className="absolute top-3/4 right-1/4 w-16 h-16 bg-gray-200 rounded-full opacity-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-6 sm:mb-8 leading-tight">
              Real Results from
              <br />
              <span className="text-[#517cad]">Real Students</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of students who have achieved their academic goals with ScoreMax Tutoring
            </p>
          </div>

          {/* Success Stories Grid */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 mb-16 sm:mb-20 lg:mb-24">
            {/* Story 1 */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-6 sm:mb-8 mx-auto overflow-hidden ring-4 ring-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Sarah M. - SAT Success Student"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-gray-100 text-[#517cad] px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 inline-block">
                  +280 SAT Points
                </div>
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-gray-900">SAT Score Boost</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                  "Improved my SAT score by 280 points in just 3 months! The personalized approach made all the difference."
                </p>
                <div className="text-[#517cad] font-bold text-sm sm:text-base lg:text-lg">- Sarah M.</div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-6 sm:mb-8 mx-auto overflow-hidden ring-4 ring-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Marcus T. - GPA Improvement Student"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 inline-block">
                  2.8 → 3.7 GPA
                </div>
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-gray-900">GPA Improvement</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                  "Went from a 2.8 to 3.7 GPA in my AP Calculus class. My tutor helped me understand concepts I&apos;d struggled with for months."
                </p>
                <div className="text-green-600 font-bold text-sm sm:text-base lg:text-lg">- Marcus T.</div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-6 sm:mb-8 mx-auto overflow-hidden ring-4 ring-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Emma L. - College Acceptance Student"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  Dream School Accepted ✓
                </div>
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-gray-900">College Acceptance</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                  "Got into my dream school thanks to my improved ACT score! ScoreMax gave me the confidence I needed."
                </p>
                <div className="text-purple-600 font-bold text-sm sm:text-base lg:text-lg">- Emma L.</div>
              </div>
            </div>

            {/* Story 4 */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-6 sm:mb-8 mx-auto overflow-hidden ring-4 ring-orange-100">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="David K. - Chemistry Confidence Student"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 inline-block">
                  Chemistry Mastered 🧪
                </div>
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-gray-900">Confidence Boost</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                  "Finally understand chemistry! My tutor is amazing and made complex topics feel simple."
                </p>
                <div className="text-orange-600 font-bold text-sm sm:text-base lg:text-lg">- David K.</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-blue-600 mb-4">95%</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Students see score improvement</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-green-600 mb-4">250+</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Average SAT point increase</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 h-48 flex flex-col justify-center">
                <div className="text-6xl font-black text-purple-600 mb-4">1000+</div>
                <div className="text-gray-700 text-xl font-semibold leading-tight">Successful students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remove final CTA section */}
        </div>
      {/* Final CTA removed */}

      {/* Sticky bottom CTA */}
      <StickyBottomCTA href="/contact" label="Book Now" />

      {/* Footer now rendered globally in RootLayout */}
    </div>
  );
}
