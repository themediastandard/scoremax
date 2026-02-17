# Stripe Setup Guide — ScoreMax

Step-by-step instructions for setting up Stripe payments (test mode first, then production).

---

## Part 1: Test Mode (Initial Setup)

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure you’re in **Test mode** (toggle in the top right)
3. **Developers → API keys**
4. Copy:
   - **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

### 2. Create the 3 Membership Products & Prices

Only membership plans need pre-created Stripe products/prices. Packages, courses, and single sessions use dynamic pricing at checkout.

| Membership | Price | Included Hours |
|------------|-------|----------------|
| Starter    | $299/mo | 2 |
| Core       | $549/mo | 4 |
| Premier    | $899/mo | 8 |

**Option A: Stripe Dashboard**

1. **Products → Add product**
2. For each membership:
   - **Name:** e.g. `ScoreMax Starter Membership`
   - **Pricing:** One-time → switch to **Recurring**
   - **Amount:** 299.00 USD (or 549, 899)
   - **Billing period:** Monthly
   - Click **Save product**
3. After saving, open the product → **Pricing** → copy the **Price ID** (e.g. `price_1ABC...`). You need the **Price ID**, not the Product ID.

**Option B: Stripe CLI**

```bash
# Starter
stripe products create --name "ScoreMax Starter Membership"
stripe prices create --product prod_XXX --unit-amount 29900 --currency usd --recurring[interval]=month

# Core
stripe products create --name "ScoreMax Core Membership"
stripe prices create --product prod_XXX --unit-amount 54900 --currency usd --recurring[interval]=month

# Premier
stripe products create --name "ScoreMax Premier Membership"
stripe prices create --product prod_XXX --unit-amount 89900 --currency usd --recurring[interval]=month
```

Copy each resulting `price_xxx` ID.

### 3. Update the `pricing` Table in Supabase

1. Open **Supabase Dashboard → Table Editor → `pricing`**
2. Find the 3 membership rows (where `type = 'membership'`)
3. Update `stripe_price_id` for each:
   - Starter → Paste the Starter price ID
   - Core → Paste the Core price ID  
   - Premier → Paste the Premier price ID

### 4. Set Up the Webhook (Test Mode)

1. **Developers → Webhooks → Add endpoint**
2. **Endpoint URL:**  
   - Local: `https://YOUR_NGROK_OR_TUNNEL_URL/api/stripe/webhook`  
   - Netlify: `https://scoremaxtutor.netlify.app/api/stripe/webhook`
3. **Events to send:** Select `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`
4. **Add endpoint**
5. Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

**Local testing:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the temporary secret printed by this command in `.env.local` while developing locally.

### 5. Environment Variables

Add or update in `.env.local` (and Netlify env vars for deployed test):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6. Verify

1. Run `npm run dev`
2. Go to `/book`, pick subjects, choose a membership plan
3. Use test card `4242 4242 4242 4242`
4. Confirm checkout completes and the webhook runs (check Stripe Dashboard → Webhooks → your endpoint → Recent deliveries)

---

## Part 2: Production Setup (When Going Live)

Stripe test and live data are separate. Repeat the flow above in Live mode.

### 1. Switch to Live Mode

1. In Stripe Dashboard, toggle **Test mode** → **Live mode**
2. Complete account activation if prompted

### 2. Create Membership Products/Prices Again

Create the same 3 products and recurring prices in Live mode. You will get new Live Price IDs (`price_xxx`).

### 3. Update the `pricing` Table

Two approaches:

**A. Single prod database:** Update `stripe_price_id` for each membership row to the Live Price IDs. Test mode memberships will no longer work against this DB.

**B. Separate prod database:** Use a dedicated production Supabase project and set `stripe_price_id` there to the Live Price IDs.

### 4. Add Live Webhook

1. **Developers → Webhooks → Add endpoint**
2. **Endpoint URL:** `https://www.scoremaxtutoring.com/api/stripe/webhook` (or your prod domain)
3. **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the Live **Signing secret** → use for prod env

### 5. Update Production Environment Variables

On Netlify (or your host):

| Variable | Change to |
|----------|-----------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Live webhook `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | `https://www.scoremaxtutoring.com` |

### 6. Test in Production

1. Deploy
2. Do a small real charge (or use a live test payment if applicable)
3. Confirm webhook deliveries in Live mode
4. Check that memberships, packages, and courses are created correctly

---

## What Does *Not* Need Stripe Setup

| Item | Why |
|------|-----|
| Packages (10hr, 20hr) | Uses `price_data`; created at checkout |
| Courses (SAT, ACT, combined) | Same |
| In-person SAT course | Same |
| Single sessions | Same |

Only the 3 membership subscription prices must be created in Stripe.

---

## Quick Reference

| Env Var | Test | Live |
|---------|------|------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Test webhook `whsec_...` | Live webhook `whsec_...` |

| Data | Test | Live |
|------|------|------|
| Membership products/prices | Create in test | Create again in live |
| `pricing.stripe_price_id` | Test Price IDs | Live Price IDs |
| Webhook endpoint | One for test | One for live |
