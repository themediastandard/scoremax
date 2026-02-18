'use client';

import Link from 'next/link';
import { useState } from 'react';

interface PremiumMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  links: { label: string; href: string }[];
}

interface TutoringNavItem {
  label: string;
  sections?: NavSection[];
}

const navItems: (NavItem | TutoringNavItem)[] = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'Tutoring',
    sections: [
      {
        title: 'Test Prep',
        links: [
          { label: 'SAT Tutoring', href: '/test-prep/sat' },
          { label: 'ACT Tutoring', href: '/test-prep/act' },
          { label: 'In-Person Classes', href: '/test-prep/in-person-classes' }
        ]
      },
      {
        title: 'Academic Tutoring',
        links: [
          { label: 'College Tutoring', href: '/college-high-school/college-tutoring' },
          { label: 'High School Tutoring', href: '/college-high-school/high-school-tutoring' },
          { label: 'Subjects', href: '/subjects' }
        ]
      }
    ]
  },
  {
    label: 'Tutors',
    href: '/tutors'
  },
  {
    label: 'Pricing',
    href: '/pricing'
  },
  {
    label: 'Scholarship',
    href: '/step-up-for-students'
  },
  {
    label: 'About Us',
    href: '/about'
  },
  {
    label: 'Contact',
    href: '/contact'
  },
  {
    label: 'Client Login',
    href: '/login'
  }
];

export default function PremiumMobileNav({ isOpen, onClose }: PremiumMobileNavProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const handleLinkClick = () => {
    onClose();
    setExpandedItems(new Set());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden premium-backdrop"
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-sm shadow-2xl z-50 lg:hidden premium-mobile-nav" 
        style={{ 
          backgroundColor: '#ffffff',
          background: '#ffffff',
          opacity: 1,
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '100%',
          maxWidth: '24rem',
          zIndex: 50
        }}
      >
        {/* Header (brand removed per request) */}
        <div className="flex items-center justify-end p-6 border-b border-gray-100 bg-[#c79d3c]">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 touch-manipulation"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-6 space-y-2 font-[family-name:var(--font-playfair)]">
            {navItems.map((item) => (
              <div key={item.label} className="premium-nav-item">
                {'sections' in item && item.sections ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-900 text-xl uppercase">{item.label}</span>
                      </div>
                      <div className={`transform transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-out ${
                      expandedItems.has(item.label) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pl-6 pr-4 py-2 space-y-4">
                        {item.sections.map((section) => (
                          <div key={section.title}>
                            <div className="text-[12px] font-semibold text-[#c79d3c] tracking-wider uppercase mb-1.5">{section.title}</div>
                            <div className="space-y-1">
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={handleLinkClick}
                                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation group touch-feedback"
                                >
                                  <span className="font-medium text-gray-700 text-base group-hover:text-gray-900 transition-colors duration-200 uppercase">
                                    {link.label}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : 'children' in item && item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-900 text-xl uppercase">{item.label}</span>
                      </div>
                      <div className={`transform transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-out ${
                      expandedItems.has(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pl-6 pr-4 py-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href!}
                            onClick={handleLinkClick}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation group touch-feedback"
                          >
                            <span className="font-medium text-gray-700 text-base group-hover:text-gray-900 transition-colors duration-200 uppercase">
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : 'href' in item && item.href ? (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                  >
                    <span className="font-medium text-gray-900 text-xl group-hover:text-[#c79d3c] transition-colors duration-200 uppercase">
                      {item.label}
                    </span>
                  </Link>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <Link
            href="/contact"
            onClick={handleLinkClick}
            className="w-full bg-[#c79d3c] text-white px-6 py-4 rounded-none font-medium text-sm hover:brightness-95 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center touch-manipulation min-h-[48px] font-[family-name:var(--font-playfair)]"
          >
            Book Free Consultation
          </Link>
          <p className="text-center text-sm text-gray-500 mt-3">
            Get started with expert tutoring today
          </p>
        </div>
      </div>
    </>
  );
}
