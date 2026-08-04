import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security response headers.
 *
 * Netlify already serves two of these on its own — Strict-Transport-Security
 * (max-age 1 year, includeSubDomains, preload) and X-Content-Type-Options:
 * nosniff — so they are deliberately NOT repeated here; setting them again would
 * only emit duplicates. Verified against the live site on 2026-07-28. If this
 * app ever moves off Netlify, both need adding to this list.
 *
 * Content-Security-Policy is intentionally absent for now. It is the header that
 * actually stops injected scripts running, but the app loads Stripe, Supabase,
 * Google Fonts and inline JSON-LD, and a policy that is even slightly too strict
 * silently breaks checkout. It should ship as Content-Security-Policy-Report-Only
 * first, be observed against real traffic, and only then be enforced.
 */
const securityHeaders = [
  {
    // No page in this app is ever framed — there is not a single <iframe> in
    // src/ — so DENY rather than SAMEORIGIN. Blocks clickjacking, where the
    // admin dashboard is loaded invisibly over a decoy page and a signed-in
    // admin is tricked into clicking something destructive such as a refund.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Send only the origin to other sites, never the full path or query.
    // Concretely: password-reset links carry a token in the URL (Netlify
    // preserves the query string across the auth callback redirect), and
    // without this header that whole URL would be handed to any third-party
    // destination the user clicks through to.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // The app calls none of these APIs — confirmed by searching src/ for
    // getUserMedia, navigator.geolocation and friends — so switch them off
    // entirely. Injected code then cannot reach for a visitor's camera,
    // microphone or location.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Drops the "X-Powered-By: Next.js" header, which tells an attacker exactly
  // which framework and therefore which CVEs to try.
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Every route, including API responses.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

/**
 * Sentry wraps the config to build source maps and instrument the server.
 *
 * Every credential is optional on purpose. With no SENTRY_AUTH_TOKEN the plugin
 * skips the source-map upload and warns rather than failing — which keeps
 * `next build` working locally and on any deploy where the secrets are not set.
 * Without source maps, stack traces arrive minified but still arrive.
 *
 * Note this is the one place Sentry runs regardless of NEXT_PUBLIC_SENTRY_DSN;
 * the SDK itself is inert without it (see sentry.server.config.ts).
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // The build already logs plenty; only speak up in CI.
  silent: !process.env.CI,

  // Netlify serves client chunks from paths the default glob misses.
  widenClientFileUpload: true,

  // Strips Sentry's own debug logging from the client bundle. (The older
  // `disableLogger` flag is deprecated in v10 and warns on every build.)
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },

  telemetry: false,
});
