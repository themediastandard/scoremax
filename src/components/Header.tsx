"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center h-24">
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
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-xl w-56 p-2">
                <Link href="/test-prep/act" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">ACT</Link>
                <Link href="/test-prep/sat" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">SAT</Link>
                <Link href="/test-prep/in-person-classes" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">In-Person Classes</Link>
              </div>
            </div>

            {/* College & High School Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                College & High School
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-xl w-72 p-2">
                <Link href="/college-high-school/college-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">College Tutoring</Link>
                <Link href="/college-high-school/high-school-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">High School Tutoring</Link>
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

          {/* CTA Button - Far Right */}
          <div className="flex-shrink-0 hidden sm:block">
            <Link href="/contact" className="bg-[#517cad] text-white px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase shadow-lg hover:shadow-xl hover:bg-[#4568a3] transform hover:scale-105 transition-all duration-300 border border-[#517cad]/20">
              Book Free Consultation
            </Link>
          </div>

          {/* Mobile Button */}
          <button 
            className="lg:hidden ml-4 p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 touch-manipulation" 
            onClick={() => setMobileOpen(!mobileOpen)} 
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="w-full px-6 py-6 space-y-1">
            <Link 
              href="/" 
              className="block py-4 px-2 text-gray-800 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            
            <div className="pt-2">
              <div className="text-gray-500 uppercase text-xs tracking-wider mb-3 px-2 font-semibold">Test Prep</div>
              <div className="pl-4 space-y-1">
                <Link 
                  href="/test-prep/act" 
                  className="block py-3 px-2 text-gray-700 text-base rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  onClick={() => setMobileOpen(false)}
                >
                  ACT
                </Link>
                <Link 
                  href="/test-prep/sat" 
                  className="block py-3 px-2 text-gray-700 text-base rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  onClick={() => setMobileOpen(false)}
                >
                  SAT
                </Link>
                <Link 
                  href="/test-prep/in-person-classes" 
                  className="block py-3 px-2 text-gray-700 text-base rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  onClick={() => setMobileOpen(false)}
                >
                  In-Person Classes
                </Link>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-gray-500 uppercase text-xs tracking-wider mb-3 px-2 font-semibold">College & High School</div>
              <div className="pl-4 space-y-1">
                <Link 
                  href="/college-high-school/college-tutoring" 
                  className="block py-3 px-2 text-gray-700 text-base rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  onClick={() => setMobileOpen(false)}
                >
                  College Tutoring
                </Link>
                <Link 
                  href="/college-high-school/high-school-tutoring" 
                  className="block py-3 px-2 text-gray-700 text-base rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  onClick={() => setMobileOpen(false)}
                >
                  High School Tutoring
                </Link>
              </div>
            </div>
            
            <Link 
              href="/tutors" 
              className="block py-4 px-2 text-gray-800 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
              onClick={() => setMobileOpen(false)}
            >
              Tutors
            </Link>
            <Link 
              href="/step-up-for-students" 
              className="block py-4 px-2 text-gray-800 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
              onClick={() => setMobileOpen(false)}
            >
              Step Up For Students
            </Link>
            <Link 
              href="/contact" 
              className="block py-4 px-2 text-gray-800 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
              onClick={() => setMobileOpen(false)}
            >
              Get In Touch
            </Link>
            <Link 
              href="/about" 
              className="block py-4 px-2 text-gray-800 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>

            <div className="pt-4 border-t border-gray-200 mt-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center w-full bg-[#517cad] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-[#4568a3] transition-all duration-200 touch-manipulation"
                onClick={() => setMobileOpen(false)}
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


