"use client"

import { useBookingForm } from '@/hooks/useBookingForm'
import { SubjectSelect } from '@/components/booking/SubjectSelect'
import { AvailabilityForm, isAvailabilityReady } from '@/components/booking/AvailabilityForm'
import { ContactForm } from '@/components/booking/ContactForm'
import { PlanSelection } from '@/components/booking/PlanSelection'
import { StudentSelection } from '@/components/booking/StudentSelection'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { normalizeAvailabilityWindows } from '@/lib/availability-windows'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OfflinePaymentMethod } from '@/lib/payment-method'
import type { SignupCompletionResponse, StudentCreditSummaryResponse, StudentDto } from '@/lib/student-contract'
import type { AccountType } from '@/lib/account-type'
import {
  readBookingDraft,
  writeBookingDraft,
  type BookingDraftSection,
} from '@/lib/booking-draft'
import { clearPendingGoogleSignup, readPendingGoogleSignup } from '@/lib/signup-onboarding'

const OFFLINE_PURCHASE_KEY_STORAGE = 'scoremax:offline-purchase-keys:v1'

function readOfflinePurchaseKeys(): Map<string, string> {
  if (typeof window === 'undefined') return new Map()
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(OFFLINE_PURCHASE_KEY_STORAGE) ?? '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return new Map()
    return new Map(
      Object.entries(stored).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    )
  } catch {
    return new Map()
  }
}

