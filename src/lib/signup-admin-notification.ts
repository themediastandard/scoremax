import 'server-only'

import { detailRow, emailLayout } from '@/lib/email-templates'
import { getEmailDefaults, sendEmail } from '@/lib/resend'
import {
  SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY,
  SIGNUP_ADMIN_NOTIFICATION_SENT_KEY,
} from '@/lib/signup-onboarding'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SignupAccountType = 'parent' | 'student'

type SignupCustomer = {
  id: string
  full_name: string
  email: string
  phone: string | null
  account_type: SignupAccountType | null
}

type SignupStudent = {
  full_name: string
  email: string
  phone: string | null
  grade: string | null
  is_active: boolean
}

type NotifyAdminsOfSignupOptions = {
  userId: string
  customer: SignupCustomer
  students: SignupStudent[]
  notificationPending: boolean
}

function notificationEmails(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return [...new Set(value.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))]
}

/**
 * Notify the configured operations inboxes after a confirmed customer signup
 * has finished account classification and student creation.
 *
 * The durable customer/student rows remain authoritative, so email is best
 * effort and never rolls back or blocks the signup response. A trusted Auth
 * app-metadata marker prevents returning customers from being reported as new.
 * A stable Resend key also collapses concurrent completion requests while the
 * marker write is in flight.
 */
export async function notifyAdminsOfSignup({
  userId,
  customer,
  students,
  notificationPending,
}: NotifyAdminsOfSignupOptions): Promise<void> {
  if (!notificationPending || !customer.account_type) return

  const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
  const authUser = authUserData?.user
  if (authUserError || !authUser) {
    console.error(`[email:signup:admin:${userId}] could not verify the signup notification marker`)
    return
  }

  if (typeof authUser.app_metadata?.[SIGNUP_ADMIN_NOTIFICATION_SENT_KEY] === 'string') return
  if (authUser.app_metadata?.[SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY] !== true) return

  const { data: adminSettings, error: settingsError } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', 'notification_emails')
    .maybeSingle()
  const adminEmails = notificationEmails(adminSettings?.value)
  if (settingsError || adminEmails.length === 0) {
    console.error(
      `[email:signup:admin:${userId}] admin_settings.notification_emails is unavailable — the confirmed signup remains pending notification`
    )
    return
  }

  const accountLabel = customer.account_type === 'parent' ? 'Parent/Guardian' : 'Student'
  const activeStudents = students.filter((student) => student.is_active)
  const studentRows = activeStudents.length > 0
    ? activeStudents.map((student, index) => detailRow(
        activeStudents.length === 1 ? 'Student:' : `Student ${index + 1}:`,
        [student.full_name, student.grade, student.email, student.phone]
          .map((value) => value?.trim())
          .filter(Boolean)
          .join(' · ')
      ))
    : [detailRow('Students:', 'No active student profile yet')]
  const subject = `New ${accountLabel} Signup`

  const sent = await sendEmail(
    {
      ...getEmailDefaults(),
      to: adminEmails,
      replyTo: customer.email,
      subject,
      html: emailLayout({
        title: subject,
        body: [
          detailRow('Account Owner:', customer.full_name || 'New User'),
          detailRow('Email:', customer.email),
          detailRow('Phone:', customer.phone?.trim() || 'Not provided'),
          detailRow('Account Type:', accountLabel),
          ...studentRows,
        ].join(''),
        ctaText: 'View Customer',
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com'}/dashboard/customers/${customer.id}`,
      }),
    },
    `signup:admin:${userId}`,
    `admin-signup-${userId}`
  )

  if (!sent) return

  const { error: markerError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...authUser.app_metadata,
      [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: null,
      [SIGNUP_ADMIN_NOTIFICATION_SENT_KEY]: new Date().toISOString(),
    },
  })
  if (markerError) {
    console.error(`[email:signup:admin:${userId}] sent but could not persist the delivery marker`)
  }
}
