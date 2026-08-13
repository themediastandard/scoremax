"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Video, CreditCard, GraduationCap } from 'lucide-react'
import { formatPaymentMethod } from '@/lib/payment-method'
import type { BookingStudentDto } from '@/lib/student-contract'

function formatTime24To12(time24: string) {
  const [h, m] = (time24 || '').split(':').map(Number)
  if (isNaN(h)) return time24
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${h12}:${m?.toString().padStart(2, '0') ?? '00'} ${ampm}`
}

export interface BookingDetails {
  plan?: {
    name: string
    amountCents: number
    type: string
    paymentMethod?: string | null
  } | null
  availability?: {
    /** Per-day ranges. Empty for bookings taken before this shape existed. */
    windows?: { day: string; start: string; end: string }[] | null
    days?: string[]
    startTime?: string | null
    endTime?: string | null
  } | null
  sessionType?: string | null
  subjects?: string[] | null
  subjectIds?: string[] | null
  student?: BookingStudentDto | null
  legacyStudentUnassigned?: boolean
}

interface ConfirmationViewProps {
  bookingDetails?: BookingDetails | null
  onBookAnother: () => void
}

export function ConfirmationView({ bookingDetails, onBookAnother }: ConfirmationViewProps) {
  // The API returns per-day windows and, for rows predating them, rebuilds the
  // same shape from the flat triple — so this only has to fall back when an
  // older cached bundle of the API response is in play.
  const availability = bookingDetails?.availability
  const windows =
    availability?.windows?.length
      ? availability.windows
      : availability?.days?.length && availability.startTime && availability.endTime
        ? availability.days.map((day) => ({
            day,
            start: availability.startTime as string,
            end: availability.endTime as string,
          }))
        : []

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-serif text-[#1e293b]">Request Received!</h1>
        <p className="text-gray-600 text-lg">
          We&apos;ve received your booking request. A ScoreMax team member will assign your tutor and confirm your exact session time within 24 hours.
        </p>
      </div>
      
      <Card className="border-t-4 border-t-[#b08a30]">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingDetails?.plan && (
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <CreditCard className="w-5 h-5 text-[#b08a30] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">What you purchased</p>
                <p className="text-lg font-semibold text-[#1e293b]">
                  {bookingDetails.plan.name}
                  {bookingDetails.plan.amountCents > 0 && (
                    <span className="text-[#4a729f] ml-1">
                      ${(bookingDetails.plan.amountCents / 100).toLocaleString()}
                    </span>
                  )}
                </p>
                {bookingDetails.plan.paymentMethod && (
                  <p className="mt-1 text-sm text-gray-500">
                    Payment method:{' '}
                    <span className="font-medium text-gray-700">
                      {formatPaymentMethod(bookingDetails.plan.paymentMethod)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#4a729f]" aria-hidden="true" />
            <div>
              <p className="font-medium">Student</p>
              {bookingDetails?.student ? (
                <>
                  <p className="font-semibold text-[#1e293b]">{bookingDetails.student.fullName}</p>
                  <p className="text-sm text-gray-500">{bookingDetails.student.grade}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-amber-700">Student not assigned</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days and times used to be two separate cells, which only worked
                while one range covered every day. Each day now carries its own
                range, so they belong on one line together. */}
            <div className="flex items-start space-x-3 md:col-span-2">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Requested Availability</p>
                {windows.length > 0 ? (
                  <ul className="text-sm text-gray-500 space-y-0.5 mt-0.5">
                    {windows.map((w) => (
                      <li key={w.day} className="flex items-baseline gap-2">
                        <span className="min-w-[5.5rem] font-medium text-gray-600">{w.day}</span>
                        <span>
                          {formatTime24To12(w.start)} – {formatTime24To12(w.end)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Flexible</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Video className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-gray-500">Online (Google Meet)</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
               <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                 {bookingDetails?.subjects?.length ?? 0}
               </div>
               <div>
                 <p className="font-medium">Subjects</p>
                 <p className="text-sm text-gray-500">
                   {bookingDetails?.subjects?.length
                     ? bookingDetails.subjects.join(', ')
                     : '—'}
                 </p>
               </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">Check your email for confirmation details.</p>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Button onClick={onBookAnother} variant="outline" size="lg">
          Book Another Session
        </Button>
      </div>
    </div>
  )
}
