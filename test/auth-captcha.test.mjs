import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const component = readSource('src/components/auth/AuthTurnstile.tsx')
const register = readSource('src/app/register/page.tsx')
const login = readSource('src/app/login/page.tsx')
const forgotPassword = readSource('src/app/forgot-password/page.tsx')

test('auth CAPTCHA is configured from a public Turnstile site key', () => {
  assert.match(component, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/)
  assert.match(component, /@marsidev\/react-turnstile/)
  assert.match(component, /onExpire=\{\(\) => onTokenChange\(null\)\}/)
  assert.match(component, /onError=\{\(\) => onTokenChange\(null\)\}/)
})

test('email signup passes a Turnstile token to Supabase Auth', () => {
  assert.match(register, /action="register"/)
  assert.match(register, /signUp\(\{/)
  assert.match(register, /captchaToken/)
  assert.match(register, /AUTH_CAPTCHA_CONFIGURED && !captchaToken/)
})

test('password sign-in passes a Turnstile token to Supabase Auth', () => {
  assert.match(login, /action="login"/)
  assert.match(login, /signInWithPassword\(\{/)
  assert.match(login, /captchaToken/)
  assert.match(login, /AUTH_CAPTCHA_CONFIGURED && !captchaToken/)
})

test('unconfirmed email sign-in gives the customer a clear next step', () => {
  assert.match(login, /error\.code === 'email_not_confirmed'/)
  assert.match(
    login,
    /Please confirm your email before signing in\. Check your inbox or junk folder for the confirmation email\./
  )
})

test('password recovery passes a Turnstile token to Supabase Auth', () => {
  assert.match(forgotPassword, /action="password-reset"/)
  assert.match(forgotPassword, /resetPasswordForEmail\(email/)
  assert.match(forgotPassword, /captchaToken/)
  assert.match(forgotPassword, /AUTH_CAPTCHA_CONFIGURED && !captchaToken/)
})
