'use client'

import { useState } from 'react'

export function StepUpForm() {
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
      const res = await fetch('/api/step-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit registration')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Email Address <span className="text-[#b08a30]">*</span></label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block font-[family-name:var(--font-playfair)] text-sm text-gray-900 mb-2">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#b08a30] focus:border-gray-200 focus:outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
          placeholder="Enter your phone number"
        />
      </div>

      {status === 'success' && (
        <p className="text-green-600 text-sm">Thank you! We have received your registration and will be in touch shortly.</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#b08a30] text-white px-6 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Submitting...' : 'Start Your Tutoring Journey'}
        </button>
      </div>
    </form>
  )
}
