import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 max-w-xl mb-8">
        The page you’re looking for doesn’t exist or may have moved. Try returning home or contact us and we’ll help you find what you need.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="bg-[#517cad] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4568a3] transition shadow-md">
          Go to Home
        </Link>
        <Link href="/contact" className="border border-gray-300 px-6 py-3 rounded-full font-semibold text-gray-800 hover:bg-gray-50 transition">
          Contact Us
        </Link>
      </div>
    </main>
  );
}


