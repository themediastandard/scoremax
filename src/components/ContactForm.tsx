'use client'

import { useState } from 'react'
import { User, Mail, Phone, BookOpen, FileText, Sparkles, Target, HelpCircle } from 'lucide-react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries()) as Record<string, string>

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: data.studentName,
          email: data.email,
          phone: data.phone,
          currentCourses: data.currentCourses,
          psatScores: data.psatScores,
          satScores: data.satScores,
          actScores: data.actScores,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          helpNeeded: data.helpNeeded,
          company: data.company,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to send message')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/*
        Honeypot. Positioned off-screen rather than display:none, because some
        bots skip hidden inputs but fill anything they can parse. aria-hidden
        and tabIndex keep it away from screen readers and keyboard users, and
        autoComplete="off" stops a browser helpfully filling it in.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label htmlFor="company">Company (leave this field empty)</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="studentName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#b08a30]" />
          </div>
          Student Name & Current School
        </label>
        <input
          type="text"
          id="studentName"
          name="studentName"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter student name and school"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-[#b08a30]" />
          </div>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-[#b08a30]" />
          </div>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <label htmlFor="currentCourses" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[#b08a30]" />
          </div>
          Current Math & English Course
        </label>
        <input
          type="text"
          id="currentCourses"
          name="currentCourses"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter current math and English courses"
        />
      </div>

      <div>
        <label htmlFor="psatScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#b08a30]" />
          </div>
          Past PSAT Scores
        </label>
        <input
          type="text"
          id="psatScores"
          name="psatScores"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter PSAT scores"
        />
      </div>

      <div>
        <label htmlFor="satScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#b08a30]" />
          </div>
          Past SAT Scores
        </label>
        <input
          type="text"
          id="satScores"
          name="satScores"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter SAT scores"
        />
      </div>

      <div>
        <label htmlFor="actScores" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#b08a30]" />
          </div>
          Past ACT Scores
        </label>
        <input
          type="text"
          id="actScores"
          name="actScores"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm"
          placeholder="Enter ACT scores"
        />
      </div>

      <div>
        <label htmlFor="strengths" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#b08a30]" />
          </div>
          What do you believe are your strengths?
        </label>
        <textarea
          id="strengths"
          name="strengths"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
          placeholder="Describe your academic strengths"
        />
      </div>

      <div>
        <label htmlFor="weaknesses" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-[#b08a30]" />
          </div>
          What do you believe your weaknesses are?
        </label>
        <textarea
          id="weaknesses"
          name="weaknesses"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
          placeholder="Describe areas where you need improvement"
        />
      </div>

      <div>
        <label htmlFor="helpNeeded" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b08a30]/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-[#b08a30]" />
          </div>
          What do you believe you need the most help in?
        </label>
        <textarea
          id="helpNeeded"
          name="helpNeeded"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-sm resize-none"
          placeholder="Describe the areas where you need the most assistance"
        />
      </div>

      {/*
        Always mounted, so assistive tech has the live region under observation
        before the text arrives. A region that appears at the same moment as its
        content is frequently not announced at all.

        role="status" (polite) rather than "alert": the message follows a
        deliberate submit, so it does not need to interrupt.

        Colours are darkened from the Tailwind 600 steps, which fall just under
        4.5:1 on white for this text size (WCAG 1.4.3), and each message carries
        a word — "Error"/"Sent" — so the meaning does not rest on colour alone
        (1.4.1).
      */}
      <div role="status" aria-live="polite" className="min-h-[1.25rem]">
        {status === 'success' && (
          <p className="text-green-800 text-sm">
            <strong>Sent.</strong> Thank you! We have received your message and will be
            in touch soon.
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {errorMessage}
          </p>
        )}
      </div>

      <div className="pt-8">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#b08a30] text-white px-8 py-4 text-sm font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
