'use client'

import { useRef, useState } from 'react'
import { User, Mail, Phone, BookOpen, FileText, MessageSquare } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

/**
 * Public contact form, split into two intents.
 *
 * "Inquiry" is a short question. The academic intake (courses, scores, goals)
 * only appears under "Consultation Inquiry", where someone has already decided
 * they want a call and the extra length is worth it.
 *
 * These are two *intents*, not two halves of one submission, which is what
 * makes tabs the right control here rather than a wizard. Two consequences the
 * implementation depends on:
 *
 *  - Only the active tab is mounted. A hidden-but-mounted panel still submits
 *    its inputs, so the server would receive consultation answers on a general
 *    enquiry.
 *  - Name / email / phone are shared state, so switching tabs after typing them
 *    does not throw the work away. The tab-specific answers are kept too, for
 *    the same reason.
 *
 * The layout is deliberately dense. The first version stacked every field
 * full-width with a 40px icon tile above it and 32px between them, which cost
 * 126px per field — the consultation tab ran to roughly 1450px, and 400px of
 * that was decoration. Icons are now inline with the label text, short fields
 * pair up on two columns, the three score boxes share one row, and the three
 * overlapping free-text questions became one.
 */

type InquiryType = 'general' | 'consultation'

const INPUT_CLASS =
  'w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-base'

const LABEL_CLASS =
  'font-[family-name:var(--font-playfair)] text-base text-gray-900 mb-2.5 flex items-center gap-2.5'

/** Marks a required field visually. `aria-hidden` because the `required`
 *  attribute already conveys this to assistive tech — announcing both reads as
 *  "required star required". */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-[#b08a30]">
      *
    </span>
  )
}

function TextField({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  name: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        <Icon className="w-5 h-5 text-[#b08a30] flex-shrink-0" />
        {label}
        {required && <RequiredMark />}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
        placeholder={placeholder}
      />
    </div>
  )
}

