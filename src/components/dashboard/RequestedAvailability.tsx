import { Clock } from 'lucide-react'
import { formatTime24To12 } from '@/lib/order-format'
import { readAvailabilityWindows } from '@/lib/availability-windows'

/**
 * What the customer said they were free for, as stated on the booking form.
 *
 * Shared by the order detail page and the admin scheduling form so both show
 * the same thing — whoever picks confirmed_start/confirmed_end was previously
 * choosing without ever seeing this.
 *
 * Takes the raw booking row rather than parsed windows: it handles both the
 * per-day `available_windows` array and the flat available_days/start/end
 * triple that pre-2026-08-04 rows carry, so callers just pass the row through.
 * No hooks, so this renders in both server and client components.
 */
export function RequestedAvailability({
  booking,
  className = '',
}: {
  booking:
    | {
        available_windows?: unknown
        available_days?: unknown
        available_time_start?: unknown
        available_time_end?: unknown
        timezone?: string | null
      }
    | null
    | undefined
  className?: string
}) {
  const windows = readAvailabilityWindows(booking)
  if (!windows) return null

  // Pre-2026-08-04 rows are one range across every day, so listing each day on
  // its own line would only repeat the same times. Say it once instead.
  const isSingleRange =
    windows.length > 1 &&
    windows.every((w) => w.start === windows[0].start && w.end === windows[0].end)

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        Requested Availability
      </p>
      <div className="rounded-lg bg-amber-50/60 border border-amber-100 p-4 space-y-2">
        {isSingleRange ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {windows.map((w) => (
                <span
                  key={w.day}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-sm font-medium text-amber-800"
                >
                  {w.day}
                </span>
              ))}
            </div>
            <p className="text-sm text-amber-800">
              {formatTime24To12(windows[0].start)} – {formatTime24To12(windows[0].end)}
            </p>
          </>
        ) : (
          <ul className="space-y-1">
            {windows.map((w) => (
              <li key={w.day} className="flex items-baseline gap-2 text-sm text-amber-900">
                <span className="min-w-[5.5rem] font-medium">{w.day}</span>
                <span className="text-amber-800">
                  {formatTime24To12(w.start)} – {formatTime24To12(w.end)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {booking?.timezone && (
          <p className="text-xs text-amber-600">Times are in {booking.timezone}</p>
        )}
      </div>
    </div>
  )
}
