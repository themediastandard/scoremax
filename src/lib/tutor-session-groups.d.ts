export type TutorSessionForGrouping = {
  status?: string | null
  confirmed_start?: string | null
}

export declare function groupTutorSessions<T extends TutorSessionForGrouping>(
  sessions: T[],
  now?: string | number | Date,
): { upcoming: T[]; past: T[] }

export declare function isSafeHttpUrl(value: unknown): value is string
