import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Tutor records change rarely; re-fetch hourly so dashboard edits appear without
// a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Our Tutors | SAT, ACT & Subject Tutoring | ScoreMax',
  description:
    'Meet the ScoreMax tutoring team. One-to-one SAT, ACT, math, science and subject tutoring, online and in person.',
  keywords:
    'SAT tutors, ACT tutors, math tutors, science tutors, test prep tutors, tutoring',
  authors: [{ name: 'ScoreMax Tutoring' }],
  creator: 'ScoreMax Tutoring',
  publisher: 'ScoreMax Tutoring',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.scoremaxtutoring.com/tutors',
    siteName: 'ScoreMax',
    title: 'Our Tutors | SAT, ACT & Subject Tutoring | ScoreMax',
    description:
      'Meet the ScoreMax tutoring team. One-to-one SAT, ACT, math, science and subject tutoring.',
    images: [{ url: '/logo.avif', width: 1200, height: 630, alt: 'ScoreMax Tutors' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Tutors | ScoreMax',
    description: 'Meet the ScoreMax tutoring team.',
    images: ['/logo.avif'],
  },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/tutors' },
};

type Tutor = {
  id: string;
  full_name: string;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
};

// A tutor is shown only once they have a genuine bio written. This page used to
// ship six fabricated people ("Dr. Sarah Chen" and friends) with invented
// credentials and Person JSON-LD; it is now driven entirely by the tutors table
// so nothing on it is made up. The length floor filters out stub text such as
// "This is the bio for a tutor." — fill a bio in via Dashboard → Tutors and that
// tutor appears here automatically.
const MIN_BIO_LENGTH = 40;

async function getTutors(): Promise<Tutor[]> {
  // Service-role read: this is a public page, and the `tutors` RLS policy set
  // currently raises 42501 for the anon role (its admin policies call
  // is_admin(), which anon cannot execute). Only public-facing columns are
  // selected — no email, phone, or Google tokens.
  const { data, error } = await supabaseAdmin
    .from('tutors')
    .select('id, full_name, bio, photo_url, specialties')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load tutors:', error.message);
    return [];
  }

  return (data ?? []).filter(
    (t: Tutor) => (t.bio?.trim().length ?? 0) >= MIN_BIO_LENGTH
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function splitSpecialties(specialties: string[] | null): string[] {
  // Stored inconsistently: sometimes one array entry holding "Math & English",
  // sometimes separate entries. Normalise to individual tags.
  return (specialties ?? [])
    .flatMap((s) => s.split(/\s*[&,]\s*/))
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function TutorsPage() {
  const tutors = await getTutors();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ScoreMax Tutors',
    description: 'The ScoreMax tutoring team',
    url: 'https://www.scoremaxtutoring.com/tutors',
    itemListElement: tutors.map((tutor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: tutor.full_name,
        ...(splitSpecialties(tutor.specialties).length && {
          knowsAbout: splitSpecialties(tutor.specialties),
        }),
        ...(tutor.bio && { description: tutor.bio }),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="bg-white pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
            Our Team
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Meet Our Tutoring Team
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            Our tutors work one-to-one with students across test prep, maths, sciences
            and the core high-school subjects — online or in person.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]"
          >
            Book Free Consultation
          </Link>
        </div>
      </section>

      {/* Tutors */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
              Our Tutors
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Dedicated to Your Success
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Meet the people who will be working with your student.
            </p>
          </div>

          {tutors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-6">
                Our tutor profiles are being updated. Get in touch and we will match
                your student with the right tutor.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]"
              >
                Contact Us
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => {
                const tags = splitSpecialties(tutor.specialties);
                return (
                  <div
                    key={tutor.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col"
                  >
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-[#b08a30]/10 flex items-center justify-center">
                        {tutor.photo_url ? (
                          <Image
                            src={tutor.photo_url}
                            alt={tutor.full_name}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="font-[family-name:var(--font-playfair)] text-2xl text-[#b08a30]"
                          >
                            {initials(tutor.full_name)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-2">
                        {tutor.full_name}
                      </h3>
                      {tags.length > 0 && (
                        <p className="text-sm text-[#b08a30] font-medium">
                          {tags.join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-500 text-sm leading-relaxed">{tutor.bio}</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-50 text-gray-600 rounded-lg text-xs px-2 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
              Why Choose Us
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              Matched to Your Student
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We pair each student with a tutor suited to their subject, level and
              learning style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">
                  One-to-One Attention
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Every session is individual, so the pace and focus follow your
                  student rather than a class.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">
                  Subject Specialists
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tutors work within their own subject areas, from SAT and ACT prep to
                  maths, sciences and English.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">
                  Online or In Person
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Sessions run over Google Meet with a shared calendar invite, or in
                  person locally.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tell us when your student is free and we will match a tutor to those
                  times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
              Our Process
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              How We Match You
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Three steps from first contact to a scheduled session.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: '1',
                title: 'Tell Us What You Need',
                body: 'Share the subject, your goals and the times that work for your student.',
              },
              {
                n: '2',
                title: 'We Match a Tutor',
                body: 'We pair your student with a tutor who covers that subject and fits the schedule.',
              },
              {
                n: '3',
                title: 'Start Sessions',
                body: 'You receive a calendar invite with the session time and joining details.',
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-12 h-12 bg-[#b08a30] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-white">{step.n}</span>
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
