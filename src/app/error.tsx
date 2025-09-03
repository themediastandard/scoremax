'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optional: log error to monitoring service
    // console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Something went wrong</h1>
      <p className="text-gray-600 max-w-xl mb-8">An unexpected error occurred. You can try again, return home, or contact us for help.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={reset} className="bg-[#517cad] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4568a3] transition shadow-md">
          Try again
        </button>
        <Link href="/" className="border border-gray-300 px-6 py-3 rounded-full font-semibold text-gray-800 hover:bg-gray-50 transition">
          Go to Home
        </Link>
      </div>
    </main>
  );
}


