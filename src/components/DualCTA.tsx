import Link from 'next/link';
import Image from 'next/image';

export default function DualCTA() {
  return (
    <section className="pt-6 pb-4 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-4">
        {/* Free Consultation */}
        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden group">
          <Image src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop" alt="Free tutoring consultation" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="uppercase text-xs tracking-widest text-white/90 font-medium mb-1">Start Here</div>
            <h3 className="text-xl sm:text-2xl text-white font-[family-name:var(--font-playfair)]">Free Consultation</h3>
            <p className="mt-1 text-white/80 text-sm leading-relaxed max-w-md">Start with a short call to discuss your student&apos;s goals and the best next step.</p>
            <div className="mt-4">
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">Schedule Consultation</Link>
            </div>
          </div>
        </div>
        {/* Virtual 1-on-1 Tutoring */}
        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden group">
          <Image src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop" alt="Virtual 1-on-1 Tutoring" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="uppercase text-xs tracking-widest text-white/90 font-medium mb-1">Virtual</div>
            <h3 className="text-xl sm:text-2xl text-white font-[family-name:var(--font-playfair)]">1 on 1 Tutoring Nationwide</h3>
            <p className="mt-1 text-white/80 text-sm leading-relaxed max-w-md">Personalized tutoring for SAT, ACT, and academics.</p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link href="/contact" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">Book Virtual Tutoring</Link>
              <Link href="/subjects" className="inline-flex items-center justify-center border border-white/40 text-white px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors font-[family-name:var(--font-playfair)]">Browse Subjects</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

