"use client";

import Link from 'next/link';

interface VideoHeroProps {
  mp4Src?: string;
  webmSrc?: string;
  posterSrc?: string;
  headline: string;
  subheadline?: string;
  ctaHref: string;
  ctaLabel: string;
}

export default function VideoHero({
  mp4Src = "/video/video1.mp4",
  webmSrc = "/video/video2.mp4",
  posterSrc = "/logo.avif",
  headline,
  subheadline,
  ctaHref,
  ctaLabel
}: VideoHeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full aspect-[16/9] max-h-[60vh]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
        </video>
        {/* No overlay or text per request */}
      </div>
    </section>
  );
}


