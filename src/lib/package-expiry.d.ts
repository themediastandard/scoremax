export declare const PACKAGE_VALIDITY_MONTHS: number

/** ISO 8601 timestamp one year after `purchasedAt` (defaults to now). */
export declare function packageExpiresAt(purchasedAt?: Date | string | number): string

/** PostgREST `.or()` clause matching packages that have not expired. */
export declare function unexpiredPackagesClause(now?: Date): string
