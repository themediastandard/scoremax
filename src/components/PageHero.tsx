import Image from 'next/image';
import Link from 'next/link';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  /**
   * Full-bleed hero photograph. Omit it and the hero falls back to the original
   * centred copy on white, so pages without art are unaffected.
   *
   * These are 16:9 frames whose subject sits in the right third, leaving the
   * left clear — which is why the image variant left-aligns its copy instead of
   * centring it. A centred headline would land on the laptop.
   */
  image?: string;
  /** Required alongside image: the photo carries meaning, so it needs alt text. */
  imageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
};

/**
 * The hero shared by every marketing landing page — the four grade-level pages
 * (via AcademicTutoringLanding) and the SAT/ACT test-prep pages, which each had
 * their own copy of this markup before.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  ctaText = 'Book Free Consultation',
  ctaHref = '/contact',
}: PageHeroProps) {
  if (!image) {
    return (
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">{eyebrow}</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            {title}
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-8">
            {intro}
          </p>
          <Link href={ctaHref} className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            {ctaText}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate">
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] -z-10"
      />
      {/* Two scrims: a left-to-right ramp for the copy, plus a light overall
          wash so the fixed white header still separates from the photo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="absolute inset-0 -z-10 bg-black/15" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24 lg:pt-48 lg:pb-32">
        <div className="max-w-xl">
          <div className="uppercase text-xs tracking-widest text-[#d9b866] font-semibold mb-3">{eyebrow}</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-white mb-4">
            {title}
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mb-5" />
          <p className="text-gray-200 text-sm leading-relaxed mb-8">
            {intro}
          </p>
          <Link href={ctaHref} className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
