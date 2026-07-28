import type { NextConfig } from "next";

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

export default nextConfig;
