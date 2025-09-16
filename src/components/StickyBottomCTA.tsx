"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface StickyBottomCTAProps {
  href: string;
  label?: string;
}

export default function StickyBottomCTA({ href, label = 'Book Now' }: StickyBottomCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 bottom-4 sm:bottom-6 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-24'
      }`}
    >
      <div className="mx-auto max-w-md px-4">
        <Link
          href={href}
          className="block w-full text-center rounded-full bg-[#c79d3c] text-white px-6 py-4 font-bold shadow-2xl hover:brightness-95"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}


