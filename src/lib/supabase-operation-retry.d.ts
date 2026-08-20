export type SupabaseOperationError = {
  message?: string
  details?: string
  hint?: string
  code?: string
  cause?: unknown
}

export type SupabaseOperationResponse<T> = {
  data: T | null
  error: SupabaseOperationError | null
  status: number
  statusText: string
  count?: number | null
}

export type SupabaseFailureCategory = {
  retryable: boolean
  category: 'http' | 'transport' | 'non-retryable'
  status: number
  code: string | null
}

export type SupabaseRetryOptions = {
  operation: string
  maxAttempts?: number
  delaysMs?: number[]
  deadlineAt?: number
  now?: () => number
  sleep?: (delayMs: number) => Promise<void>
}

export type SupabaseRetryOutcome<T> = {
  operation: string
  response: SupabaseOperationResponse<T>
  attempts: number
  maxAttempts: number
  exhausted: boolean
  failure: SupabaseFailureCategory | null
}

export function retrySupabaseOperation<T>(
  operation: (attempt: number) => PromiseLike<SupabaseOperationResponse<T>>,
  options: SupabaseRetryOptions
): Promise<SupabaseRetryOutcome<T>>

export type RowWithId = { id: string }

export function mergeRowsById<T extends RowWithId>(
  ...groups: Array<T[] | null | undefined>
): T[]

export type ConditionalUpdateRecoveryResult<T extends RowWithId> =
  | {
      ok: true
      rows: T[]
      updateOutcome: SupabaseRetryOutcome<T[]> | null
      recoveryOutcome: SupabaseRetryOutcome<T[]> | null
      recoveredAfterUncertainUpdate: boolean
    }
  | {
      ok: false
      stage: 'update' | 'recovery'
      rows: []
      updateOutcome: SupabaseRetryOutcome<T[]>
      recoveryOutcome: SupabaseRetryOutcome<T[]> | null
      recoveredAfterUncertainUpdate: false
    }

export function runConditionalUpdateWithRecovery<T extends RowWithId>(options: {
  expectedRows: T[]
  update: (attempt: number) => PromiseLike<SupabaseOperationResponse<T[]>>
  loadCompletedRows: (ids: string[]) => PromiseLike<SupabaseOperationResponse<T[]>>
  updateRetry: SupabaseRetryOptions
  recoveryRetry: SupabaseRetryOptions
}): Promise<ConditionalUpdateRecoveryResult<T>>
