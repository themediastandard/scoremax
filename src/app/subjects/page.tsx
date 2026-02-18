import Link from 'next/link';

const categories = [
  {
    title: 'Test Prep Tutoring',
    items: ['SAT', 'ACT', 'GMAT', 'GRE', 'LSAT', 'AP Calculus', 'AP Physics', 'AP Statistics', 'AP Chemistry']
  },
  {
    title: 'High School Tutoring',
    items: ['Algebra I', 'Geometry', 'Algebra II', 'Pre‑Calculus', 'Calculus', 'Statistics', 'All ACE Mathematics', 'Chemistry', 'Physics', 'Competition Mathematics']
  },
  {
    title: 'College Tutoring',
    items: ['Beginning Algebra', 'Intermediate Algebra', 'College Algebra', 'Pre‑Calculus', 'Statistics', 'Calculus I, II, III', 'Linear Algebra', 'Physics', 'Chemistry']
  },
  {
    title: 'Elementary Tutoring',
    items: ['Reading', 'Math', 'Science']
  }
];

export default function SubjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">Our Subjects</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-gray-900 mb-4">
            Choose a Subject
          </h1>
          <div className="w-10 h-[2px] bg-[#c79d3c] mx-auto mb-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            Pick the subject you need help with and we&apos;ll match you with the right plan.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-gray-900 mb-4">{cat.title}</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {cat.items.map((item) => (
                    <li key={item}>
                      <Link href={`/contact?interest=${encodeURIComponent(item)}`} className="hover:text-[#c79d3c] transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-6 py-3 text-sm font-medium hover:bg-[#b08a30] transition-colors">
              Not Sure? Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
