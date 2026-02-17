"use client"

import { ConfirmationView } from '@/components/booking/ConfirmationView'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')
  
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  
  useEffect(() => {
    const param = sessionId
      ? `session_id=${encodeURIComponent(sessionId)}`
      : bookingId
        ? `booking_id=${encodeURIComponent(bookingId)}`
        : null
    if (param) {
      fetch(`/api/booking/confirmation?${param}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setBookingDetails(data))
        .catch(() => setBookingDetails(null))
    }
  }, [sessionId, bookingId])

  return (
    <ConfirmationView 
      bookingDetails={bookingDetails} 
      onBookAnother={() => router.push('/book')} 
    />
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  )
}