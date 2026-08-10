import Link from 'next/link';

/** Shared action group for the bottom of every tutoring service page. */
export function TutoringCtaButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/book"
        className="inline-flex items-center justify-center bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]"
      >
        Book a Session
      </Link>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center border border-[#b08a30] text-[#8b6b25] px-6 py-3 text-sm font-medium hover:bg-[#b08a30]/10 transition-colors font-[family-name:var(--font-playfair)]"
      >
        Book Free Consultation
      </Link>
      <Link
        href="/pricing"
        className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors"
      >
        View Pricing
      </Link>
    </div>
  );
}
