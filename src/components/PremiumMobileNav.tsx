'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
          { label: 'LSAT Tutoring', href: '/test-prep/lsat' },
          { label: 'GRE Tutoring', href: '/test-prep/gre' },
          { label: 'GMAT Tutoring', href: '/test-prep/gmat' }
        ]
      },
      {
        title: 'Academic Tutoring',
        links: [
          { label: 'College Tutoring', href: '/college-tutoring' },
          { label: 'High School Tutoring', href: '/high-school-tutoring' },
          { label: 'Middle School Tutoring', href: '/middle-school-tutoring' },
          { label: 'Elementary Tutoring', href: '/elementary-tutoring' },
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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** The element focused before the drawer opened, so focus can go back to it. */
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /*
   * The drawer covers the page, so it has to behave like a modal dialog:
   * Escape closes it, Tab cycles inside it rather than wandering into the
   * page behind, and focus returns to the trigger on close (WCAG 2.1.2 and
   * 2.4.3). Without the trap, tabbing from the last link moved focus to
   * offscreen page content with no visible indicator anywhere.
   */
  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

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
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden premium-backdrop"
        onClick={onClose}
      />

      {/* Navigation Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
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
        <div className="flex items-center justify-end p-6 border-b border-gray-100 bg-[#b08a30]">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 touch-manipulation"
            aria-label="Close menu"
          >
            <svg aria-hidden="true" focusable="false" className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      aria-expanded={expandedItems.has(item.label)}
                      aria-controls={`mobile-nav-panel-${item.label}`}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-900 text-xl uppercase">{item.label}</span>
                      </div>
                      <div className={`transform transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''}`}>
                        <svg aria-hidden="true" focusable="false" className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {/*
                      Rendered only when expanded. The previous version kept the
                      panel mounted and collapsed it with max-h-0 + opacity-0,
                      which hides it visually but leaves every link focusable —
                      so Tab walked into seven invisible destinations.
                    */}
                    {expandedItems.has(item.label) && (
                    <div id={`mobile-nav-panel-${item.label}`}>
                      <div className="pl-6 pr-4 py-2 space-y-4">
                        {item.sections.map((section) => (
                          <div key={section.title}>
                            <div className="font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#b08a30] tracking-wider uppercase mb-1.5">{section.title}</div>
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
                    )}
                  </div>
                ) : 'children' in item && item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      aria-expanded={expandedItems.has(item.label)}
                      aria-controls={`mobile-nav-panel-${item.label}`}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-900 text-xl uppercase">{item.label}</span>
                      </div>
                      <div className={`transform transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''}`}>
                        <svg aria-hidden="true" focusable="false" className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedItems.has(item.label) && (
                    <div id={`mobile-nav-panel-${item.label}`}>
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
                    )}
                  </div>
                ) : 'href' in item && item.href ? (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 touch-manipulation group touch-feedback"
                  >
                    <span className="font-medium text-gray-900 text-xl group-hover:text-[#b08a30] transition-colors duration-200 uppercase">
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
            className="w-full bg-[#b08a30] text-white px-6 py-4 rounded-none font-medium text-sm hover:brightness-95 transition shadow-md hover:shadow-lg duration-200 whitespace-nowrap inline-flex items-center justify-center touch-manipulation min-h-[48px] font-[family-name:var(--font-playfair)]"
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
