import Image from 'next/image';
import Link from 'next/link';

export default function StepUpSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-transparent md:order-1 order-2 flex items-center justify-start">
          <Image src="/step-up.avif" alt="Step Up for Students" width={800} height={600} className="w-auto h-[148px] sm:h-[175px] md:h-[200px] lg:h-[235px]" />
        </div>
        <div className="md:order-2 order-1">
          <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Florida Scholarship Provider</div>
          <h3 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-1">Step Up For Students</h3>
          <div className="w-10 h-[2px] bg-[#c79d3c] mt-4 mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed">
            Being a Step Up For Students provider for the State of Florida is a huge financial convenience for
            homeschool and private school families. We help families access scholarships and deliver expert
            tutoring that fits both budget and schedule.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/step-up-for-students" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">Learn About Step Up</Link>
            <Link href="/contact" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors">Check Eligibility</Link>
          </div>
          <div className="mt-5 text-xs text-gray-400">SAT  ·  ACT  ·  Elementary  ·  Middle  ·  High School  ·  College</div>
        </div>
      </div>
    </section>
  );
}


