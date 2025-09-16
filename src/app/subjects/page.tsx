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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-medium text-gray-900">Choose a Subject</h1>
        <p className="mt-2 text-sm text-gray-600">Pick the subject you need help with and we’ll match you with the right plan.</p>

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="border border-gray-200 p-5 bg-white">
              <h2 className="text-lg font-medium text-gray-900">{cat.title}</h2>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                {cat.items.map((item) => (
                  <li key={item}>
                    <Link href={`/contact?interest=${encodeURIComponent(item)}`} className="hover:underline">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/contact" className="inline-flex items-center justify-center bg-[#c79d3c] text-white px-5 py-2 text-sm">Not sure? Talk to us</Link>
        </div>
      </div>
    </div>
  );
}




