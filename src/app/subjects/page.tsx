import Link from 'next/link';

const categories = [
  {
    title: 'Test Prep Tutoring',
    blurb: 'Our test prep experts specialize in standardized exams and AP courses. We combine proven strategies with targeted practice to help students achieve their best possible scores. Whether you are preparing for college entrance exams or advanced placement tests, our tutors bring deep knowledge of test format, timing, and scoring.',
    items: ['SAT', 'ACT', 'GMAT', 'GRE', 'LSAT', 'AP Calculus', 'AP Physics', 'AP Statistics', 'AP Chemistry']
  },
  {
    title: 'High School Tutoring',
    blurb: 'ScoreMax tutors excel in high school math and science. We build strong foundations in algebra and geometry, advance students through calculus and physics, and support competitive mathematics. Our approach emphasizes conceptual understanding so students master material rather than memorize it.',
    items: ['Algebra I', 'Geometry', 'Algebra II', 'Pre‑Calculus', 'Calculus', 'Statistics', 'All ACE Mathematics', 'Chemistry', 'Physics', 'Competition Mathematics']
  },
  {
    title: 'College Tutoring',
    blurb: 'We provide expert support for college-level mathematics and sciences. Our tutors hold advanced degrees and experience teaching at the university level. From remedial algebra through multivariable calculus and linear algebra, we help students overcome challenging coursework and develop lasting academic skills.',
    items: ['Beginning Algebra', 'Intermediate Algebra', 'College Algebra', 'Pre‑Calculus', 'Statistics', 'Calculus I, II, III', 'Linear Algebra', 'Physics', 'Chemistry']
  },
  {
    title: 'Elementary Tutoring',
    blurb: 'Our elementary tutors foster a love of learning in reading, math, and science. We create a supportive environment where young students build confidence and strong fundamentals that set them up for long-term success. Sessions are engaging and tailored to each child\'s pace and learning style.',
    items: ['Reading', 'Math', 'Science']
  }
];

export default function SubjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Subjects We Cover
          </h1>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Our tutors bring deep expertise across test prep, high school, college, and elementary subjects. 
            We match each student with instructors who specialize in their area of need, ensuring focused, 
            effective instruction tailored to individual goals.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white rounded-2xl border border-gray-100 p-6 border-l-4 border-l-[#b08a30] hover:border-[#b08a30]/30 transition-colors">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#b08a30] mb-3">{cat.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {cat.blurb}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-[#b08a30]/5 border border-[#b08a30]/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Get Started</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">Ready to Book a Session?</h2>
          <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Choose a subject above to share your interest, or book directly. We will match you with an expert tutor who fits your goals and schedule.
          </p>
          <Link href="/book" className="inline-flex items-center justify-center bg-[#b08a30] text-white px-8 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)]">
            Book A Session
          </Link>
        </div>
      </section>
    </div>
  );
}
