export declare const STRIPE_FIXED_FEE_CENTS: number
export declare const STRIPE_RATE: number

export declare function getOnlinePriceCents(
  basePriceCents: number | null | undefined,
  configuredOnlinePriceCents?: number | null,
): number
