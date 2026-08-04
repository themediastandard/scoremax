export interface AvailabilityWindow {
  day: string
  start: string
  end: string
}

export interface LegacyAvailability {
  days: string[]
  startTime: string
  endTime: string
}

export declare const DAY_NAMES: readonly string[]
export declare const MAX_AVAILABILITY_WINDOWS: number

export declare function cleanTimeOfDay(value: unknown): string | null
export declare function cleanDayName(value: unknown): string | null

export declare function normalizeAvailabilityWindows(
  value: unknown
): AvailabilityWindow[] | null

export declare function legacyAvailabilityFromWindows(
  windows: AvailabilityWindow[] | null | undefined
): LegacyAvailability | null

export declare function availabilityWindowsFromLegacy(
  days: unknown,
  startTime: unknown,
  endTime: unknown
): AvailabilityWindow[] | null

export declare function readAvailabilityWindows(
  booking:
    | {
        available_windows?: unknown
        available_days?: unknown
        available_time_start?: unknown
        available_time_end?: unknown
      }
    | null
    | undefined
): AvailabilityWindow[] | null
