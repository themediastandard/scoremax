"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import PremiumMobileNav from './PremiumMobileNav';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo - Far Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/logo.avif" alt="ScoreMax Logo" width={100} height={100} priority />
            </Link>
          </div>

          {/* Desktop Nav - Center */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-8">
            <Link href="/" className="text-gray-900 font-semibold text-sm tracking-wider hover:text-blue-600 transition-colors duration-300 relative group whitespace-nowrap">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Test Prep Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                Test Prep
              </button>
              {/* Hover bridge wrapper to prevent flicker */}
              <div className="absolute left-0 top-full pt-3 z-50">
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-xl w-56 p-2">
                  <Link href="/test-prep/act" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">ACT</Link>
                  <Link href="/test-prep/sat" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">SAT</Link>
                  <Link href="/test-prep/in-person-classes" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">In-Person Classes</Link>
                </div>
              </div>
            </div>

            {/* College & High School Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                College & High School
              </button>
              {/* Hover bridge wrapper to prevent flicker */}
              <div className="absolute left-0 top-full pt-3 z-50">
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-xl w-72 p-2">
                  <Link href="/college-high-school/college-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">College Tutoring</Link>
                  <Link href="/college-high-school/high-school-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">High School Tutoring</Link>
                </div>
              </div>
            </div>

            <Link href="/tutors" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group whitespace-nowrap">
              Tutors
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link href="/step-up-for-students" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group whitespace-nowrap">
              Step Up For Students
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group whitespace-nowrap">
              Get In Touch
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 relative group whitespace-nowrap">
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>



          </div>

          {/* Right Side - CTA Button and Mobile Button */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            {/* CTA Button - Hidden on mobile */}
            <div className="hidden sm:block">
              <Link href="/contact" className="bg-[#517cad] text-white px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase shadow-lg hover:shadow-xl hover:bg-[#4568a3] transform hover:scale-105 transition-all duration-300 border border-[#517cad]/20">
                Book Free Consultation
              </Link>
            </div>

            {/* Mobile Button - Far Right */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 touch-manipulation ml-auto" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Mobile Navigation */}
      <PremiumMobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
    {/* Flow spacer to offset fixed header height so content isn't covered */}
    <div aria-hidden="true" className="h-[98px]"></div>
    </>
  );
}