function TextAreaField({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  hint,
  rows = 5,
  required = false,
}: {
  name: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  onChange: (value: string) => void
  placeholder: string
  hint?: string
  rows?: number
  required?: boolean
}) {
  const hintId = hint ? `${name}-hint` : undefined
  return (
    <div>
      <label
        htmlFor={name}
        className={
          hint
            ? 'font-[family-name:var(--font-playfair)] text-base text-gray-900 mb-1 flex items-center gap-2.5'
            : LABEL_CLASS
        }
      >
        <Icon className="w-5 h-5 text-[#b08a30] flex-shrink-0" />
        {label}
        {required && <RequiredMark />}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-gray-400 mb-2.5">
          {hint}
        </p>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-describedby={hintId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} resize-none`}
        placeholder={placeholder}
      />
    </div>
  )
}

/** One of the three compact score boxes. Labelled individually so each input
 *  still has its own accessible name inside the shared group. */
function ScoreField({
  name,
  label,
  value,
  onChange,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b08a30]/30 focus:border-[#b08a30] focus:outline-none transition-colors placeholder-gray-400 text-gray-900 text-base text-center"
        placeholder="—"
      />
    </div>
  )
}

/*
 * `whitespace-normal` overrides the primitive's `whitespace-nowrap`. At this
 * type size "Consultation Inquiry" cannot fit beside "Inquiry" on a 375px
 * screen, and nowrap would make flex-1 unable to shrink it — the label just
 * overflowed and clipped. Wrapping to two lines is the readable trade.
 */
const TAB_TRIGGER_CLASS =
  'font-[family-name:var(--font-playfair)] text-base sm:text-lg px-2 sm:px-6 py-3 h-auto whitespace-normal text-gray-500 hover:text-gray-900 data-[state=active]:text-[#b08a30] data-[state=active]:after:bg-[#b08a30] focus-visible:ring-[#b08a30]/30 focus-visible:outline-[#b08a30]'

const PAIR_CLASS = 'grid grid-cols-1 sm:grid-cols-2 gap-6'

export function ContactForm() {
  const [inquiryType, setInquiryType] = useState<InquiryType>('general')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Shared across both tabs, so switching intent never discards what was typed.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [message, setMessage] = useState('')

  const [currentCourses, setCurrentCourses] = useState('')
  const [psatScores, setPsatScores] = useState('')
  const [satScores, setSatScores] = useState('')
  const [actScores, setActScores] = useState('')
  const [goals, setGoals] = useState('')

  /*
   * Read from the DOM at submit time rather than held in state. A bot that sets
   * `input.value` directly never fires React's onChange, so a controlled
   * honeypot would silently stop detecting exactly what it exists to detect.
   */
  const honeypotRef = useRef<HTMLInputElement>(null)

  function resetFields() {
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setCurrentCourses('')
    setPsatScores('')
    setSatScores('')
    setActScores('')
    setGoals('')
    if (honeypotRef.current) honeypotRef.current.value = ''
  }

  function handleTabChange(value: string) {
    setInquiryType(value === 'consultation' ? 'consultation' : 'general')
    // A success or error notice refers to the submission just made; leaving it
    // up next to a different, empty form reads as if it applies to that one.
    setStatus('idle')
    setErrorMessage('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setStatus('loading')
    setErrorMessage('')

    // Only the fields belonging to the active intent are sent.
    const payload =
      inquiryType === 'consultation'
        ? {
            inquiryType,
            studentName: name,
            email,
            phone,
            currentCourses,
            psatScores,
            satScores,
            actScores,
            goals,
            company: honeypotRef.current?.value ?? '',
          }
        : {
            inquiryType,
            studentName: name,
            email,
            phone,
            message,
            company: honeypotRef.current?.value ?? '',
          }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to send message')
      }

      setStatus('success')
      resetFields()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Tabs value={inquiryType} onValueChange={handleTabChange}>
      {/*
        h-auto matches the primitive's own `group-data-[orientation=horizontal]`
        variant so tailwind-merge replaces its h-9 rather than leaving two
        competing height rules — the taller triggers would otherwise overflow a
        36px list.
      */}
      <TabsList
        variant="line"
        className="w-full justify-start items-stretch border-b border-gray-200 rounded-none p-0 mb-8 group-data-[orientation=horizontal]/tabs:h-auto"
      >
        <TabsTrigger value="general" className={TAB_TRIGGER_CLASS}>
          Inquiry
        </TabsTrigger>
        <TabsTrigger value="consultation" className={TAB_TRIGGER_CLASS}>
          Consultation Inquiry
        </TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/*
          Honeypot. Positioned off-screen rather than display:none, because some
          bots skip hidden inputs but fill anything they can parse. aria-hidden
          and tabIndex keep it away from screen readers and keyboard users, and
          autoComplete="off" stops a browser helpfully filling it in.
        */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
          <label htmlFor="company">Company (leave this field empty)</label>
          <input ref={honeypotRef} type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <TabsContent value="general" className="space-y-6">
          <p className="text-gray-500 text-base leading-relaxed">
            A quick question about subjects, scheduling, or pricing? Send it over and
            we&apos;ll reply personally.
          </p>

          <TextField
            name="studentName"
            label="Your Name"
            icon={User}
            value={name}
            onChange={setName}
            placeholder="Enter your name"
          />

          <div className={PAIR_CLASS}>
            <TextField
              name="email"
              type="email"
              label="Email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <TextField
              name="phone"
              type="tel"
              label="Phone"
              icon={Phone}
              value={phone}
              onChange={setPhone}
              placeholder="Optional"
            />
          </div>

          <TextAreaField
            name="message"
            label="How can we help?"
            icon={MessageSquare}
            value={message}
            onChange={setMessage}
            placeholder="Tell us what you'd like to know"
            required
          />
        </TabsContent>

        <TabsContent value="consultation" className="space-y-6">
          <p className="text-gray-500 text-base leading-relaxed">
            Ready to talk through a plan? Share what you can — only your email is required,
            and anything you skip we&apos;ll cover on the call.
          </p>

          <TextField
            name="studentName"
            label="Student Name & School"
            icon={User}
            value={name}
            onChange={setName}
            placeholder="Enter student name and school"
          />

          <div className={PAIR_CLASS}>
            <TextField
              name="email"
              type="email"
              label="Email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <TextField
              name="phone"
              type="tel"
              label="Phone"
              icon={Phone}
              value={phone}
              onChange={setPhone}
              placeholder="Optional"
            />
          </div>

          <TextField
            name="currentCourses"
            label="Current Math & English Courses"
            icon={BookOpen}
            value={currentCourses}
            onChange={setCurrentCourses}
            placeholder="e.g. Algebra II, AP Lang"
          />

          {/*
            Three score boxes on one row rather than three stacked fields. Each
            keeps its own <label>, and the fieldset gives them a shared group
            name so the relationship survives without repeating "Past … Scores"
            three times.
          */}
          <fieldset>
            <legend className={LABEL_CLASS}>
              <FileText className="w-5 h-5 text-[#b08a30] flex-shrink-0" />
              Past Test Scores
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <ScoreField name="psatScores" label="PSAT" value={psatScores} onChange={setPsatScores} />
              <ScoreField name="satScores" label="SAT" value={satScores} onChange={setSatScores} />
              <ScoreField name="actScores" label="ACT" value={actScores} onChange={setActScores} />
            </div>
          </fieldset>

          {/*
            Replaces three separate textareas — strengths, weaknesses, and where
            help is needed most. They asked for the same information three ways,
            and three sparse boxes get worse answers than one prompted box.
          */}
          <TextAreaField
            name="goals"
            label="Goals & where they need help"
            icon={MessageSquare}
            value={goals}
            onChange={setGoals}
            hint="Target scores, subjects they find hardest, timelines, anything else useful."
            placeholder="Tell us what you're working toward"
            rows={5}
          />
        </TabsContent>

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
        <div role="status" aria-live="polite" className="min-h-[1.5rem]">
          {status === 'success' && (
            <p className="text-green-800 text-base">
              <strong>Sent.</strong>{' '}
              {inquiryType === 'consultation'
                ? 'Thank you! We have your details and will reach out to schedule your consultation.'
                : 'Thank you! We have received your inquiry and will be in touch soon.'}
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-800 text-base">
              <strong>Error:</strong> {errorMessage}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#b08a30] text-white px-8 py-5 text-base font-medium hover:bg-[#9a7628] transition-colors font-[family-name:var(--font-playfair)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading'
            ? 'Sending...'
            : inquiryType === 'consultation'
              ? 'Send Consultation Inquiry'
              : 'Send Inquiry'}
        </button>
      </form>
    </Tabs>
  )
}
