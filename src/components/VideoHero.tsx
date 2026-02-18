"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface VideoHeroProps {
  mp4Src?: string;
  webmSrc?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

export default function VideoHero({
  mp4Src = "/video/hero-tutoring.mp4",
  webmSrc,
  headline = "Unlock Your Full Academic Potential",
  subtitle = "Expert tutoring for SAT, ACT, and academics. Personalized plans, proven results, nationwide reach.",
  ctaText = "Book Free Consultation",
  ctaHref = "/contact",
  secondaryText = "Browse Subjects",
  secondaryHref = "/subjects",
}: VideoHeroProps) {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-12 md:py-20 md:min-h-[70vh] items-center">
          {/* Left: Content */}
          <div className="flex flex-col justify-center order-2 md:order-1">
          <div className="w-2 h-12 bg-[#c79d3c] mb-8 hidden md:block" />

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight tracking-tight">
            {headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-7 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors font-[family-name:var(--font-playfair)]"
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
        </div>

          {/* Right: Video with angled clip */}
          <div className="relative order-1 md:order-2 min-h-[300px] md:min-h-[60vh] rounded-lg overflow-hidden">
            <div className="absolute inset-0 md:[clip-path:polygon(5%_0,100%_0,100%_100%,0%_100%)]">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              {webmSrc && <source src={webmSrc} type="video/webm" />}
              <source src={mp4Src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </section>
  );
}
