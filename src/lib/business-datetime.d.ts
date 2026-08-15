export declare const BUSINESS_TIME_ZONE: 'America/New_York'

export declare function businessDateTimeInputValues(
  value: string | number | Date | null | undefined,
): { date: string; time: string }

export declare function formatBusinessDate(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string | null

export declare function formatBusinessDateTime(
  value: string | number | Date | null | undefined,
): string | null

export declare function formatBusinessTime(
  value: string | number | Date | null | undefined,
): string | null
