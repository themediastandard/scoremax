"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PremiumMobileNav from './PremiumMobileNav';
import { HeaderUserMenu } from './HeaderUserMenu';
import { TutoringMenu } from './TutoringMenu';
import { siteImages } from '@/lib/site-images';

type HeaderVariant = 'default' | 'minimal' | 'ogee';

interface HeaderProps {
  variant?: HeaderVariant;
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [servicesOpen, setServicesOpen] = useState(false);

  if (variant === 'minimal') {
    return (
      <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${scrolled ? 'bg-white/98 backdrop-blur-sm shadow-sm' : 'bg-white/90 backdrop-blur-sm border-gray-100'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-haspopup="true" className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 font-[family-name:var(--font-playfair)]">
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <span>Menu</span>
              </button>
              {menuOpen && (
                <div className="absolute mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50 uppercase font-[family-name:var(--font-playfair)]">
                  <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-base text-gray-700">Home</Link>
                  <Link href="/tutors" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-base text-gray-700">Tutors</Link>
                  <Link href="/step-up-for-students" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-base text-gray-700">Scholarship</Link>
                  <Link href="/about" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-base text-gray-700">About</Link>
                  <Link href="/contact" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-base text-gray-700">Contact</Link>
                </div>
              )}
            </div>

            <Link href="/" className="flex items-center">
              <Image src={siteImages.logoWide} alt="ScoreMax Logo" width={140} height={32} priority className="h-6 w-auto" />
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/book" className="hidden sm:inline-flex items-center justify-center bg-[#b08a30] text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wide uppercase hover:brightness-95 transition-colors font-[family-name:var(--font-playfair)]">
                Book A Session
              </Link>
              <div className="relative">
              <button onClick={() => setServicesOpen(!servicesOpen)} aria-expanded={servicesOpen} aria-haspopup="true" className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#b08a30] text-white text-xs font-semibold hover:brightness-95 shadow-md font-[family-name:var(--font-playfair)]">
                <span>Services</span>
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 7.5L10 12.25 14.75 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {servicesOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl border border-gray-100/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border-t-2 border-t-[#b08a30] z-50 min-w-[680px] overflow-hidden font-[family-name:var(--font-playfair)]">
                  <div className="grid grid-cols-3 py-5">
                    <div className="px-6">
<div className="font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#b08a30] tracking-wider uppercase">Test Prep</div>
                          <div className="w-5 h-0.5 bg-[#b08a30]/60 mt-1.5 mb-2 rounded-full" />
                          <div className="space-y-0.5">
                            <Link href="/test-prep/sat" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">SAT Tutoring</Link>
                            <Link href="/test-prep/act" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">ACT Tutoring</Link>
                            <Link href="/test-prep/lsat" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">LSAT Tutoring</Link>
                            <Link href="/test-prep/gre" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">GRE Tutoring</Link>
                            <Link href="/test-prep/gmat" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">GMAT Tutoring</Link>
                          </div>
                    </div>
                    <div className="px-6 border-l border-gray-100">
                      <div className="font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#b08a30] tracking-wider uppercase">Academic</div>
                      <div className="w-5 h-0.5 bg-[#b08a30]/60 mt-1.5 mb-2 rounded-full" />
                      <div className="space-y-0.5">
                        <Link href="/college-tutoring" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">College Tutoring</Link>
                        <Link href="/high-school-tutoring" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">High School Tutoring</Link>
                        <Link href="/middle-school-tutoring" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">Middle School Tutoring</Link>
                        <Link href="/elementary-tutoring" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">Elementary Tutoring</Link>
                      </div>
                    </div>
                    <div className="px-6 border-l border-gray-100">
                      <div className="font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#b08a30] tracking-wider uppercase">Subjects</div>
                      <div className="w-5 h-0.5 bg-[#b08a30]/60 mt-1.5 mb-2 rounded-full" />
                      <Link href="/subjects" onClick={() => setServicesOpen(false)} className="block py-1.5 px-2 -mx-2 rounded-md text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors">Browse All Subjects</Link>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div aria-hidden="true" className="h-16"></div>
      </>
    );
  }

  if (variant === 'ogee') {
    return (
      <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? 'bg-white/98 backdrop-blur-sm shadow-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
        <div className="w-full px-4 lg:px-6">
          {/* Flex below md: a 3-column grid gives the logo a 1/3-width cell on
              phones, and next/image's max-width:100% squashes it inside that. */}
          <div className="flex items-center justify-between h-16 md:grid md:grid-cols-3">
            {/* Logo far left */}
            <div className="md:justify-self-start shrink-0">
              <Link href="/" className="flex items-center">
                <Image src={siteImages.logoWide} alt="ScoreMax Logo" width={140} height={32} className="h-6 w-auto max-w-none" />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center justify-center justify-self-center font-[family-name:var(--font-playfair)] uppercase">
              <div className="flex items-center gap-7">
                <Link href="/" className="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap">Home</Link>
                <TutoringMenu buttonClassName="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 uppercase" />
                <Link href="/step-up-for-students" className="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap">Scholarship</Link>
                <Link href="/pricing" className="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap">Pricing</Link>
                <Link href="/about" className="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap">About Us</Link>
                <Link href="/contact" className="text-[15px] font-medium tracking-wide text-gray-800 hover:text-[#b08a30] transition-colors whitespace-nowrap">Contact</Link>
              </div>
            </div>

            {/* Right icons far right */}
            <div className="flex items-center gap-2 md:gap-4 md:justify-self-end">
              <Link href="/book" className="hidden md:inline-flex items-center justify-center bg-[#b08a30] text-white px-5 py-2 rounded-full font-semibold text-xs tracking-wide uppercase hover:brightness-95 transition-colors font-[family-name:var(--font-playfair)]">
                Book A Session
              </Link>
              <HeaderUserMenu />
              {/* Mobile burger */}
              <button 
                className="md:hidden p-2 rounded hover:bg-gray-100" 
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle Menu"
                aria-expanded={mobileOpen}
              >
                <div className="w-6 h-6 flex flex-col justify-center">
                  <span className={`block h-0.5 w-6 bg-gray-700 ${mobileOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                  <span className={`block h-0.5 w-6 bg-gray-700 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block h-0.5 w-6 bg-gray-700 ${mobileOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <PremiumMobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </nav>
      <div aria-hidden="true" className="h-16"></div>
      </>
    );
  }

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${scrolled ? 'bg-white/98 backdrop-blur-sm shadow-sm' : 'bg-white/90 backdrop-blur-sm border-gray-100'}`}>
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src={siteImages.logoWide} alt="ScoreMax Logo" width={140} height={32} priority className="h-6 w-auto" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-center flex-1 uppercase font-[family-name:var(--font-playfair)]">
            <div className="flex items-center divide-x divide-gray-200">
              <Link href="/" className="px-4 text-base text-gray-500 hover:text-[#b08a30] transition-colors duration-200 whitespace-nowrap">
                Home
              </Link>
              <div className="px-4">
                <TutoringMenu buttonClassName="text-base text-gray-500 hover:text-[#b08a30] transition-colors duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 uppercase" />
              </div>
              <Link href="/step-up-for-students" className="px-4 text-base text-gray-500 hover:text-[#b08a30] transition-colors duration-200 whitespace-nowrap">
                Scholarship
              </Link>
              <Link href="/about" className="px-4 text-base text-gray-500 hover:text-[#b08a30] transition-colors duration-200 whitespace-nowrap">
                About Us
              </Link>
              <Link href="/contact" className="px-4 text-base text-gray-500 hover:text-[#b08a30] transition-colors duration-200 whitespace-nowrap">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/contact" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase hover:bg-gray-50 transition-colors font-[family-name:var(--font-playfair)]">
                Book Free Consultation
              </Link>
              <Link href="/book" className="bg-[#b08a30] text-white px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase shadow-lg hover:shadow-xl hover:brightness-95 transform hover:scale-105 transition-all duration-300 border border-[#b08a30]/20 font-[family-name:var(--font-playfair)]">
                Book A Session
              </Link>
            </div>
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

      <PremiumMobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
    <div aria-hidden="true" className="h-[98px]"></div>
    </>
  );
}
