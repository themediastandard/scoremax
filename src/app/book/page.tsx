"use client"

import { useBookingForm } from '@/hooks/useBookingForm'
import { SubjectSelect } from '@/components/booking/SubjectSelect'
import { SessionTypeToggle } from '@/components/booking/SessionTypeToggle'
import { AvailabilityForm } from '@/components/booking/AvailabilityForm'
import { ContactForm } from '@/components/booking/ContactForm'
import { PlanSelection } from '@/components/booking/PlanSelection'
import { useRouter } from 'next/navigation'
import { useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Types for Subject Data
interface Subject {
  id: string
  name: string
  slug: string
  category: string
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
             <Button variant="ghost" size="sm" className="h-8 text-[#517cad] hover:text-[#3b5c85]" onClick={(e) => { e.stopPropagation(); onEdit() }}>Edit</Button>
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
    updateSessionType,
    updateAvailability,
    updateContact,
    revealNext 
  } = useBookingForm()
  
  const [processing, setProcessing] = useState(false)
  const [activeSection, setActiveSection] = useState<'subjects' | 'sessionType' | 'availability' | 'contact' | 'plan'>('subjects')
  
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
        Object.values(data).flat().forEach(s => map[s.id] = s)
        setSubjectMap(map)
        setLoadingSubjects(false)
      })
      .catch(err => {
        console.error(err)
        setLoadingSubjects(false)
      })
  }, [])

  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => {
    if (prefilled) return
    async function prefillContact() {
      try {
        const res = await fetch('/api/account/profile')
        if (!res.ok) return
        const data = await res.json()
        if (!data.email) return

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

        const checkRes = await fetch(`/api/customer/check?email=${encodeURIComponent(data.email)}`)
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
    fetch(`/api/customer/check?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setMemberStatus(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [activeSection, state.contact.email])

  // Derived state for summaries
  const selectedSubjectNames = state.subjects.map(id => subjectMap[id]?.name).filter(Boolean).join(', ')
  const isSAT = state.subjects.some(id => subjectMap[id]?.slug === 'sat')

  // Dynamic Steps
  // 1. Subjects
  // 2. Session Type (only if SAT)
  // 3. Availability
  // 4. Contact
  // 5. Plan
  
  // We need to map internal sections to visual steps
  const steps = [
    { id: 'subjects', title: 'Select Subject(s)' },
    ...(isSAT ? [{ id: 'sessionType', title: 'Session Preference' }] : []),
    { id: 'availability', title: 'Availability' },
    { id: 'contact', title: 'Contact Information' },
    { id: 'plan', title: 'Choose Package' }
  ]
  
  const currentStepIndex = steps.findIndex(s => s.id === activeSection)
  
  // Navigation Handler
  const handleNext = (current: string) => {
    // Determine next section based on SAT logic
    if (current === 'subjects') {
      if (isSAT) {
        setRevealed(prev => ({ ...prev, sessionType: true }))
        setActiveSection('sessionType')
      } else {
        setRevealed(prev => ({ ...prev, availability: true }))
        setActiveSection('availability')
      }
    } else if (current === 'sessionType') {
      setRevealed(prev => ({ ...prev, availability: true }))
      setActiveSection('availability')
    } else if (current === 'availability') {
      setRevealed(prev => ({ ...prev, contact: true }))
      setActiveSection('contact')
    } else if (current === 'contact') {
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
            alert("Please log in to use your credits.")
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
             available_days: state.availability.days,
             available_time_start: state.availability.startTime,
             available_time_end: state.availability.endTime,
             timezone: state.availability.timezone,
             session_type: state.sessionType,
             notes: state.contact.notes
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
           price_id: plan.priceId,
           price_cents: plan.price,
           booking_details: {
             subjects: state.subjects,
             available_days: state.availability.days,
             available_time_start: state.availability.startTime,
             available_time_end: state.availability.endTime,
             timezone: state.availability.timezone,
             session_type: state.sessionType,
             full_name: state.contact.fullName,
             email: state.contact.email,
             phone: state.contact.phone,
             student_grade: state.contact.studentGrade,
             notes: state.contact.notes,
             course_type: plan.courseType,
             cohort_id: plan.cohortId
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

        {/* 1. Subjects */}
        <BookingSection 
          step={1} 
          title="Select Subject(s)" 
          isOpen={activeSection === 'subjects'}
          isCompleted={revealed.sessionType || revealed.availability} // Depends on path
          // Actually checking revealed next step is safe heuristic
          summary={selectedSubjectNames}
          onEdit={() => setActiveSection('subjects')}
        >
           <SubjectSelect 
             subjects={subjectsData}
             selected={state.subjects} 
             onChange={(subjects, hasSAT) => {
               updateSubjects(subjects)
               // Don't auto-advance on selection change, wait for Continue
             }} 
             onComplete={() => handleNext('subjects')}
           />
        </BookingSection>

        {/* 2. Session Type (Conditional) */}
        {isSAT && (
          <BookingSection
            step={2}
            title="Session Preference"
            isOpen={activeSection === 'sessionType'}
            isCompleted={revealed.availability}
            disabled={!revealed.sessionType}
            summary={state.sessionType === 'in-person' ? 'In-Person (Sawgrass)' : 'Online (Zoom)'}
            onEdit={() => setActiveSection('sessionType')}
          >
              <SessionTypeToggle 
                value={state.sessionType} 
                onChange={(type) => {
                  updateSessionType(type)
                  // Auto-advance for radio button? or button?
                  // Let's add explicit button for consistency
                }} 
              />
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleNext('sessionType')} className="bg-[#1e293b]">Continue</Button>
              </div>
          </BookingSection>
        )}

        {/* 3. Availability */}
        <BookingSection
          step={isSAT ? 3 : 2}
          title="Availability"
          isOpen={activeSection === 'availability'}
          isCompleted={revealed.contact}
          disabled={!revealed.availability}
          summary={`${state.availability.days.length} days selected`}
          onEdit={() => setActiveSection('availability')}
        >
              <AvailabilityForm 
                value={state.availability} 
                onChange={(avail) => updateAvailability(avail)} 
              />
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleNext('availability')} 
                  disabled={state.availability.days.length === 0}
                  className="bg-[#1e293b]"
                >
                  Continue
                </Button>
              </div>
        </BookingSection>

        {/* 4. Contact */}
        <BookingSection
          step={isSAT ? 4 : 3}
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

        {/* 5. Plan Selection */}
        <BookingSection
          step={isSAT ? 5 : 4}
          title="Choose Package"
          isOpen={activeSection === 'plan'}
          isCompleted={false} // Final step
          disabled={!revealed.plan}
          summary=""
          onEdit={() => setActiveSection('plan')}
        >
              <PlanSelection 
                subjects={state.subjects}
                sessionType={state.sessionType}
                memberStatus={memberStatus}
                onSelect={handlePlanSelect}
                loading={processing}
              />
        </BookingSection>
      </div>
    </div>
  )
}
