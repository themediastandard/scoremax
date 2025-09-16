import Link from 'next/link';

export default function DualCTA() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-3">
        <div className="border border-gray-200 p-5">
          <div className="text-xs tracking-[0.18em] uppercase text-gray-500">In-Person</div>
          <h3 className="mt-1 text-xl font-medium text-gray-900">5-Week SAT Classes</h3>
          <p className="mt-1 text-gray-600 text-sm">Strategy, practice tests, and weekly progress checks.</p>
          <div className="mt-3">
            <Link href="/test-prep/in-person-classes" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-4 py-2 text-xs font-medium">Register for SAT Classes</Link>
          </div>
        </div>
        <div className="border border-gray-200 p-5">
          <div className="text-xs tracking-[0.18em] uppercase text-gray-500">Virtual</div>
          <h3 className="mt-1 text-xl font-medium text-gray-900">1-on-1 Tutoring Nationwide</h3>
          <p className="mt-1 text-gray-600 text-sm">Personalized tutoring for SAT, ACT, and academics.</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-4 py-2 text-xs font-medium">Book Virtual Tutoring</Link>
            <Link href="/services" className="inline-flex items-center justify-center border border-gray-300 text-gray-900 px-4 py-2 text-xs font-medium">Browse Services</Link>
          </div>
        </div>
      </div>
    </section>
  );
}


