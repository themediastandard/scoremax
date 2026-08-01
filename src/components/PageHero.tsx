import Image, { type StaticImageData } from 'next/image';
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
   *
   * Must be a static import from `@/lib/hero-images`, never a "/Images/…"
   * string. Only a static import carries the build-generated blur preview, and
   * without one the hero shows its two dark scrims over an empty box for as long
   * as the photo takes to download — a grey slab that lasted over a second on a
   * cold navigation. The type is narrow on purpose: a new page cannot
   * reintroduce that flash without failing the build.
   */
  image?: StaticImageData;
  /** Required alongside image: the photo carries meaning, so it needs alt text. */
  imageAlt?: string;
  /**
   * Optional partner logo shown above the eyebrow. Over a photo it sits on a
   * white chip: the Step Up mark is red *and black*, and the black wordmark
   * disappears against the scrim without one.
   */
  logo?: string;
  logoAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  /** Omit the CTA for pages whose action lives further down, e.g. an inline form. */
  showCta?: boolean;
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
  logo,
  logoAlt,
  ctaText = 'Book Free Consultation',
  ctaHref = '/contact',
  showCta = true,
}: PageHeroProps) {
  if (!image) {
    return (
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {logo ? (
            <Image src={logo} alt={logoAlt ?? ''} width={200} height={128} className="w-40 mx-auto mb-6" />
          ) : null}
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">{eyebrow}</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            {title}
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className={`text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto ${showCta ? 'mb-8' : ''}`}>
            {intro}
          </p>
          {showCta ? (
            <Link href={ctaHref} className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
              {ctaText}
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate">
      {/* placeholder="blur" is the point of the static import: it paints the
          build-inlined preview on the first frame, so the scrims below never sit
          over an empty box. quality is well under the default 75 because the
          photo is seen through those two scrims — the artefacts that buys are
          invisible, and it takes a 1920px frame from 112 KB to 81 KB. */}
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        priority
        placeholder="blur"
        quality={60}
        sizes="100vw"
        className="object-cover object-[70%_center] -z-10"
      />
      {/* Two scrims: a left-to-right ramp for the copy, plus a light overall
          wash so the fixed white header still separates from the photo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="absolute inset-0 -z-10 bg-black/15" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24 lg:pt-48 lg:pb-32">
        <div className="max-w-xl">
          {logo ? (
            <div className="inline-flex bg-white rounded-lg px-4 py-3 mb-6 shadow-sm">
              <Image src={logo} alt={logoAlt ?? ''} width={200} height={128} className="w-32 h-auto" />
            </div>
          ) : null}
          <div className="uppercase text-xs tracking-widest text-[#d9b866] font-semibold mb-3">{eyebrow}</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-white mb-4">
            {title}
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mb-5" />
          <p className={`text-gray-200 text-sm leading-relaxed ${showCta ? 'mb-8' : ''}`}>
            {intro}
          </p>
          {showCta ? (
            <Link href={ctaHref} className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
              {ctaText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
