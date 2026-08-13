'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatAccountType, type AccountType } from '@/lib/account-type'

export function AccountTypeControl({
  customerId,
  customerName,
  initialAccountType,
}: {
  customerId: string
  customerName: string
  initialAccountType: AccountType | null
}) {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAccountType = async (nextType: AccountType) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/account-type`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_type: nextType }),
        }
      )
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.accountType !== nextType) {
        throw new Error(result?.error || 'Could not update account type')
      }
      setAccountType(nextType)
      router.refresh()
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'Could not update account type'
      )
    } finally {
      setSaving(false)
    }
  }

  const controlId = `account-type-${customerId}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={controlId}>Account holder</Label>
        {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-label="Saving" />}
      </div>
      <Select
        value={accountType ?? ''}
        onValueChange={(value) => void updateAccountType(value as AccountType)}
        disabled={saving}
      >
        <SelectTrigger id={controlId} aria-label={`Account type for ${customerName}`}>
          <SelectValue placeholder="Select account type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="parent">{formatAccountType('parent')}</SelectItem>
          <SelectItem value="student">{formatAccountType('student')}</SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
