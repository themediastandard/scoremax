import Image from 'next/image';
import Link from 'next/link';

export default function StepUpSection() {
  return (
    <section className="py-10 bg-[#fff6f6]">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-transparent md:order-1 order-2 flex items-center justify-start">
          <Image src="/step-up.avif" alt="Step Up for Students" width={800} height={600} className="w-auto h-[148px] sm:h-[175px] md:h-[200px] lg:h-[235px]" />
        </div>
        <div className="md:order-2 order-1">
          <div className="text-[11px] tracking-[0.2em] uppercase text-gray-500">Florida Scholarship Provider</div>
          <h3 className="mt-2 text-2xl sm:text-3xl font-medium text-gray-900">Step Up For Students Provider</h3>
          <p className="mt-3 text-gray-700 text-sm sm:text-base leading-relaxed">
            Being a Step Up For Students provider for the State of Florida is a huge financial convenience for
            homeschool and private school families. We help families access scholarships and deliver expert
            tutoring that fits both budget and schedule.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/step-up-for-students" className="inline-flex items-center justify-center bg-red-200 text-red-800 px-5 py-2.5 text-sm font-medium border border-red-300 hover:bg-red-300">Learn About Step Up</Link>
            <Link href="/contact" className="inline-flex items-center justify-center border border-gray-300 text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">Check Eligibility</Link>
          </div>
          <div className="mt-4 text-xs text-gray-500">SAT • ACT • Elementary • Middle • High School • College</div>
        </div>
      </div>
    </section>
  );
}


