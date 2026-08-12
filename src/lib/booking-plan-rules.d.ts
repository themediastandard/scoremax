export type BookingSubject = {
  slug?: string | null
}

export function getSatActSelection(
  subjectIds: string[],
  subjectMap: Record<string, BookingSubject | undefined>
): { isSAT: boolean; isACT: boolean }

export function hasSatOrActSubject(
  subjectIds: string[],
  subjectMap: Record<string, BookingSubject | undefined>
): boolean

export function canPurchaseMembershipForSubjects(
  subjectIds: string[],
  subjectMap: Record<string, BookingSubject | undefined>
): boolean
