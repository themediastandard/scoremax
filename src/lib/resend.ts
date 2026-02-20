import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export function getEmailDefaults() {
  const from = process.env.RESEND_FROM_EMAIL ?? 'ScoreMax <noreply@scoremaxtutoring.com>'
  return { from }
}