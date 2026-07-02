import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export const GOOGLE_OAUTH_STATE_COOKIE = 'scoremax_google_oauth_state'

type GoogleCalendarRole = 'customer' | 'tutor'

export interface GoogleOAuthStatePayload {
  role: GoogleCalendarRole
  userId: string
  nonce: string
  iat: number
}

function getStateSecret() {
  const secret =
    process.env.GOOGLE_OAUTH_STATE_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) {
    throw new Error('Missing OAuth state signing secret')
  }

  return secret
}

function sign(value: string) {
  return createHmac('sha256', getStateSecret()).update(value).digest('base64url')
}

export function createGoogleOAuthNonce() {
  return randomBytes(24).toString('base64url')
}

export function createGoogleOAuthState(payload: GoogleOAuthStatePayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export function verifyGoogleOAuthState(state: string, maxAgeMs = 10 * 60 * 1000) {
  const [encoded, signature] = state.split('.')
  if (!encoded || !signature) {
    throw new Error('Invalid OAuth state')
  }

  const expected = sign(encoded)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid OAuth state signature')
  }

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as GoogleOAuthStatePayload
  if (payload.role !== 'customer' && payload.role !== 'tutor') {
    throw new Error('Invalid OAuth state role')
  }
  if (!payload.userId || !payload.nonce || !payload.iat) {
    throw new Error('Incomplete OAuth state')
  }
  if (Date.now() - payload.iat > maxAgeMs) {
    throw new Error('Expired OAuth state')
  }

  return payload
}
