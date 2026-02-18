"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PremiumMobileNav from './PremiumMobileNav';
import { HeaderUserMenu } from './HeaderUserMenu';

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
              <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-haspopup="true" className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <span>Menu</span>
              </button>
              {menuOpen && (
                <div className="absolute mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                  <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">Home</Link>
                  <Link href="/tutors" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">Tutors</Link>
                  <Link href="/step-up-for-students" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">Step Up For Students</Link>
                  <Link href="/contact" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">Contact</Link>
                  <Link href="/about" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">About</Link>
                </div>
              )}
            </div>

            <Link href="/" className="flex items-center">
              <Image src="/score-max-logo-nobg.png" alt="ScoreMax Logo" width={120} height={36} priority />
            </Link>

            <div className="relative">
              <button onClick={() => setServicesOpen(!servicesOpen)} aria-expanded={servicesOpen} aria-haspopup="true" className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#c79d3c] text-white text-xs font-semibold hover:brightness-95 shadow-md">
                <span>Services</span>
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 7.5L10 12.25 14.75 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {servicesOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                  <Link href="/test-prep/sat" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">SAT Tutoring</Link>
                  <Link href="/test-prep/act" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">ACT Tutoring</Link>
                  <Link href="/test-prep/in-person-classes" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">In-Person Classes</Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <Link href="/college-high-school/college-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">College Tutoring</Link>
                  <Link href="/college-high-school/high-school-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">High School Tutoring</Link>
                </div>
              )}
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
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${scrolled ? 'bg-white/98 backdrop-blur-sm shadow-sm' : 'bg-white/90 backdrop-blur-sm border-gray-100'}`}>
        <div className="w-full px-4 lg:px-6">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Logo far left */}
            <div className="justify-self-start">
              <Link href="/" className="flex items-center">
                <Image src="/score-max-logo-nobg.png" alt="ScoreMax Logo" width={120} height={36} />
              </Link>
            </div>

            {/* Desktop nav items centered with uppercase and dropdowns */}
            <div className="hidden md:flex items-center justify-center space-x-8 justify-self-center whitespace-nowrap">
              <Link href="/" className="text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap">Home</Link>
              {/* Test Prep dropdown */}
              <div className="relative group">
                <button className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">Test Prep</button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-4">
                  <div className="w-56 bg-white shadow-xl border border-gray-100 p-2">
                    <Link href="/test-prep/sat" className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">SAT</Link>
                    <Link href="/test-prep/act" className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">ACT</Link>
                    <Link href="/test-prep/in-person-classes" className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">In-Person Classes</Link>
                  </div>
                </div>
              </div>
              {/* College & High School dropdown */}
              <div className="relative group">
                <button className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">College & High School</button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-4">
                  <div className="w-72 bg-white shadow-xl border border-gray-100 p-2">
                    <Link href="/college-high-school/college-tutoring" className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">College Tutoring</Link>
                    <Link href="/college-high-school/high-school-tutoring" className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">High School Tutoring</Link>
                  </div>
                </div>
              </div>
              {/* Subjects mega dropdown */}
              <div className="relative group">
                <button className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">Subjects</button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-1/2 -translate-x-1/2 top-full pt-4">
                  <div className="w-[920px] bg-white shadow-xl border border-gray-100 p-8 grid grid-cols-12 gap-8">
                    {/* Test Prep column */}
                    <div className="col-span-3">
                      <div className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-3">Test Prep</div>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/test-prep/sat" className="block text-gray-800 hover:text-black">SAT</Link></li>
                        <li><Link href="/test-prep/act" className="block text-gray-800 hover:text-black">ACT</Link></li>
                        <li><Link href="/contact?interest=GMAT" className="block text-gray-800 hover:text-black">GMAT</Link></li>
                        <li><Link href="/contact?interest=GRE" className="block text-gray-800 hover:text-black">GRE</Link></li>
                        <li><Link href="/contact?interest=LSAT" className="block text-gray-800 hover:text-black">LSAT</Link></li>
                        <li><Link href="/contact?interest=AP%20Calculus" className="block text-gray-800 hover:text-black">AP Calculus</Link></li>
                        <li><Link href="/contact?interest=AP%20Physics" className="block text-gray-800 hover:text-black">AP Physics</Link></li>
                        <li><Link href="/contact?interest=AP%20Statistics" className="block text-gray-800 hover:text-black">AP Statistics</Link></li>
                        <li><Link href="/contact?interest=AP%20Chemistry" className="block text-gray-800 hover:text-black">AP Chemistry</Link></li>
                      </ul>
                    </div>
                    {/* High School column */}
                    <div className="col-span-3">
                      <div className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-3">High School</div>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/subjects?interest=Algebra%20I" className="block text-gray-800 hover:text-black">Algebra I</Link></li>
                        <li><Link href="/subjects?interest=Geometry" className="block text-gray-800 hover:text-black">Geometry</Link></li>
                        <li><Link href="/subjects?interest=Algebra%20II" className="block text-gray-800 hover:text-black">Algebra II</Link></li>
                        <li><Link href="/subjects?interest=Pre‑Calculus" className="block text-gray-800 hover:text-black">Pre‑Calculus</Link></li>
                        <li><Link href="/subjects?interest=Calculus" className="block text-gray-800 hover:text-black">Calculus</Link></li>
                        <li><Link href="/subjects?interest=Statistics" className="block text-gray-800 hover:text-black">Statistics</Link></li>
                        <li><Link href="/subjects?interest=All%20ACE%20Mathematics" className="block text-gray-800 hover:text-black">All ACE Mathematics</Link></li>
                        <li><Link href="/subjects?interest=Chemistry" className="block text-gray-800 hover:text-black">Chemistry</Link></li>
                        <li><Link href="/subjects?interest=Physics" className="block text-gray-800 hover:text-black">Physics</Link></li>
                        <li><Link href="/subjects?interest=Competition%20Mathematics" className="block text-gray-800 hover:text-black">Competition Mathematics</Link></li>
                      </ul>
                    </div>
                    {/* College column */}
                    <div className="col-span-3">
                      <div className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-3">College</div>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/subjects?interest=Beginning%20Algebra" className="block text-gray-800 hover:text-black">Beginning Algebra</Link></li>
                        <li><Link href="/subjects?interest=Intermediate%20Algebra" className="block text-gray-800 hover:text-black">Intermediate Algebra</Link></li>
                        <li><Link href="/subjects?interest=College%20Algebra" className="block text-gray-800 hover:text-black">College Algebra</Link></li>
                        <li><Link href="/subjects?interest=Pre%20Calculus" className="block text-gray-800 hover:text-black">Pre Calculus</Link></li>
                        <li><Link href="/subjects?interest=Statistics" className="block text-gray-800 hover:text-black">Statistics</Link></li>
                        <li><Link href="/subjects?interest=Calculus%20I%2C%20II%2C%20III" className="block text-gray-800 hover:text-black">Calculus I, II, III</Link></li>
                        <li><Link href="/subjects?interest=Linear%20Algebra" className="block text-gray-800 hover:text-black">Linear Algebra</Link></li>
                        <li><Link href="/subjects?interest=Physics" className="block text-gray-800 hover:text-black">Physics</Link></li>
                        <li><Link href="/subjects?interest=Chemistry" className="block text-gray-800 hover:text-black">Chemistry</Link></li>
                      </ul>
                    </div>
                    {/* Elementary column */}
                    <div className="col-span-3">
                      <div className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-3">Elementary</div>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/subjects?interest=Reading" className="block text-gray-800 hover:text-black">Reading</Link></li>
                        <li><Link href="/subjects?interest=Math" className="block text-gray-800 hover:text-black">Math</Link></li>
                        <li><Link href="/subjects?interest=Science" className="block text-gray-800 hover:text-black">Science</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/step-up-for-students" className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">Step Up For Students</Link>
              <Link href="/contact" className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">Get In Touch</Link>
              <Link href="/about" className="relative text-xs tracking-[0.18em] uppercase text-gray-800 hover:text-black whitespace-nowrap after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#c79d3c] hover:after:w-full after:transition-all after:duration-200">About Us</Link>
            </div>

            {/* Right icons far right */}
            <div className="flex items-center space-x-4 justify-self-end">
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
              <Image src="/logo.avif" alt="ScoreMax Logo" width={100} height={100} priority />
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-8">
            <Link href="/" className="text-gray-900 font-semibold text-sm tracking-wider hover:text-blue-600 transition-colors duration-300 relative group whitespace-nowrap">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                Test Prep
              </button>
              <div className="absolute left-0 top-full pt-3 z-50">
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-xl w-56 p-2">
                  <Link href="/test-prep/act" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">ACT</Link>
                  <Link href="/test-prep/sat" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">SAT</Link>
                  <Link href="/test-prep/in-person-classes" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">In-Person Classes</Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                College & High School
              </button>
              <div className="absolute left-0 top-full pt-3 z-50">
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-xl w-72 p-2">
                  <Link href="/college-high-school/college-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">College Tutoring</Link>
                  <Link href="/college-high-school/high-school-tutoring" className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">High School Tutoring</Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-semibold text-sm tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer">
                Subjects
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-xl w-[920px] p-8 grid grid-cols-12 gap-8">
                  <div className="col-span-4">
                    <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mb-4">Test Prep</div>
                    <div className="space-y-3 text-sm">
                      <Link href="/test-prep/sat" className="text-gray-800 hover:text-black">SAT</Link>
                      <Link href="/test-prep/act" className="text-gray-800 hover:text-black">ACT</Link>
                      <Link href="/subjects?interest=LSAT" className="text-gray-800 hover:text-black">LSAT</Link>
                      <Link href="/test-prep/in-person-classes" className="text-gray-800 hover:text-black">In‑Person SAT Classes</Link>
                      <Link href="/contact?interest=Virtual%20Tutoring" className="text-gray-800 hover:text-black">Virtual 1‑on‑1 Tutoring</Link>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mb-4">Subjects</div>
                    <div className="grid grid-cols-2 gap-x-6 text-sm">
                      <div className="space-y-3">
                        <Link href="/subjects?interest=Algebra%20I" className="text-gray-800 hover:text-black">Algebra I</Link>
                        <Link href="/subjects?interest=Algebra%20II" className="text-gray-800 hover:text-black">Algebra II</Link>
                        <Link href="/subjects?interest=Geometry" className="text-gray-800 hover:text-black">Geometry</Link>
                        <Link href="/subjects?interest=Pre‑Calculus" className="text-gray-800 hover:text-black">Pre‑Calculus</Link>
                        <Link href="/subjects?interest=Calculus" className="text-gray-800 hover:text-black">Calculus</Link>
                      </div>
                      <div className="space-y-3">
                        <Link href="/subjects?interest=Statistics" className="text-gray-800 hover:text-black">Statistics</Link>
                        <Link href="/subjects?interest=Physics" className="text-gray-800 hover:text-black">Physics</Link>
                        <Link href="/subjects?interest=Chemistry" className="text-gray-800 hover:text-black">Chemistry</Link>
                        <Link href="/subjects?interest=Reading" className="text-gray-800 hover:text-black">Reading</Link>
                        <Link href="/subjects?interest=Science" className="text-gray-800 hover:text-black">Science</Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                      <Image src="/step-up.avif" alt="Subjects" width={460} height={600} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="flex-shrink-0 flex items-center space-x-4">
            <div className="hidden sm:block">
              <Link href="/contact" className="bg-[#c79d3c] text-white px-6 py-2 rounded-full font-semibold text-xs tracking-wide uppercase shadow-lg hover:shadow-xl hover:brightness-95 transform hover:scale-105 transition-all duration-300 border border-[#c79d3c]/20">
                Book Free Consultation
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


