'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  formatPaymentMethod,
  paymentApprovalControlId,
  paymentApprovalErrorId,
  type OfflinePaymentMethod,
} from '@/lib/payment-method'

export interface PaymentApprovalState {
  step_up: boolean
  zelle: boolean
}

interface PaymentApprovalControlsProps {
  customerId: string
  customerName: string
  initialApprovals: PaymentApprovalState
  idScope: 'mobile' | 'desktop'
}

const methods: OfflinePaymentMethod[] = ['step_up', 'zelle']

export function PaymentApprovalControls({
  customerId,
  customerName,
  initialApprovals,
  idScope,
}: PaymentApprovalControlsProps) {
  const router = useRouter()
  const initialStepUp = initialApprovals.step_up
  const initialZelle = initialApprovals.zelle
  const [approvals, setApprovals] = useState(initialApprovals)
  const [pendingMethod, setPendingMethod] = useState<OfflinePaymentMethod | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setApprovals({ step_up: initialStepUp, zelle: initialZelle })
  }, [initialStepUp, initialZelle])

  const updateApproval = async (method: OfflinePaymentMethod, approved: boolean) => {
    setPendingMethod(method)
    setError(null)

    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/payment-approvals`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_method: method, approved }),
        }
      )
      const result = await response.json().catch(() => null)

      if (!response.ok || typeof result?.approved !== 'boolean') {
        throw new Error(result?.error || 'Could not update approval')
      }

      setApprovals((current) => ({ ...current, [method]: result.approved }))
      router.refresh()
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Could not update approval'
      )
    } finally {
      setPendingMethod(null)
    }
  }

  const errorId = paymentApprovalErrorId(idScope, customerId)

  return (
    <fieldset className="min-w-[11rem] space-y-2" aria-busy={pendingMethod !== null}>
      <legend className="sr-only">Offline payment approvals for {customerName}</legend>
      {methods.map((method) => {
        const controlId = paymentApprovalControlId(idScope, customerId, method)
        const isApproved = approvals[method]

        return (
          <div
            key={method}
            className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
          >
            <div className="min-w-0">
              <Label htmlFor={controlId} className="cursor-pointer text-xs font-semibold text-[#1e293b]">
                {formatPaymentMethod(method)}
              </Label>
              <p className={`text-[11px] ${isApproved ? 'text-emerald-700' : 'text-gray-500'}`}>
                {isApproved ? 'Approved' : 'Not approved'}
              </p>
            </div>
            <Switch
              id={controlId}
              checked={isApproved}
              disabled={pendingMethod !== null}
              onCheckedChange={(checked) => void updateApproval(method, checked)}
              aria-label={`${formatPaymentMethod(method)} approval for ${customerName}`}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
        )
      })}
      {error && (
        <p id={errorId} role="alert" className="max-w-[11rem] text-xs leading-snug text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}
