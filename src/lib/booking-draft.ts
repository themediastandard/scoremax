import { DAY_NAMES, type AvailabilityWindow } from './availability-windows.js'

export type BookingDraftSection = 'student' | 'subjects' | 'availability' | 'contact' | 'plan'

export type BookingDraftRevealed = {
  student: boolean
  subjects: boolean
  availability: boolean
  contact: boolean
  plan: boolean
}

export type BookingDraft = {
  version: 1
  studentId: string | null
  subjects: string[]
  availability: {
    windows: AvailabilityWindow[]
    timezone: string
  }
  revealed: BookingDraftRevealed
  activeSection: BookingDraftSection
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

const DRAFT_PREFIX = 'scoremax:booking-draft:v1:'
const SECTIONS = new Set<BookingDraftSection>(['student', 'subjects', 'availability', 'contact', 'plan'])
const DAY_SET = new Set<string>(DAY_NAMES)
const TIME_VALUE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function storageKey(profileId: string) {
  return `${DRAFT_PREFIX}${profileId}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readWindows(value: unknown): AvailabilityWindow[] | null {
  if (!Array.isArray(value) || value.length > 7) return null

  const windows: AvailabilityWindow[] = []
  for (const entry of value) {
    if (!isRecord(entry)) return null
    const day = typeof entry.day === 'string' ? entry.day : ''
    const start = typeof entry.start === 'string' ? entry.start : ''
    const end = typeof entry.end === 'string' ? entry.end : ''
    if (!DAY_SET.has(day)) return null
    if ((start && !TIME_VALUE.test(start)) || (end && !TIME_VALUE.test(end))) return null
    if (windows.some((window) => window.day === day)) return null
    windows.push({ day, start, end })
  }
  return windows
}

function readRevealed(value: unknown): BookingDraftRevealed | null {
  if (!isRecord(value)) return null
  const keys: Array<keyof BookingDraftRevealed> = ['student', 'subjects', 'availability', 'contact', 'plan']
  if (keys.some((key) => typeof value[key] !== 'boolean')) return null
  return Object.fromEntries(keys.map((key) => [key, value[key]])) as BookingDraftRevealed
}

export function parseBookingDraft(raw: string | null): BookingDraft | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.version !== 1) return null
    if (value.studentId !== null && typeof value.studentId !== 'string') return null
    if (!Array.isArray(value.subjects) || value.subjects.length > 50 || value.subjects.some((id) => typeof id !== 'string')) return null
    if (!isRecord(value.availability)) return null
    const windows = readWindows(value.availability.windows)
    const timezone = typeof value.availability.timezone === 'string' && value.availability.timezone.length <= 100
      ? value.availability.timezone
      : null
    const revealed = readRevealed(value.revealed)
    const activeSection = typeof value.activeSection === 'string' && SECTIONS.has(value.activeSection as BookingDraftSection)
      ? value.activeSection as BookingDraftSection
      : null
    if (!windows || !timezone || !revealed || !activeSection) return null

    return {
      version: 1,
      studentId: value.studentId,
      subjects: Array.from(new Set(value.subjects)),
      availability: { windows, timezone },
      revealed,
      activeSection,
    }
  } catch {
    return null
  }
}

export function readBookingDraft(storage: DraftStorage, profileId: string) {
  try {
    return parseBookingDraft(storage.getItem(storageKey(profileId)))
  } catch {
    return null
  }
}

export function writeBookingDraft(storage: DraftStorage, profileId: string, draft: BookingDraft) {
  try {
    storage.setItem(storageKey(profileId), JSON.stringify(draft))
  } catch {
    // A full or unavailable browser store must never block booking.
  }
}

export function clearBookingDrafts(storage: DraftStorage) {
  try {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
    for (const key of keys) {
      if (key?.startsWith(DRAFT_PREFIX)) storage.removeItem(key)
    }
  } catch {
    // Confirmation remains successful even when browser storage is unavailable.
  }
}
