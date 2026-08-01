"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoHeroProps {
  /** Rendered flush under the video frame, above the headline copy. */
  children?: React.ReactNode;
  mp4Src?: string;
  webmSrc?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

/**
 * Full-bleed video hero with the page copy BELOW the frame, never over it.
 *
 * The source is a social cut carrying its own centred headline, which changes
 * through the 15 seconds. No region of the frame stays clear, so anything
 * overlaid collides with that baked-in text somewhere in the loop. Stacking the
 * copy underneath is the only arrangement that cannot clash.
 *
 * hero-home.mp4 is video1.mp4 cropped to `crop=1370:560:0:260`, which removes
 * the 550px Instagram panel on the right — logo, QR code and the "Learn More at
 * scoremaxtutoring.com" band, none of which belong on scoremaxtutoring.com —
 * and 520px of vertical, taking the content from a tall 1.27:1 to a 2.45:1
 * letterbox. The vertical crop is what keeps a full-bleed hero from filling the
 * whole viewport and pushing the headline below the fold; 560px is about as
 * tight as it goes before the baked-in two-line headline starts to clip.
 * The original is untouched at public/video/video1.mp4.
 *
 * The previous version put the video in a half-width column with a 60vh minimum
 * height and object-cover; a wide frame in a box that tall had its sides sliced
 * off, which is why it stopped looking whole.
 *
 * object-contain keeps the entire frame visible. The aspect box matches the file
 * exactly so it fills edge to edge on ordinary screens; the max-height cap stops
 * an ultrawide viewport rendering a hero so tall it buries everything below the
 * fold, and any bars that results in fall against the dark backdrop.
 */
export default function VideoHero({
  children,
  mp4Src = "/video/hero-home.mp4",
  webmSrc,
  headline = "Unlock Your Full Academic Potential",
  subtitle = "Expert tutoring for SAT, ACT, and academics. Personalized plans, proven results, nationwide reach.",
  ctaText = "Book Free Consultation",
  ctaHref = "/contact",
  secondaryText = "Subjects We Tutor",
  secondaryHref = "/subjects",
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * Freeze the loop for anyone whose OS asks for reduced motion. Auto-playing
   * background video is a common trigger for vestibular disorders, and this is
   * the one mitigation that costs nothing visually — for everyone else the hero
   * plays exactly as designed.
   *
   * There is deliberately no on-screen pause control: it was removed at the
   * client's request. That means users who have not set the OS preference have
   * no way to stop the loop, which is the gap WCAG 2.2.2 exists to close. If it
   * is ever reinstated, the least intrusive form is a control that stays hidden
   * until hover or keyboard focus rather than a persistently visible button.
   *
   * autoPlay stays on the element so the default case still plays; this effect
   * overrides it on mount when the preference is set.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  return (
    <section className="relative w-full bg-white">
      {/* Video: complete frame, nothing cropped, nothing on top of it */}
      <div className="w-full bg-neutral-950">
        <div className="relative mx-auto w-full aspect-[137/56]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            /*
             * The clip carries its own baked-in headline and the page repeats
             * that message in the <h1> and subtitle immediately below, so the
             * video conveys nothing that is not already available as text.
             * Marking it decorative is honest and stops screen readers
             * announcing an empty media element. If a future clip carries
             * information of its own, this needs a real accessible name, a
             * caption track and an audio description instead.
             */
            aria-hidden="true"
            tabIndex={-1}
          >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            <source src={mp4Src} type="video/mp4" />
          </video>
        </div>
      </div>

      {children}

      {/* Copy: sits below the frame, so it can never cover the video's own text */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-12 md:py-16 flex flex-col items-center text-center">
          <div className="w-12 h-[2px] bg-[#b08a30] mb-6" />

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight tracking-tight max-w-4xl">
            {headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center bg-[#b08a30] text-white px-7 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]"
            >
              {ctaText}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-7 py-3 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors font-[family-name:var(--font-playfair)]"
            >
              {secondaryText}
            </Link>
          </div>

          <ChevronDown
            className="mt-10 h-5 w-5 text-gray-400 animate-bounce motion-reduce:animate-none hidden md:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
