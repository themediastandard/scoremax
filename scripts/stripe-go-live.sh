#!/usr/bin/env bash
#
# Create the live-mode Stripe objects ScoreMax needs, and print the IDs.
#
# Run this yourself, with your own live key. It is written this way so the
# secret key never has to be pasted anywhere but your own terminal:
#
#   STRIPE_API_KEY='sk_live_...' ./scripts/stripe-go-live.sh
#
# What it creates:
#   * three recurring monthly Prices, one per membership tier. These are the
#     only plans that need a real Price object — packages, courses and single
#     sessions are built as inline price_data from the `pricing` table, so they
#     carry over with no Stripe-side work.
#   * the live webhook endpoint, subscribed to all seven events the handler in
#     src/app/api/stripe/webhook/route.ts actually implements.
#
# What it does NOT do, deliberately:
#   * touch Netlify environment variables — set those in the Netlify UI and
#     redeploy, because env changes only take effect on the next build
#   * write to Supabase — hand the printed price IDs over and they go into
#     pricing.stripe_price_id, which is what checkout resolves against
#
set -euo pipefail

# Prefer an explicit STRIPE_API_KEY, otherwise read STRIPE_LIVE_SECRET_KEY out
# of .env.local. That file is gitignored, and the value is never echoed — this
# is only so the key does not have to be retyped on a command line, where it
# would land in shell history.
if [[ -z "${STRIPE_API_KEY:-}" ]]; then
  env_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.env.local"
  if [[ -f "$env_file" ]]; then
    STRIPE_API_KEY="$(grep -m1 '^STRIPE_LIVE_SECRET_KEY=' "$env_file" 2>/dev/null | cut -d= -f2- | tr -d '"'"'"' \r' || true)"
  fi
fi

if [[ -z "${STRIPE_API_KEY:-}" ]]; then
  echo "No live key found." >&2
  echo "Either set STRIPE_LIVE_SECRET_KEY in .env.local, or run with" >&2
  echo "  STRIPE_API_KEY='sk_live_...' $0" >&2
  exit 1
fi

case "$STRIPE_API_KEY" in
  sk_live_*) ;;
  *)
    echo "Refusing to run: STRIPE_API_KEY is not a live key (expected sk_live_...)." >&2
    echo "Test mode is already configured; there is nothing for this script to do there." >&2
    exit 1
    ;;
esac

# The site must already resolve, or Stripe will deliver events to a domain that
# is not yet serving this app.
WEBHOOK_URL="${WEBHOOK_URL:-https://www.scoremaxtutoring.com/api/stripe/webhook}"

api() {
  local method="$1" path="$2"; shift 2
  curl -sS -X "$method" "https://api.stripe.com/v1${path}" -u "${STRIPE_API_KEY}:" "$@"
}

json_field() { python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$1',''))"; }

die_on_error() {
  python3 - "$1" <<'PY'
import sys, json
raw = sys.argv[1]
d = json.loads(raw)
if 'error' in d:
    sys.stderr.write("Stripe error: " + d['error'].get('message', 'unknown') + "\n")
    sys.exit(1)
PY
}

echo "Creating live membership prices..."
echo

# tier | display name | cents per month
MEMBERSHIPS='starter|Starter Membership|29900
core|Core Membership|54900
premier|Premier Membership|89900'

declare -a RESULTS=()

while IFS='|' read -r tier name cents; do
  product_json=$(api POST /products \
    -d "name=${name}" \
    -d "metadata[tier]=${tier}")
  die_on_error "$product_json"
  product_id=$(printf '%s' "$product_json" | json_field id)

  price_json=$(api POST /prices \
    -d "product=${product_id}" \
    -d "unit_amount=${cents}" \
    -d "currency=usd" \
    -d "recurring[interval]=month" \
    -d "metadata[tier]=${tier}")
  die_on_error "$price_json"
  price_id=$(printf '%s' "$price_json" | json_field id)

  printf '  %-10s %-22s $%s/month\n' "$tier" "$name" "$((cents / 100))"
  printf '             product %s\n' "$product_id"
  printf '             price   %s\n\n' "$price_id"
  RESULTS+=("${tier}|${price_id}")
done <<< "$MEMBERSHIPS"

echo "Creating live webhook endpoint at ${WEBHOOK_URL}..."
echo

endpoint_json=$(api POST /webhook_endpoints \
  -d "url=${WEBHOOK_URL}" \
  -d "description=ScoreMax production" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=checkout.session.expired" \
  -d "enabled_events[]=invoice.paid" \
  -d "enabled_events[]=charge.refunded" \
  -d "enabled_events[]=charge.dispute.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted")
die_on_error "$endpoint_json"

webhook_secret=$(printf '%s' "$endpoint_json" | json_field secret)
webhook_id=$(printf '%s' "$endpoint_json" | json_field id)

echo "  endpoint $webhook_id"
echo "  events   7"
echo

cat <<BANNER
────────────────────────────────────────────────────────────────────
NEXT STEPS

1. Set these on Netlify, then trigger a redeploy — environment changes
   only take effect on the next build:

     STRIPE_SECRET_KEY            your sk_live_... key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   your pk_live_... key
     STRIPE_WEBHOOK_SECRET        ${webhook_secret}
     NEXT_PUBLIC_APP_URL          https://www.scoremaxtutoring.com

2. Hand over these price IDs so pricing.stripe_price_id can be updated
   in Supabase. Checkout resolves prices from that table, so a stale ID
   means a failed checkout. These are not secrets.

BANNER

for row in "${RESULTS[@]}"; do
  printf '     %-10s %s\n' "${row%%|*}" "${row##*|}"
done

cat <<'BANNER'

3. Configure the Customer Portal in live mode (plan switching and
   cancellation) — https://dashboard.stripe.com/settings/billing/portal

4. Place one real low-value purchase end to end, then refund it, and
   confirm the credit is revoked.

The webhook signing secret above is a credential. Paste it straight into
Netlify; do not put it in chat, a ticket, or this repo.
────────────────────────────────────────────────────────────────────
BANNER
