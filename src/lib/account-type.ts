export const ACCOUNT_TYPES = ['parent', 'student'] as const

export type AccountType = (typeof ACCOUNT_TYPES)[number]

export function isAccountType(value: unknown): value is AccountType {
  return typeof value === 'string' && ACCOUNT_TYPES.includes(value as AccountType)
}

export function formatAccountType(value: AccountType | null | undefined): string {
  if (value === 'parent') return 'Parent/Guardian'
  if (value === 'student') return 'Student'
  return 'Not specified'
}
