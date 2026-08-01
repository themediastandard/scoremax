import { notFound } from 'next/navigation'

// Cohorts are hidden — SAT/ACT course cohorts are no longer offered.
// The previous admin UI (CohortForm / CohortRow + sat_course_cohorts queries)
// is in git history; restore it here if cohorts ever come back.
export default function CohortsPage() {
  notFound()
}
