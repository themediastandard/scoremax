import type { StaticImageData } from 'next/image';
import { Check } from 'lucide-react';
import { PageHero } from './PageHero';
import { TutoringCtaButtons } from './TutoringCtaButtons';

type DetailCard = {
  title: string;
  description: string;
  items?: string[];
};

type AcademicTutoringLandingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  servicesTitle: string;
  servicesIntro: string;
  services: DetailCard[];
  whyTitle: string;
  whyIntro: string;
  reasons: DetailCard[];
  ctaTitle: string;
  ctaIntro: string;
  /**
   * See PageHero — omit and the hero falls back to centred copy on white.
   * Pass a static import from `@/lib/hero-images` — see PageHero's `image` for
   * why a path string is deliberately not accepted.
   */
  heroImage?: StaticImageData;
  /** Required alongside heroImage: the photo carries meaning, so it needs alt text. */
  heroImageAlt?: string;
};

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`w-10 h-10 bg-[#b08a30]/10 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
      <Check className="w-4 h-4 text-[#b08a30]" aria-hidden="true" />
    </div>
  );
}

export function AcademicTutoringLanding({
  eyebrow,
  title,
  intro,
  servicesTitle,
  servicesIntro,
  services,
  whyTitle,
  whyIntro,
  reasons,
  ctaTitle,
  ctaIntro,
  heroImage,
  heroImageAlt,
}: AcademicTutoringLandingProps) {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        image={heroImage}
        imageAlt={heroImageAlt}
        ctaText="Book a Session"
        ctaHref="/book"
        secondaryCtaText="Book Free Consultation"
      />

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Our Services</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              {servicesTitle}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {servicesIntro}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <CheckIcon className="mb-4" />
                <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {service.description}
                </p>
                {service.items?.length ? (
                  <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Why Choose Us</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
              {whyTitle}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
              {whyIntro}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reasons.map((reason) => (
              <div key={reason.title} className="flex items-start space-x-4">
                <CheckIcon />
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-gray-900 mb-2">{reason.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl text-gray-900 mb-4">
            {ctaTitle}
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            {ctaIntro}
          </p>
          <TutoringCtaButtons />
        </div>
      </section>
    </div>
  );
}