function persistOfflinePurchaseKeys(keys: Map<string, string>) {
  try {
    window.sessionStorage.setItem(
      OFFLINE_PURCHASE_KEY_STORAGE,
      JSON.stringify(Object.fromEntries(keys))
    )
  } catch {
    // The in-memory map still gives same-page retries an exact operation key.
  }
}

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
    updateStudent,
    updateSubjects,
    updateAvailability,
    updateContact,
  } = useBookingForm()
  
  const [processing, setProcessing] = useState(false)
  const [authoritativeBlockedMethod, setAuthoritativeBlockedMethod] = useState<OfflinePaymentMethod | null>(null)
  const [activeSection, setActiveSection] = useState<BookingDraftSection>('student')
  const [draftProfileId, setDraftProfileId] = useState<string | null>(null)
  const [draftReady, setDraftReady] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [students, setStudents] = useState<StudentDto[]>([])
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [selfStudentId, setSelfStudentId] = useState<string | null>(null)
  const [studentStatus, setStudentStatus] = useState<'loading' | 'signed_out' | 'ready' | 'error'>('loading')
  const [creditSummaryLoading, setCreditSummaryLoading] = useState(false)
  const [creditSummaryError, setCreditSummaryError] = useState<string | null>(null)
  // A retry of the exact same offline purchase must reuse its key. Keeping a
  // key per request payload also prevents a changed plan or booking form from
  // accidentally reusing the previous operation's identity. sessionStorage
  // survives a reload after a committed response is lost; acknowledged success
  // removes the key so a later intentional identical booking is new work.
  const offlineIdempotencyKeys = useRef<Map<string, string> | null>(null)
  
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

  const loadStudents = useCallback(async (preferredStudentId?: string) => {
    setStudentStatus('loading')
    try {
      const pendingGoogleSignup = readPendingGoogleSignup(window.sessionStorage)
      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          students: pendingGoogleSignup?.accountType === 'parent' ? pendingGoogleSignup.students : undefined,
          studentGrade: pendingGoogleSignup?.accountType === 'student' ? pendingGoogleSignup.studentGrade : undefined,
        }),
      })
      if (response.status === 401) {
        setStudents([])
        setAccountType(null)
        setSelfStudentId(null)
        setStudentStatus('signed_out')
        return
      }
      if (!response.ok) {
        setStudentStatus('error')
        return
      }
      const body = await response.json() as SignupCompletionResponse
      if (pendingGoogleSignup) clearPendingGoogleSignup(window.sessionStorage)
      setStudents(body.students)
      setAccountType(body.accountType)
      setSelfStudentId(body.selfStudentId)
      const retriedGoogleStudentId = pendingGoogleSignup?.accountType === 'parent'
        ? body.students.find((student) => (
            student.isActive && student.email.trim().toLowerCase() === pendingGoogleSignup.students[0].email
          ))?.id ?? null
        : null
      const authoritativePreferredId = body.preferredStudentId ?? preferredStudentId ?? retriedGoogleStudentId
      const preferredStudent = authoritativePreferredId
        ? body.students.find((student) => student.id === authoritativePreferredId && student.isActive)
        : null
      if (preferredStudent) {
        setState((previous) => ({ ...previous, studentId: preferredStudent.id }))
        setRevealed((previous) => ({ ...previous, subjects: true }))
        setActiveSection('subjects')
      }
      setStudentStatus('ready')
    } catch {
      setStudentStatus('error')
    }
  }, [setRevealed, setState])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

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
          if (res.status === 401) setStudentStatus('signed_out')
          setPrefilled(true)
          return
        }
        const data = await res.json()
        if (!data.email) {
          setPrefilled(true)
          return
        }
        setSignedInEmail(data.email)
        const savedDraft = typeof data.profileId === 'string'
          ? readBookingDraft(window.sessionStorage, data.profileId)
          : null

        setState(prev => ({
          ...prev,
          studentId: savedDraft?.studentId ?? prev.studentId,
          subjects: savedDraft?.subjects ?? prev.subjects,
          availability: savedDraft?.availability ?? prev.availability,
          contact: {
            fullName: data.fullName || prev.contact.fullName,
            email: data.email || prev.contact.email,
            phone: data.phone || prev.contact.phone,
            notes: prev.contact.notes
          }
        }))
        if (savedDraft) {
          setRevealed(savedDraft.revealed)
          setActiveSection(savedDraft.activeSection)
          setDraftRestored(true)
        }
        if (typeof data.profileId === 'string') setDraftProfileId(data.profileId)
        setDraftReady(true)
        setPrefilled(true)

      } catch {
        // Not signed in or API error
      }
    }
    prefillContact()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep completed steps available through a refresh while the account waits
  // for Step Up or Zelle approval. The draft is scoped to this authenticated
  // profile and this browser tab, and contains no contact details.
  useEffect(() => {
    if (!draftReady || !draftProfileId) return
    writeBookingDraft(window.sessionStorage, draftProfileId, {
      version: 1,
      studentId: state.studentId,
      subjects: state.subjects,
      availability: state.availability,
      revealed,
      activeSection,
    })
  }, [activeSection, draftProfileId, draftReady, revealed, state.availability, state.studentId, state.subjects])

  // Eligibility is student-specific. Clear the prior summary before loading
  // the next one so a sibling-bound Step Up or course credit never remains
  // visible while another child is selected.
  useEffect(() => {
    const email = state.contact.email?.trim()
    if (!state.studentId || !email?.includes('@')) {
      setMemberStatus(null)
      setCreditSummaryError(null)
      return
    }

    let cancelled = false
    setMemberStatus(null)
    setCreditSummaryError(null)
    setCreditSummaryLoading(true)
    fetch('/api/customer/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, student_id: state.studentId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('credit_summary_failed')
        return res.json() as Promise<StudentCreditSummaryResponse>
      })
      .then((data) => {
        if (!cancelled) setMemberStatus(data)
      })
      .catch(() => {
        if (!cancelled) setCreditSummaryError('We could not verify credits for this student.')
      })
      .finally(() => {
        if (!cancelled) setCreditSummaryLoading(false)
      })
    return () => { cancelled = true }
  }, [state.studentId, state.contact.email, setMemberStatus])

  // Derived state for summaries
  const selectedSubjectNames = state.subjects.map(id => subjectMap[id]?.name).filter(Boolean).join(', ')
  const selectedStudent = students.find((student) => student.id === state.studentId && student.isActive) ?? null
  const selfStudent = accountType === 'student' && selfStudentId
    ? students.find((student) => student.id === selfStudentId && student.isActive) ?? null
    : null
  const isStudentAccount = accountType === 'student'

  // Student accounts always book for their own server-identified profile. The
  // recipient picker is a parent workflow and should never make a self-booking
  // student choose themselves before every session.
  useEffect(() => {
    if (studentStatus !== 'ready' || !selfStudent) return

    setState((previous) => previous.studentId === selfStudent.id
      ? previous
      : { ...previous, studentId: selfStudent.id })
    setRevealed((previous) => (
      previous.subjects ? previous : { ...previous, subjects: true }
    ))
    setActiveSection((previous) => previous === 'student' ? 'subjects' : previous)
  }, [selfStudent, studentStatus, setRevealed, setState])

  const subjectStep = isStudentAccount ? 1 : 2
  const availabilityStep = isStudentAccount ? 2 : 3
  const contactStep = isStudentAccount ? 3 : 4
  const planStep = isStudentAccount ? 4 : 5

  // Navigation Handler
  const handleNext = (current: string) => {
    if (current === 'student') {
      if (!selectedStudent) return
      setRevealed(prev => ({ ...prev, subjects: true }))
      setActiveSection('subjects')
    } else if (current === 'subjects') {
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
      // Student identity and grade come only from the managed-student profile.
      if (signedInEmail) {
        const sync: Record<string, string> = {}
        if (state.contact.phone?.trim()) sync.phone = state.contact.phone.trim()
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
    if (!state.studentId || !selectedStudent) {
      setActiveSection('student')
      return
    }
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
             student_id: state.studentId,
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
             phone: state.contact.phone
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

    // 2. Approved Step Up and Zelle purchases are recorded immediately. The
    // server resolves the trusted plan and price; the browser sends only the
    // selected plan identity and booking details.
    if (plan.paymentMethod === 'step_up' || plan.paymentMethod === 'zelle') {
      const requestWithoutKey = {
        student_id: state.studentId,
        payment_method: plan.paymentMethod,
        plan_type: plan.type,
        plan_id: plan.id ?? null,
        courseType: plan.courseType ?? null,
        booking_details: {
          subjects: state.subjects,
          available_windows: normalizeAvailabilityWindows(state.availability.windows),
          timezone: state.availability.timezone,
          session_type: state.sessionType,
          full_name: state.contact.fullName,
          phone: state.contact.phone,
          notes: state.contact.notes,
        },
      }
      const requestFingerprint = JSON.stringify(requestWithoutKey)
      const idempotencyKeys = offlineIdempotencyKeys.current ?? readOfflinePurchaseKeys()
      offlineIdempotencyKeys.current = idempotencyKeys
      let idempotencyKey = idempotencyKeys.get(requestFingerprint)
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID()
        idempotencyKeys.set(requestFingerprint, idempotencyKey)
        persistOfflinePurchaseKeys(idempotencyKeys)
      }

      try {
        const res = await fetch('/api/offline-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...requestWithoutKey,
            idempotency_key: idempotencyKey,
          }),
        })
        const data = await res.json().catch(() => ({}))

        if (res.ok && data?.booking_id) {
          idempotencyKeys.delete(requestFingerprint)
          persistOfflinePurchaseKeys(idempotencyKeys)
          router.push(`/book/confirmation?booking_id=${data.booking_id}`)
        } else if (res.status === 401 || (res.status === 403 && data?.code === 'account_not_approved')) {
          // The server rechecks both authentication and exact-method approval
          // inside the purchase transaction. Surface that authoritative result
          // with the same exact copy and actions as the selector gate.
          setAuthoritativeBlockedMethod(plan.paymentMethod)
        } else {
          alert(data?.error || 'Failed to submit purchase')
        }
      } catch (err) {
        console.error(err)
        alert('An error occurred. Please try again.')
      } finally {
        setProcessing(false)
      }
      return
    }
    
    // 3. Credit-card purchases continue through Stripe.
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
             student_id: state.studentId,
             subjects: state.subjects,
             available_windows: state.availability.windows,
             timezone: state.availability.timezone,
             session_type: state.sessionType,
             full_name: state.contact.fullName,
             email: state.contact.email,
             phone: state.contact.phone,
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

        {draftRestored && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900" role="status">
            We restored your booking details. Continue where you left off.
          </div>
        )}

        {/* Parents choose a managed child. Student accounts are assigned to
            their own active profile server-side and begin with subjects. */}
        {!isStudentAccount && (
          <BookingSection
            step={1}
            title="Who is this session for?"
            isOpen={activeSection === 'student'}
            isCompleted={revealed.subjects && Boolean(selectedStudent)}
            summary={selectedStudent?.fullName}
            onEdit={() => setActiveSection('student')}
          >
            <StudentSelection
              students={students}
              selectedStudentId={state.studentId}
              status={studentStatus}
              onSelect={(student) => {
                updateStudent(student.id)
                setAuthoritativeBlockedMethod(null)
              }}
              onContinue={() => handleNext('student')}
              onRetry={() => void loadStudents()}
              onStudentCreated={(studentId) => void loadStudents(studentId)}
            />
          </BookingSection>
        )}

        {isStudentAccount && studentStatus === 'ready' && !selfStudent && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
            <p className="font-semibold text-red-900">We couldn&apos;t load your student profile</p>
            <p className="mt-1 text-sm leading-6 text-red-700">
              Your account is set up as a student, but its booking profile is unavailable. Contact ScoreMax before continuing.
            </p>
          </div>
        )}

        {/* 2. Subjects */}
        <BookingSection
          step={subjectStep}
          title="Select Subject" 
          isOpen={activeSection === 'subjects'}
          isCompleted={revealed.availability}
          disabled={!revealed.subjects}
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

        {/* 3. Availability */}
        <BookingSection
          step={availabilityStep}
          title="Availability"
          isOpen={activeSection === 'availability'}
          isCompleted={revealed.contact}
          disabled={!revealed.availability}
          summary={`${state.availability.windows.length} days selected`}
          onEdit={() => setActiveSection('availability')}
        >
              <AvailabilityForm
                value={state.availability}
                studentName={selectedStudent?.fullName ?? 'this student'}
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

        {/* 4. Account owner contact */}
        <BookingSection
          step={contactStep}
          title="Account Owner Contact"
          isOpen={activeSection === 'contact'}
          isCompleted={revealed.plan}
          disabled={!revealed.contact}
          summary={state.contact.email}
          onEdit={() => setActiveSection('contact')}
        >
              {selectedStudent && (
                <ContactForm
                  value={state.contact}
                  onChange={(contact) => updateContact(contact)}
                  signedInEmail={signedInEmail}
                  selectedStudent={selectedStudent}
                  isStudentAccount={isStudentAccount}
                />
              )}
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
          step={planStep}
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
                selectedStudentName={selectedStudent?.fullName ?? 'this student'}
                creditSummaryLoading={creditSummaryLoading}
                creditSummaryError={creditSummaryError}
                onSelect={handlePlanSelect}
                loading={processing}
                authoritativeBlockedMethod={authoritativeBlockedMethod}
                onAuthoritativeBlockDismiss={() => setAuthoritativeBlockedMethod(null)}
              />
        </BookingSection>
      </div>
    </div>
  )
}
