"use client"

import { useBookingForm } from '@/hooks/useBookingForm'
import { SubjectSelect } from '@/components/booking/SubjectSelect'
import { AvailabilityForm, isAvailabilityReady } from '@/components/booking/AvailabilityForm'
import { ContactForm } from '@/components/booking/ContactForm'
import { PlanSelection } from '@/components/booking/PlanSelection'
import { useRouter } from 'next/navigation'
import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Types for Subject Data
interface Subject {
  id: string
  name: string
  slug: string
  category: string
  children?: Subject[]
}

function BookingSection({ 
  step, 
  title, 
  isOpen, 
  isCompleted, 
  summary, 
  children, 
  onEdit,
  disabled 
}: { 
  step: number, 
  title: string, 
  isOpen: boolean, 
  isCompleted: boolean, 
  summary?: ReactNode, 
  children: ReactNode, 
  onEdit: () => void,
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <div className="border border-gray-100 rounded-xl bg-gray-50/50 opacity-60">
        <div className="px-6 py-4 flex items-center space-x-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-gray-200 text-gray-400">
            {step}
          </div>
          <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 shadow-md bg-white ring-1 ring-blue-100' : 'border-gray-200 bg-white'}`}>
      <div 
        className={`px-6 py-4 flex items-center justify-between cursor-pointer ${!isOpen && isCompleted ? 'hover:bg-gray-50' : ''}`}
        onClick={() => { if (isCompleted && !isOpen) onEdit() }}
      >
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
            isCompleted ? 'bg-green-100 text-green-700' : 
            isOpen ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {isCompleted ? <Check className="w-4 h-4" /> : step}
          </div>
          <h3 className={`text-lg font-medium ${isOpen ? 'text-[#1e293b]' : 'text-gray-600'}`}>{title}</h3>
        </div>
        
        {isCompleted && !isOpen && (
           <div className="flex items-center text-sm text-gray-500">
             <span className="mr-4 hidden sm:inline-block max-w-[200px] truncate font-medium">{summary}</span>
             <Button variant="ghost" size="sm" className="h-8 text-[#4a729f] hover:text-[#3b5c85]" onClick={(e) => { e.stopPropagation(); onEdit() }}>Edit</Button>
           </div>
        )}
      </div>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-1 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const { 
    state, 
    setState,
    revealed, 
    setRevealed, 
    memberStatus, 
    setMemberStatus,
    updateSubjects,
    updateAvailability,
    updateContact,
  } = useBookingForm()
  
  const [processing, setProcessing] = useState(false)
  const [activeSection, setActiveSection] = useState<'subjects' | 'availability' | 'contact' | 'plan'>('subjects')
  
  // Subjects Data
  const [subjectsData, setSubjectsData] = useState<Record<string, Subject[]>>({})
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({})

  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then((data: Record<string, Subject[]>) => {
        setSubjectsData(data)
        const map: Record<string, Subject> = {}
        Object.values(data).flatMap(categorySubjects =>
          categorySubjects.flatMap(s => s.children ? s.children : s)
        ).forEach(s => map[s.id] = s)
        setSubjectMap(map)
        setLoadingSubjects(false)
      })
      .catch(err => {
        console.error(err)
        setLoadingSubjects(false)
      })
  }, [])

  const [prefilled, setPrefilled] = useState(false)
  // Set once the server confirms who is signed in. Drives the contact step,
  // which shows the address rather than asking for it again.
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null)

  useEffect(() => {
    if (prefilled) return
    async function prefillContact() {
      try {
        // Ask the server rather than checking the session on the client first.
        // supabase.auth.getUser() can resolve to null on the very first render
        // if the browser session has not hydrated yet, and this effect runs
        // once — so a signed-in visitor could be left with an empty contact
        // form for the whole page load. /api/account/profile reads the auth
        // cookie server-side and answers 401 when genuinely signed out.
        const res = await fetch('/api/account/profile')
        if (!res.ok) {
          setPrefilled(true)
          return
        }
        const data = await res.json()
        if (!data.email) {
          setPrefilled(true)
          return
        }
        setSignedInEmail(data.email)

        setState(prev => ({
          ...prev,
          contact: {
            fullName: data.fullName || prev.contact.fullName,
            email: data.email || prev.contact.email,
            phone: data.phone || prev.contact.phone,
            studentGrade: data.studentGrade || prev.contact.studentGrade,
            notes: prev.contact.notes
          }
        }))
        setPrefilled(true)

        const checkRes = await fetch('/api/customer/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        })
        if (checkRes.ok) {
          const memberData = await checkRes.json()
          setMemberStatus(memberData)
        }
      } catch {
        // Not signed in or API error
      }
    }
    prefillContact()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-check member status when entering Plan section (ensures we have current credits for the entered email)
  useEffect(() => {
    if (activeSection !== 'plan') return
    const email = state.contact.email?.trim()
    if (!email?.includes('@')) return

    let cancelled = false
    fetch('/api/customer/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setMemberStatus(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [activeSection, state.contact.email, setMemberStatus])

  // Derived state for summaries
  const selectedSubjectNames = state.subjects.map(id => subjectMap[id]?.name).filter(Boolean).join(', ')

  // Navigation Handler
  const handleNext = (current: string) => {
    if (current === 'subjects') {
      setRevealed(prev => ({ ...prev, availability: true }))
      setActiveSection('availability')
    } else if (current === 'availability') {
      setRevealed(prev => ({ ...prev, contact: true }))
      setActiveSection('contact')
    } else if (current === 'contact') {
      // Push the contact details back to the signed-in customer's account so
      // Settings reflects what they just entered. The booking submit route and
      // the Stripe webhook write these too, but only once a purchase lands —
      // this makes the sync immediate, and survives an abandoned booking.
      // Fire-and-forget: a failure here must never block the booking.
      // Name is deliberately not synced: the booking form asks for the student
      // OR parent name, so a booking made for someone else would rename the
      // account. Only non-empty values are sent, so leaving a box blank here
      // cannot clear what Settings already holds.
      if (signedInEmail) {
        const sync: Record<string, string> = {}
        if (state.contact.phone?.trim()) sync.phone = state.contact.phone.trim()
        if (state.contact.studentGrade?.trim()) sync.studentGrade = state.contact.studentGrade.trim()
        if (Object.keys(sync).length > 0) {
          fetch('/api/account/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sync),
          }).catch(() => {})
        }
      }
      setRevealed(prev => ({ ...prev, plan: true }))
      setActiveSection('plan')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePlanSelect = async (plan: any) => {
    setProcessing(true)
    
    // 1. If using credit (member)
    if (plan.type === 'credit') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Send them straight to sign-in rather than interrupting with a
            // browser alert. They come back to /book with their credits visible.
            router.push('/login?next=/book')
            setProcessing(false)
            return
        }

        const res = await fetch('/api/booking/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             use_credit: true,
             subjects: state.subjects,
             // The per-day shape is what the server stores; it derives the
             // legacy available_days/start/end envelope itself, so there is no
             // second copy for the two to disagree about.
             available_windows: state.availability.windows,
             timezone: state.availability.timezone,
             session_type: state.sessionType,
             notes: state.contact.notes,
             // The contact step collects these, but the credit path never sent
             // them, so an admin looking at a credit order saw "—" for both.
             // The paid path has always passed them through Stripe metadata.
             full_name: state.contact.fullName,
             phone: state.contact.phone,
             student_grade: state.contact.studentGrade
          })
        })
        
        if (res.ok) {
           const data = await res.json()
           router.push(data?.id ? `/book/confirmation?booking_id=${data.id}` : '/book/confirmation')
        } else {
           const err = await res.json()
           alert(err.error || 'Failed to submit booking')
        }
      } catch (err) {
        console.error(err)
        alert('An error occurred. Please try again.')
      } finally {
        setProcessing(false)
      }
      return
    }
    
    // 2. If paying (Stripe)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           plan_type: plan.type,
           plan_name: plan.name,
           plan_id: plan.id,
           price_id: plan.priceId,
           courseType: plan.courseType,
           booking_details: {
             subjects: state.subjects,
             available_windows: state.availability.windows,
             timezone: state.availability.timezone,
             session_type: state.sessionType,
             full_name: state.contact.fullName,
             email: state.contact.email,
             phone: state.contact.phone,
             student_grade: state.contact.studentGrade,
             notes: state.contact.notes,
             course_type: plan.courseType
           }
        })
      })
      
      const { url, error } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        console.error(error)
        alert(error || 'Failed to initiate checkout')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred connecting to payment provider.')
    } finally {
      setProcessing(false)
    }
  }

  if (loadingSubjects) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-[#1e293b] mb-4">Book a Session</h1>
          <p className="text-gray-600">Tell us what you need, and we&apos;ll match you with the perfect tutor.</p>
        </div>

        {/*
          Returning customers arriving signed out would otherwise reach the
          payment step with no sign of the credit already on their account, and
          pay for it twice. The contact step catches this too, once an email is
          entered; this catches it before they have typed anything.
        */}
        {!signedInEmail && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Already have a ScoreMax account?{' '}
            <Link
              href={`/login?next=${encodeURIComponent('/book')}`}
              className="font-semibold text-[#4a729f] underline underline-offset-2 hover:text-[#3b5c85]"
            >
              Sign in
            </Link>{' '}
            to book with your existing credits.
          </div>
        )}

        {/* 1. Subjects */}
        <BookingSection
          step={1}
          title="Select Subject" 
          isOpen={activeSection === 'subjects'}
          isCompleted={revealed.availability}
          summary={selectedSubjectNames}
          onEdit={() => setActiveSection('subjects')}
        >
           <SubjectSelect 
             subjects={subjectsData}
             selected={state.subjects} 
             onChange={(subjects) => updateSubjects(subjects)}
             onComplete={() => handleNext('subjects')}
           />
        </BookingSection>

        {/* 2. Availability */}
        <BookingSection
          step={2}
          title="Availability"
          isOpen={activeSection === 'availability'}
          isCompleted={revealed.contact}
          disabled={!revealed.availability}
          summary={`${state.availability.windows.length} days selected`}
          onEdit={() => setActiveSection('availability')}
        >
              <AvailabilityForm
                value={state.availability}
                onChange={(avail) => updateAvailability(avail)}
              />
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleNext('availability')}
                  disabled={!isAvailabilityReady(state.availability.windows)}
                  className="bg-[#1e293b]"
                >
                  Continue
                </Button>
              </div>
        </BookingSection>

        {/* 3. Contact */}
        <BookingSection
          step={3}
          title="Contact Information"
          isOpen={activeSection === 'contact'}
          isCompleted={revealed.plan}
          disabled={!revealed.contact}
          summary={state.contact.email}
          onEdit={() => setActiveSection('contact')}
        >
              <ContactForm
                value={state.contact}
                onChange={(contact) => updateContact(contact)}
                onMemberCheck={(status) => setMemberStatus(status)}
                externalMemberStatus={memberStatus}
                signedInEmail={signedInEmail}
              />
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleNext('contact')} 
                  disabled={!state.contact.email || !state.contact.fullName}
                  className="bg-[#1e293b]"
                >
                  See Options
                </Button>
              </div>
        </BookingSection>

        {/* 4. Plan Selection */}
        <BookingSection
          step={4}
          title="Choose Package"
          isOpen={activeSection === 'plan'}
          isCompleted={false} // Final step
          disabled={!revealed.plan}
          summary=""
          onEdit={() => setActiveSection('plan')}
        >
              <PlanSelection 
                subjects={state.subjects}
                memberStatus={memberStatus}
                onSelect={handlePlanSelect}
                loading={processing}
              />
        </BookingSection>
      </div>
    </div>
  )
}
