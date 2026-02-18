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

      {/* Browse Services moved up under DualCTA */}
      <section className="pt-4 pb-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
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
                <div className="text-xl font-bold">LSAT Prep</div>
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

      {/* Step Up for Students highlight - remains below Browse Services */}
      <StepUpSection />

      {/* Testimonials lite (minimal) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Students love ScoreMax</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-medium text-[#c79d3c] mb-2">+280 SAT Points</div>
              <p className="text-gray-700">&quot;I improved my SAT by 280 points in 3 months. The plan kept me focused.&quot;</p>
              <div className="mt-3 text-sm text-gray-500">— Sarah M.</div>
                  </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-medium text-green-600 mb-2">2.8 → 3.7 GPA</div>
              <p className="text-gray-700">&quot;Went from struggling to confident in AP Calc thanks to weekly sessions.&quot;</p>
              <div className="mt-3 text-sm text-gray-500">— Marcus T.</div>
                </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="text-sm font-medium text-purple-600 mb-2">Dream School ✓</div>
              <p className="text-gray-700">&quot;Improved my ACT and got into my first choice. The coaching was amazing.&quot;</p>
              <div className="mt-3 text-sm text-gray-500">— Emma L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer now rendered globally in RootLayout */}
    </div>
  );
}
