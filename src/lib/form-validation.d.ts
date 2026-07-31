export declare const MAX_EMAIL_LENGTH: number
export declare const MAX_FIELD_LENGTH: number
export declare const MAX_TEXT_LENGTH: number

/** Trimmed string, or null if not a string, empty, or over `maxLength`. */
export declare function cleanString(value: unknown, maxLength?: number): string | null

/** Lower-cased valid email address, or null. */
export declare function cleanEmail(value: unknown): string | null

/** True when the hidden honeypot field was filled in, i.e. a bot. */
export declare function isHoneypotTripped(value: unknown): boolean
