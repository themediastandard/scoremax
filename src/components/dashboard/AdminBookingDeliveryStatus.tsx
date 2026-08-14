'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Loader2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AdminBookingDelivery = {
  status: 'pending' | 'processing' | 'complete' | 'attention'
  calendar_status: 'pending' | 'complete' | 'attention'
  email_status: 'pending' | 'complete' | 'attention'
  last_error?: string | null
}

export function AdminBookingDeliveryStatus({
  sessionId,
  delivery,
}: {
  sessionId: string
  delivery: AdminBookingDelivery
}) {
  const router = useRouter()
  const [retrying, setRetrying] = useState(false)
  const [message, setMessage] = useState('')

  if (delivery.status === 'complete') return null

  const retry = async () => {
    setRetrying(true)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/delivery`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Retry failed.')
      setMessage(body.delivery.status === 'complete'
        ? 'Calendar and confirmation emails are complete.'
        : body.delivery.warning || 'Setup is still processing.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Retry failed.')
    } finally {
      setRetrying(false)
    }
  }

  const attention = delivery.status === 'attention'
  return (
    <div className={`rounded-lg border p-3 ${attention ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          {attention
            ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            : <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-700" />}
          <div>
            <p className={`text-sm font-semibold ${attention ? 'text-amber-900' : 'text-blue-900'}`}>
              {attention ? 'Calendar or email setup needs attention' : 'Calendar and emails are processing'}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              The session is booked and its credit is already recorded. Retrying cannot consume another credit.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Calendar: {delivery.calendar_status} · Emails: {delivery.email_status}
            </p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={retry} disabled={retrying}>
          {retrying ? <Loader2 className="animate-spin" /> : <RotateCw />}
          Retry calendar & emails
        </Button>
      </div>
      {message && (
        <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
          {message.includes('complete') && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          {message}
        </p>
      )}
    </div>
  )
}
