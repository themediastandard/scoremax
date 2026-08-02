/**
 * The canonical student grade list, shared by the account settings form and the
 * booking contact step so the two can never offer different values.
 *
 * Both surfaces write to customers.student_grade, and each prefills from it, so
 * a mismatch here would let a booking overwrite a setting with a string the
 * settings dropdown cannot display.
 */
const K12_GRADES: string[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return `${n}${suffix} Grade`
})

// College and Graduate close the list: the catalog tutors college subjects,
// and GRE/GMAT/LSAT prep is taken by post-college students.
export const GRADE_OPTIONS: string[] = [...K12_GRADES, 'College', 'Graduate']
