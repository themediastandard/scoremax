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

      {status === 'success' && (
        <p className="text-green-600 text-sm">Thank you! We have received your message and will be in touch soon.</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}

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
