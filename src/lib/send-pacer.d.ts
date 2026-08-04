export type PacerOptions = {
  /** Minimum gap between the starts of two consecutive tasks, in milliseconds. */
  intervalMs: number
  /** Injectable clock. Defaults to `Date.now`. */
  now?: () => number
  /** Injectable timer. Defaults to a `setTimeout` promise. */
  sleep?: (ms: number) => Promise<void>
}

/** Runs a task once its slot comes up. Never rejects on the pacing's behalf. */
export type Pacer = <T>(task: () => Promise<T>) => Promise<T>

export function createPacer(options: PacerOptions): Pacer
