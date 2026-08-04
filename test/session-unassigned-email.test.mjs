import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'

/*
 * src/lib/email-templates.ts is TypeScript, so unlike the .js modules the rest
 * of these tests require() it cannot simply be imported: Node 22.18 strips the
 * types on its own, but it does not know the `@/*` → `./src/*` path alias from
 * tsconfig, and the module imports two of its dependencies through it.
 *
 * These hooks teach the resolver that one mapping, and nothing else. Test files
 * each get their own process under `node --test`, so this affects no other file.
 * The alternative — asserting against the template's source text — would pass
 * happily while the rendered HTML was wrong, and it is the rendered HTML that
 * reaches a tutor's inbox.
 */
const REPO = new URL('../', import.meta.url)
const SRC = new URL('src/', REPO).pathname

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
    const base = SRC + specifier.slice(2)
    const target = [base, `${base}.ts`, `${base}.js`].find((p) => existsSync(p)) ?? base
    return nextResolve(pathToFileURL(target).href, context)
  },
})

// emailLayout() reads this at render time for the logo's link and image src.
// Pinned here so the "no other links" assertion below has a fixed thing to
// exclude, rather than whatever happens to be in the developer's shell.
const SITE = 'https://www.scoremaxtutoring.com'
process.env.NEXT_PUBLIC_APP_URL = SITE

const { sessionUnassignedEmail } = await import(new URL('src/lib/email-templates.ts', REPO).href)

// 4:00 PM Eastern on a summer afternoon — the same instant the reminder tests
// use, so the two suites disagree loudly if the formatting ever diverges.
const START = '2026-08-04T20:00:00.000Z'

function render(overrides = {}) {
  return sessionUnassignedEmail({
    tutorName: 'Dana Reyes',
    studentName: 'Alex Morgan',
    startsAt: START,
    ...overrides,
  })
}

// ---------------------------------------------------------------------------
// Identifying the session. The whole point of this email over Google's own
// attendee-removal notice is that it says which session went away.
// ---------------------------------------------------------------------------

test('names the student and the session time so the tutor knows which session this is', () => {
  const { html } = render()

  assert.ok(html.includes('Alex Morgan'), 'student name missing')
  assert.ok(html.includes('4:00 PM'), html)
  assert.ok(html.includes('August 4, 2026'), html)
  assert.ok(html.includes('(EDT)'), 'no timezone label — a bare time is the wrong time')
})

test('addresses the outgoing tutor by name, and stays sendable without one', () => {
  assert.ok(render().html.includes('Hi Dana Reyes,'))
  assert.ok(render({ tutorName: null }).html.includes('Hi there,'))
  assert.ok(render({ tutorName: '   ' }).html.includes('Hi there,'), 'whitespace is not a name')
})

test('a session with no start says so rather than rendering the epoch', () => {
  const { html } = render({ startsAt: null })
  assert.ok(html.includes('Time to be confirmed'), html)
  assert.ok(!html.includes('1970'), 'a missing start became the epoch')
})

test('a missing student name degrades to a phrase, not to "undefined"', () => {
  const { html } = render({ studentName: null })
  assert.ok(html.includes('a ScoreMax student'), html)
  assert.ok(!html.includes('undefined'), html)
  assert.ok(!html.includes('null'), html)
})

test('says plainly that the session is gone and that nothing is expected of them', () => {
  const { html, subject } = render()
  assert.equal(subject, 'Session Reassigned')
  assert.ok(html.includes('reassigned to another tutor'), html)
  assert.ok(html.includes('nothing you need to do'), html)
})

// ---------------------------------------------------------------------------
// No join link. The tutor has just been removed from the calendar event, so any
// join target is one they would be turned away from.
// ---------------------------------------------------------------------------

test('renders no join link and no call-to-action button', () => {
  const { html } = render()

  // The layout's CTA is the only <a> it emits besides the logo, and the logo
  // link points at the site root. Anything else here is a button we did not
  // mean to ship.
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
  const nonLogo = hrefs.filter((href) => !href.startsWith(SITE))

  assert.deepEqual(nonLogo, [], `unexpected links in the email: ${nonLogo.join(', ')}`)
  assert.ok(!/meet\.google\.com/i.test(html), 'a Meet link reached a tutor who was just removed')
  assert.ok(!/>\s*Join/i.test(html), 'a join button reached a tutor who was just removed')
})

// ---------------------------------------------------------------------------
// Escaping. Student names originate at checkout and tutor names are typed by an
// admin; emailLayout() does not escape `body`, so the template has to.
// ---------------------------------------------------------------------------

test('a student name containing HTML is escaped, not injected', () => {
  const { html } = render({
    studentName: '<a href="https://evil.example/pay">Pay now</a>',
  })

  assert.ok(!html.includes('<a href="https://evil.example/pay">'), 'anchor survived into the body')
  assert.ok(!html.includes('evil.example/pay"'), 'the attacker href survived unescaped')
  assert.ok(html.includes('&lt;a href=&quot;https://evil.example/pay&quot;&gt;'), html)
})

test('a tutor name containing HTML is escaped in the greeting', () => {
  const { html } = render({ tutorName: '<img src=x onerror=alert(1)>' })

  assert.ok(!html.includes('<img src=x'), 'the img tag survived into the greeting')
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), html)
})

test('an apostrophe in a real name survives as an entity, not as a broken attribute', () => {
  const { html } = render({ studentName: "Siobhán O'Neill" })
  assert.ok(html.includes('Siobhán O&#39;Neill'), html)
})

// ---------------------------------------------------------------------------
// Where the send sits. Not a property of the template, but the ordering it
// depends on lives in the route and nothing else asserts it: the reassignment
// must be durable before anyone is told it happened.
// ---------------------------------------------------------------------------

test('the route sends this only from the deferred callback, after the database write', () => {
  const source = readFileSync(
    new URL('src/app/api/admin/sessions/[id]/route.ts', REPO),
    'utf8'
  )

  const deferred = source.indexOf('pendingEmails = async () =>')
  const call = source.indexOf('await sendUnassignedEmail({')

  assert.ok(deferred > 0, 'the reassign branch no longer defers its emails')
  assert.ok(call > deferred, 'the outgoing-tutor send moved out of the deferred callback')

  // One call site. A second, added outside the callback, would fire before the
  // write and could tell a tutor they lost a session that was never saved.
  assert.equal(source.split('await sendUnassignedEmail(').length - 1, 1)
})
