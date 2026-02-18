import Link from 'next/link';

export default function IntroBanner() {
  return (
    <section className="w-full bg-gray-800 text-white border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight">Expert Test Prep, Done Right</h2>
            <p className="mt-2 text-xs sm:text-sm text-white/90 leading-relaxed">
              5‑Week In‑Person SAT Classes and nationwide 1‑on‑1 Virtual Tutoring for SAT, ACT, and academics.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-5 py-2 border border-white/70 text-white text-[11px] sm:text-xs tracking-[0.18em] uppercase hover:bg-white hover:text-gray-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


