'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

/**
 * The "Tutoring" mega-menu in the desktop header.
 *
 * Replaces a CSS-only `group-hover:visible` panel. That version could not be
 * opened without a pointer: the trigger was focusable, but Enter and Space did
 * nothing and the panel's visibility was driven purely by :hover, so the seven
 * destinations inside were unreachable by keyboard (WCAG 2.1.1) and invisible
 * to screen readers. It also hard-coded aria-expanded="false" while open, which
 * actively misreported its state.
 *
 * Now the panel is state-driven and opens on hover *and* on click/Enter/Space,
 * closes on Escape (returning focus to the trigger, per 2.4.3), on outside
 * pointer-down, and when focus leaves the menu entirely. Links inside are
 * unmounted while closed so they never sit in the tab order invisibly.
 *
 * The same markup backs all three header variants, which previously carried
 * three hand-maintained copies of this panel.
 */

const SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Test Prep',
    links: [
      { label: 'SAT Tutoring', href: '/test-prep/sat' },
      { label: 'ACT Tutoring', href: '/test-prep/act' },
      { label: 'LSAT Tutoring', href: '/test-prep/lsat' },
      { label: 'GRE Tutoring', href: '/test-prep/gre' },
      { label: 'GMAT Tutoring', href: '/test-prep/gmat' },
    ],
  },
  {
    title: 'Academic',
    links: [
      { label: 'College Tutoring', href: '/college-tutoring' },
      { label: 'High School Tutoring', href: '/high-school-tutoring' },
      { label: 'Middle School Tutoring', href: '/middle-school-tutoring' },
      { label: 'Elementary Tutoring', href: '/elementary-tutoring' },
    ],
  },
  {
    title: 'Subjects',
    links: [{ label: 'Browse All Subjects', href: '/subjects' }],
  },
]

export function TutoringMenu({
  buttonClassName,
  align = 'center',
}: {
  buttonClassName: string
  /** Where the panel hangs relative to the trigger. */
  align?: 'center' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  /**
   * Whether the pointer is currently over the menu.
   *
   * Without this, a mouse user hovering the trigger opens the panel, and their
   * click then toggles it straight back shut — the menu looked broken to the
   * mouse, which is how it behaved before this guard was added. A keyboard user
   * never fires mouseenter, so for them `false` holds and the click toggles
   * normally.
   */
  const hoveringRef = useRef(false)

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        // Focus has to go somewhere predictable, or Escape strands the user at
        // the top of the document.
        buttonRef.current?.focus()
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }

    // focusin on the document catches tabbing out of the panel in either
    // direction, which a blur handler on the wrapper alone does not.
    function onFocusIn(e: FocusEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open])

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        hoveringRef.current = true
        setOpen(true)
      }}
      onMouseLeave={() => {
        hoveringRef.current = false
        setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          // Hover already opened it; a toggle here would close it on the way in.
          if (hoveringRef.current) {
            setOpen(true)
            return
          }
          setOpen((v) => !v)
        }}
        className={buttonClassName}
      >
        Tutoring
        <svg
          aria-hidden="true"
          focusable="false"
          className={`w-4 h-4 text-[#b08a30] transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute top-full pt-3 z-50 ${
            align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <div className="bg-white border border-gray-100/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border-t-2 border-t-[#b08a30] min-w-[680px] overflow-hidden font-[family-name:var(--font-playfair)]">
            <div className="grid grid-cols-3 py-5">
              {SECTIONS.map((section, i) => (
                <div
                  key={section.title}
                  className={`px-6 ${i > 0 ? 'border-l border-gray-100' : ''}`}
                >
                  <h2 className="font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#b08a30] tracking-wider uppercase">
                    {section.title}
                  </h2>
                  <div className="w-5 h-0.5 bg-[#b08a30]/60 mt-1.5 mb-2" />
                  <div className="space-y-0.5">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-1.5 px-2 -mx-2 text-[14px] text-gray-700 hover:text-[#b08a30] hover:bg-[#b08a30]/8 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
