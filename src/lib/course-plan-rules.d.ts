export type CourseType = 'sat' | 'act' | 'sat-act-combined'

export function normalizeCourseType(value: unknown): CourseType | null
export function courseTypeMatchesSelection(
  courseType: CourseType,
  selection: { isSAT: boolean; isACT: boolean }
): boolean
export function courseTypeFromPricingName(name: string | null | undefined): CourseType | null
