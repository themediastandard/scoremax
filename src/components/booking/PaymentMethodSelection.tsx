"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, CreditCard, Landmark, Loader2, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  isOfflinePaymentMethod,
  paymentApprovalMessage,
  type OfflinePaymentMethod,
  type PurchasePaymentMethod,
} from '@/lib/payment-method'

export type PaymentMethod = Exclude<PurchasePaymentMethod, 'account_credit'>

interface PaymentMethodApprovals {
  signedIn: boolean
  approvals: {
    step_up: boolean
    zelle: boolean
  }
}

interface PaymentMethodSelectionProps {
  value: PaymentMethod | null
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
  authoritativeBlockedMethod?: OfflinePaymentMethod | null
  onAuthoritativeBlockDismiss?: () => void
}

const METHODS: Array<{
  value: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
}> = [
  {
    value: 'credit_card',
    label: 'Credit Card',
    description: 'Secure online checkout',
    icon: CreditCard,
  },
  {
    value: 'step_up',
    label: 'Step Up',
    description: 'For approved accounts',
    icon: WalletCards,
  },
  {
    value: 'zelle',
    label: 'Zelle',
    description: 'For approved accounts',
    icon: Landmark,
  },
]

const EMPTY_APPROVALS: PaymentMethodApprovals = {
  signedIn: false,
  approvals: { step_up: false, zelle: false },
}

async function fetchPaymentApprovals(signal?: AbortSignal): Promise<PaymentMethodApprovals> {
  const response = await fetch('/api/account/payment-methods', {
    cache: 'no-store',
    signal,
  })
  if (!response.ok) throw new Error('Unable to check payment method approval')

  const data = await response.json() as Partial<PaymentMethodApprovals>
  return {
    signedIn: data.signedIn === true,
    approvals: {
      step_up: data.approvals?.step_up === true,
      zelle: data.approvals?.zelle === true,
    },
  }
}

export function PaymentMethodSelection({
  value,
  onChange,
  disabled = false,
  authoritativeBlockedMethod = null,
  onAuthoritativeBlockDismiss,
}: PaymentMethodSelectionProps) {
  const [approvalStatus, setApprovalStatus] = useState<PaymentMethodApprovals>(EMPTY_APPROVALS)
  const [checkingApproval, setCheckingApproval] = useState(true)
  const [approvalCheckFailed, setApprovalCheckFailed] = useState(false)
  const [blockedMethod, setBlockedMethod] = useState<OfflinePaymentMethod | null>(null)
  const [recheckingApproval, setRecheckingApproval] = useState(false)
  const [recheckMessage, setRecheckMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadApprovals() {
      try {
        setApprovalStatus(await fetchPaymentApprovals(controller.signal))
        setApprovalCheckFailed(false)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        // Offline methods fail closed when approval cannot be verified.
        setApprovalStatus(EMPTY_APPROVALS)
        setApprovalCheckFailed(true)
      } finally {
        if (!controller.signal.aborted) setCheckingApproval(false)
      }
    }

    loadApprovals()
    return () => controller.abort()
  }, [])

  const chooseMethod = (method: PaymentMethod) => {
    if (disabled) return
    if (!isOfflinePaymentMethod(method)) {
      onChange(method)
      return
    }

    if (!approvalStatus.signedIn || !approvalStatus.approvals[method]) {
      setBlockedMethod(method)
      return
    }

    onChange(method)
  }

  const effectiveBlockedMethod = authoritativeBlockedMethod ?? blockedMethod

  const closeBlockedDialog = () => {
    setBlockedMethod(null)
    setRecheckMessage('')
    if (authoritativeBlockedMethod) onAuthoritativeBlockDismiss?.()
  }

  const recheckBlockedMethod = async () => {
    const method = effectiveBlockedMethod
    if (!method) return
    setRecheckingApproval(true)
    setRecheckMessage('')
    try {
      const status = await fetchPaymentApprovals()
      setApprovalStatus(status)
      setApprovalCheckFailed(false)
      if (status.signedIn && status.approvals[method]) {
        setBlockedMethod(null)
        if (authoritativeBlockedMethod) onAuthoritativeBlockDismiss?.()
        onChange(method)
      } else {
        setRecheckMessage(status.signedIn
          ? `Your ${method === 'step_up' ? 'Step Up' : 'Zelle'} approval is still pending. Contact ScoreMax if you need help.`
          : 'Please sign in again before checking your approval.')
      }
    } catch {
      setApprovalStatus(EMPTY_APPROVALS)
      setApprovalCheckFailed(true)
      setRecheckMessage('We could not check your approval. Please try again.')
    } finally {
      setRecheckingApproval(false)
    }
  }

  return (
    <section aria-labelledby="payment-method-heading" className="space-y-4">
      <div>
        <h2 id="payment-method-heading" className="text-2xl font-serif text-[#1e293b]">
          Choose a payment method
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Select how you would like to pay before choosing a plan.
        </p>
      </div>

      <RadioGroup
        aria-labelledby="payment-method-heading"
        value={value ?? ''}
        onValueChange={(method) => chooseMethod(method as PaymentMethod)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        disabled={disabled}
      >
        {METHODS.map((method) => {
          const Icon = method.icon
          const selected = value === method.value
          const waitingForApproval = method.value !== 'credit_card' && checkingApproval

          return (
            <label
              key={method.value}
              htmlFor={`payment-method-${method.value}`}
              className={`relative flex min-h-28 cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-[#517cad] focus-within:ring-offset-2 ${
                selected
                  ? 'border-[#517cad] bg-blue-50/70'
                  : 'border-gray-200 bg-white hover:border-[#517cad]/60'
              } ${disabled || waitingForApproval ? 'cursor-not-allowed opacity-65' : ''}`}
            >
              <RadioGroupItem
                id={`payment-method-${method.value}`}
                value={method.value}
                disabled={disabled || waitingForApproval}
                className="mt-1"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-[#1e293b]">
                  <Icon className="size-5 shrink-0 text-[#517cad]" aria-hidden="true" />
                  {method.label}
                </span>
                <span className="mt-2 block text-sm leading-5 text-gray-600">
                  {waitingForApproval ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      Checking approval
                    </span>
                  ) : method.description}
                </span>
              </span>
              {selected && <Check className="absolute right-3 top-3 size-4 text-[#517cad]" aria-hidden="true" />}
            </label>
          )
        })}
      </RadioGroup>

      {approvalCheckFailed && (
        <p className="text-sm text-amber-800" role="status">
          We could not verify offline-payment approval. Credit Card is still available.
        </p>
      )}

      <Dialog open={effectiveBlockedMethod !== null} onOpenChange={(open) => { if (!open) closeBlockedDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Not Approved</DialogTitle>
            <DialogDescription className="leading-6">
              {effectiveBlockedMethod ? paymentApprovalMessage(effectiveBlockedMethod) : ''}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-gray-600">
            Already approved? Check again to continue without restarting your booking.
          </p>
          {recheckMessage && <p className="text-sm font-medium text-amber-800" role="status">{recheckMessage}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button type="button" onClick={recheckBlockedMethod} disabled={recheckingApproval} className="bg-[#1e293b] hover:bg-[#334155]">
              {recheckingApproval && <Loader2 className="animate-spin" aria-hidden="true" />}
              Check Approval Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact ScoreMax</Link>
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Choose Another Payment Method</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
