'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PricingForm } from '@/components/dashboard/PricingForm'
import { Loader2, Pencil } from 'lucide-react'

interface PricingRow {
  id: string
  name: string
  type: string
  tier: string | null
  price_cents: number
  stripe_price_id: string | null
  included_hours: number | null
  is_active: boolean
}

const typeLabels: Record<string, string> = {
  membership: 'Membership',
  package: 'Package',
  course: 'Course',
  'sat-course-inperson': 'In-Person SAT Course',
  single: 'Single Session',
}

function getNonEditableReason(item: PricingRow): string | null {
  // Stripe bills subscriptions off stripe_price_id, so editing the table's
  // price would not change what members are charged.
  if (item.type === 'membership' && item.stripe_price_id) return 'Handled by Stripe'
  return null
}

export function PricingTable() {
  const [items, setItems] = useState<PricingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <>
    {/* Stacked cards below md — the five-column table was clipped by
        overflow-hidden on phones, hiding Price/Hours/Actions entirely. */}
    <div className="md:hidden space-y-3">
      {items.map((item) => {
        const reason = getNonEditableReason(item)
        return (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {typeLabels[item.type] || item.type}
                  {item.included_hours != null && ` · ${item.included_hours} hrs`}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">
                ${(item.price_cents / 100).toLocaleString()}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
              {reason ? (
                <span className="text-xs text-muted-foreground">{reason}</span>
              ) : (
                <PricingForm item={item}>
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    Edit
                  </Button>
                </PricingForm>
              )}
            </div>
          </div>
        )
      })}
      {items.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
          No pricing records found.
        </div>
      )}
    </div>

    <div className="hidden md:block bg-white rounded-md border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {typeLabels[item.type] || item.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${(item.price_cents / 100).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.included_hours ?? '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                {getNonEditableReason(item) ? (
                  <span className="text-xs text-muted-foreground">{getNonEditableReason(item)}</span>
                ) : (
                  <PricingForm item={item}>
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                  </PricingForm>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No pricing records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  )
}
