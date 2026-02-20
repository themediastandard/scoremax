import { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact ScoreMax | Book Free Tutoring Consultation | Get Started Today',
  description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today. Get personalized tutoring plans and start improving your test scores.',
  keywords: 'contact ScoreMax, book tutoring consultation, free consultation, tutoring services, SAT tutoring, ACT tutoring, get started',
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
    url: 'https://scoremax.com/contact',
    siteName: 'ScoreMax',
    title: 'Contact ScoreMax | Book Free Tutoring Consultation',
    description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today and start improving your test scores.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Contact ScoreMax Tutoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact ScoreMax | Book Free Consultation',
    description: 'Contact ScoreMax for expert SAT, ACT, and subject tutoring. Book your free consultation today.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Contact
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Ready to start your academic journey? Let&apos;s discuss how we can help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Tell Us About Yourself</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
              We&apos;ll Create Your Perfect Plan
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
              Help us understand your academic background and goals so we can create the perfect learning plan for you.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer now global in layout */}
    </div>
  );
}
