import Stripe from 'stripe'

// Placeholder during build when env missing; Stripe API calls will fail until STRIPE_SECRET_KEY is set
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})
