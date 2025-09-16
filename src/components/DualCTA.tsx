import Link from 'next/link';
import Image from 'next/image';

export default function DualCTA() {
  return (
    <section className="pt-6 pb-4 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-3">
        {/* In-Person SAT Classes */}
        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden group">
          <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop" alt="In-Person SAT Classes" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/80">In-Person</div>
            <h3 className="mt-1 text-xl sm:text-2xl text-white font-medium">5-Week SAT Classes</h3>
            <p className="mt-1 text-white/85 text-sm max-w-md">Strategy, practice tests, and weekly progress checks.</p>
            <div className="mt-3">
              <Link href="/test-prep/in-person-classes" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-5 py-2.5 text-sm font-medium hover:brightness-95">Register for SAT Classes</Link>
            </div>
          </div>
          <div className="absolute inset-0 ring-1 ring-white/10" />
        </div>
        {/* Virtual 1-on-1 Tutoring */}
        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden group">
          <Image src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop" alt="Virtual 1-on-1 Tutoring" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/80">Virtual</div>
            <h3 className="mt-1 text-xl sm:text-2xl text-white font-medium">1-on-1 Tutoring Nationwide</h3>
            <p className="mt-1 text-white/85 text-sm max-w-md">Personalized tutoring for SAT, ACT, and academics.</p>
            <div className="mt-3 flex gap-3 flex-wrap">
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-5 py-2.5 text-sm font-medium hover:brightness-95">Book Virtual Tutoring</Link>
              <Link href="/subjects" className="inline-flex items-center justify-center border border-white/60 text-white px-5 py-2.5 text-sm font-medium hover:bg-white hover:text-gray-900">Browse Subjects</Link>
            </div>
          </div>
          <div className="absolute inset-0 ring-1 ring-white/10" />
        </div>
      </div>
    </section>
  );
}


