import Link from 'next/link';
import Image from 'next/image';
import { Video } from 'lucide-react';
import VideoHero from '../components/VideoHero';
import StepUpSection from '../components/StepUpSection';
import { Metadata } from 'next';
import { heroImages } from '@/lib/hero-images';
import { siteImages } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'ScoreMax - Expert SAT & ACT Tutoring | Boost Your Test Scores',
  description: '100% online SAT and ACT tutoring, held live over video conferencing. Expert tutors help students improve test scores by 260+ points. Flexible scheduling, proven results, and personalized learning plans.',
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
    url: 'https://www.scoremaxtutoring.com',
    siteName: 'ScoreMax',
    title: 'ScoreMax - Expert SAT & ACT Tutoring | Boost Your Test Scores',
    description: '100% online SAT and ACT tutoring, held live over video conferencing. Expert tutors help students improve test scores by 260+ points. Flexible scheduling, proven results, and personalized learning plans.',
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
    description: '100% online SAT and ACT tutoring over video conferencing. Expert tutors help students improve test scores by 260+ points.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com',
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ScoreMax",
    "description": "Fully remote SAT and ACT tutoring delivered online over video conferencing, with expert tutors. Help students improve test scores by 260+ points.",
    "url": "https://www.scoremaxtutoring.com",
    "logo": "https://www.scoremaxtutoring.com/logo.avif",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://www.scoremaxtutoring.com/contact"
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
          "text": "Students typically improve their SAT scores by 260+ points with our expert tutoring services. Our personalized approach and proven strategies help students achieve significant score improvements."
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
        "name": "Are ScoreMax sessions online or in person?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All ScoreMax tutoring is 100% online. Every session is held live over video conferencing, and you receive a private video link for each booking. We do not offer in-person or in-home tutoring, so students can work with expert tutors from anywhere with an internet connection."
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
        mp4Src="/video/hero-home.mp4"
        subtitle="Expert tutoring for SAT, ACT, and academics, 100% online over live video. Personalized plans, proven results, nationwide reach."
      >
        {/* Fully remote notice, flush under the video frame */}
        <div className="bg-[#b08a30]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            {/*
              White on the brand gold is a fixed part of the visual identity and
              is intentional here. The second line was previously text-white/90;
              it is solid white now, which reads better against the gold.
            */}
            <Video className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span className="text-sm text-white font-semibold">100% online tutoring.</span>
            <span className="text-sm text-white">
              Every session is held live over video conferencing. No in-person or in-home visits.
            </span>
          </div>
        </div>
      </VideoHero>


      {/* Browse Services */}
      <section className="pt-4 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Our Services</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900">Browse by Subject</h2>
          </div>

          <div className="mb-6">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">Test Prep</h3>
            <div className="w-10 h-[2px] bg-[#b08a30] mt-3" />
          </div>
          {/* Five across on desktop so the row fills evenly — a 3-column grid
              left an orphaned row of two. The school-level grid below is four
              across for the same reason. */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/test-prep/sat" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop" alt="SAT Prep" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">SAT Prep</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Digital and adaptive, scored 400–1600.</p>
              </div>
            </Link>
            <Link href="/test-prep/act" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop" alt="ACT Prep" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">ACT Prep</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">English, math and reading. Science optional.</p>
              </div>
            </Link>
            <Link href="/test-prep/lsat" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src={heroImages.lsat} alt="LSAT Prep" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">LSAT Prep</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Logical reasoning and reading, scored 120–180.</p>
              </div>
            </Link>
            <Link href="/test-prep/gre" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src={heroImages.gre} alt="GRE Prep" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">GRE Prep</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Under two hours. Verbal, quant and writing.</p>
              </div>
            </Link>
            <Link href="/test-prep/gmat" className="group relative h-56 sm:col-span-2 lg:col-span-1 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src={heroImages.gmat} alt="GMAT Prep" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Test Prep</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">GMAT Prep</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Quant, verbal and data insights, 205–805.</p>
              </div>
            </Link>
          </div>

          <div className="mt-12 mb-6">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">Tutoring by School Level</h3>
            <div className="w-10 h-[2px] bg-[#b08a30] mt-3" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/college-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src={siteImages.student1} alt="College Tutoring" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">College</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">College Tutoring</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Calculus, physics, chemistry and organic chem.</p>
              </div>
            </Link>
            <Link href="/high-school-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop" alt="High School Tutoring" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">High School</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">High School Tutoring</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Algebra through calculus, physics and chemistry.</p>
              </div>
            </Link>
            <Link href="/middle-school-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop" alt="Middle School Tutoring" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Middle School</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">Middle School Tutoring</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Math, English and science for grades 6–8.</p>
              </div>
            </Link>
            <Link href="/elementary-tutoring" className="group relative h-56 rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform hover:scale-[1.01] shadow-sm hover:shadow-md">
              <Image src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop" alt="Elementary Tutoring" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
              <div className="absolute top-3 left-3 text-[11px] tracking-[0.2em] uppercase text-white/90">Elementary</div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-[family-name:var(--font-playfair)]">Elementary Tutoring</div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
                <p className="text-xs leading-snug text-white/85">Reading and math foundations, one-on-one.</p>
              </div>
            </Link>
                    </div>
                    </div>
      </section>

      {/* About + inline video section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why ScoreMax</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-1">Results Without Compromise</h2>
            <div className="w-10 h-[2px] bg-[#b08a30] mt-4 mb-5" />
            <p className="text-gray-700 text-sm leading-relaxed">We combine certified tutors, adaptive plans, and ongoing support to help students master content and perform with confidence.</p>
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">
              ScoreMax creates a nurturing, interactive, and engaging virtual environment
              where students can learn and grow at their own pace. Our handpicked, certified
              tutors are experts in their fields, committed to the academic success of each
              student. Every session takes place online over video conferencing. We are a
              fully remote practice, so students meet their tutor from home, anywhere in the
              country. We&rsquo;re more than a tutoring platform. We are a community of
              lifelong learners dedicated to academic excellence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">Book Free Consultation</Link>
            </div>
            <div className="mt-5 flex gap-5 text-xs text-gray-800">
              <span>Scholarship accepted</span>
              <span>A+ BBB Rating</span>
            </div>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white">
            <Image src={siteImages.student2} alt="A student in an online tutoring session with her tutor on the laptop screen" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Book a Session Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">Book Your Session in Minutes</h2>
            <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto">
              Our simple booking process makes it easy to schedule tutoring that fits your goals and schedule. Choose your subject, share your availability, and we match you with an expert tutor.
            </p>
            <p className="mt-4 text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto">
              We understand the importance of convenience in a student&rsquo;s busy schedule and
              aim to provide accessible options. We understand that each student has unique
              strengths, weaknesses, and learning styles. That&rsquo;s why our sessions are
              designed to cater to individual needs. Our tutors provide personalized attention,
              identify areas for improvement, and create customized study plans to optimize each
              student&rsquo;s progress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg text-[#b08a30] font-bold">1</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Choose Subject & Plan</h3>
              <p className="text-gray-700 text-sm leading-relaxed">Select the subject you need help with and the tutoring package that works for you. We offer flexible options from single sessions to monthly memberships.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg text-[#b08a30] font-bold">2</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Share Your Availability</h3>
              <p className="text-gray-700 text-sm leading-relaxed">Tell us when you are free. We match you with an expert tutor who fits your schedule online.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg text-[#b08a30] font-bold">3</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">Start Learning</h3>
              <p className="text-gray-700 text-sm leading-relaxed">Once confirmed, you get a video conferencing link for your session. Sessions are held online, so you meet your tutor from home. Track progress and adjust as needed.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 md:p-10 text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl lg:text-2xl text-gray-900 mb-3">Why Book a Session?</h3>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto mb-6">
              Every session gets you closer to your goals. Our tutors are handpicked experts who adapt to your learning style. Whether you need a score boost for the SAT, help in calculus, or ongoing academic support, booking is the first step toward results.
            </p>
            <Link href="/book" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-8 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
              Book A Session
            </Link>
          </div>
        </div>
      </section>

      {/* Scholarship Section */}
      <StepUpSection />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Testimonials</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900">Students Love ScoreMax</h3>
            <a href="https://www.google.com/search?q=ScoreMax+tutoring" target="_blank" rel="noopener noreferrer" className="text-[#b08a30] text-sm mt-2 inline-block hover:underline font-medium">
              View all reviews on Google →
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8">
              <div className="text-xs text-[#b08a30] font-medium mb-3">Google Review</div>
              <div className="text-2xl font-bold text-[#b08a30] mb-1">+280</div>
              <div className="text-xs text-gray-800 mb-4">SAT Point Increase</div>
              <p className="text-gray-800 text-sm leading-relaxed">&quot;I improved my SAT by 280 points in 3 months. The plan kept me focused.&quot;</p>
              <div className="mt-4 text-xs text-gray-800">Sarah M.</div>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8">
              <div className="text-xs text-[#b08a30] font-medium mb-3">Google Review</div>
              <div className="text-2xl font-bold text-[#b08a30] mb-1">3.7</div>
              <div className="text-xs text-gray-800 mb-4">GPA from 2.8</div>
              <p className="text-gray-800 text-sm leading-relaxed">&quot;Went from struggling to confident in AP Calc thanks to weekly sessions.&quot;</p>
              <div className="mt-4 text-xs text-gray-800">Marcus T.</div>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8">
              <div className="text-xs text-[#b08a30] font-medium mb-3">Google Review</div>
              <div className="text-2xl font-bold text-[#b08a30] mb-1">Top Choice</div>
              <div className="text-xs text-gray-800 mb-4">College Accepted</div>
              <p className="text-gray-800 text-sm leading-relaxed">&quot;Improved my ACT and got into my first choice. The coaching was amazing.&quot;</p>
              <div className="mt-4 text-xs text-gray-800">Emma L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer now rendered globally in RootLayout */}
    </div>
  );
}
