const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504, 520])
const RETRYABLE_TRANSPORT_CODES = [
  'EAI_AGAIN',
  'ECONNRESET',
  'ETIMEDOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
]

const DEFAULT_DELAYS_MS = [75, 150]

function record(value) {
  return value && typeof value === 'object' ? value : null
}

function safeStatus(value) {
  const status = Number(value)
  return Number.isInteger(status) && status >= 0 ? status : 0
}

function safeErrorCode(value) {
  return typeof value === 'string' && /^[A-Z0-9_]{1,40}$/.test(value)
    ? value
    : null
}

function transportCode(error) {
  const errorRecord = record(error)
  const cause = record(errorRecord?.cause)
  const directCodes = [errorRecord?.code, cause?.code]

  for (const code of directCodes) {
    if (typeof code !== 'string') continue
    const normalized = code.toUpperCase()
    if (RETRYABLE_TRANSPORT_CODES.includes(normalized)) return normalized
  }

  const diagnosticText = [
    errorRecord?.message,
    errorRecord?.details,
    cause?.message,
  ].filter((value) => typeof value === 'string').join('\n')

  for (const code of RETRYABLE_TRANSPORT_CODES) {
    if (diagnosticText.toUpperCase().includes(code)) return code
  }

  return null
}

function classifyFailure(response) {
  if (!response?.error) return null

  const status = safeStatus(response.status)
  const errorRecord = record(response.error)
  const responseCode = safeErrorCode(errorRecord?.code)

  if (RETRYABLE_HTTP_STATUSES.has(status)) {
    return {
      retryable: true,
      category: 'http',
      status,
      code: responseCode ?? `HTTP_${status}`,
    }
  }

  if (status === 0) {
    const code = transportCode(response.error)
    if (code) {
      return {
        retryable: true,
        category: 'transport',
        status,
        code,
      }
    }
  }

  return {
    retryable: false,
    category: 'non-retryable',
    status,
    code: responseCode,
  }
}

function thrownResponse(error) {
  const errorRecord = record(error)
  const cause = record(errorRecord?.cause)
  const name = typeof errorRecord?.name === 'string' ? errorRecord.name : 'Error'
  const message = typeof errorRecord?.message === 'string'
    ? errorRecord.message
    : 'Unknown Supabase transport failure'
  const causeCode = typeof cause?.code === 'string' ? cause.code : ''
  const causeMessage = typeof cause?.message === 'string' ? cause.message : ''

  return {
    data: null,
    error: {
      message: `${name}: ${message}`,
      details: cause
        ? `Caused by: ${causeMessage}${causeCode ? ` (${causeCode})` : ''}`
        : '',
      hint: '',
      code: '',
      cause,
    },
    status: safeStatus(errorRecord?.status),
    statusText: '',
  }
}

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

/**
 * Retries one explicitly supplied Supabase operation. It never reports or
 * retries a surrounding workflow, so callers retain control over side effects.
 */
export async function retrySupabaseOperation(operation, options) {
  const operationName = options?.operation ?? 'supabase-operation'
  const maxAttempts = Math.max(1, Math.min(3, options?.maxAttempts ?? 3))
  const delaysMs = options?.delaysMs ?? DEFAULT_DELAYS_MS
  const deadlineAt = options?.deadlineAt ?? Number.POSITIVE_INFINITY
  const now = options?.now ?? Date.now
  const sleep = options?.sleep ?? defaultSleep

  let attempts = 0
  while (attempts < maxAttempts) {
    attempts += 1
    let response
    try {
      response = await operation(attempts)
    } catch (error) {
      response = thrownResponse(error)
    }

    const failure = classifyFailure(response)
    if (!failure) {
      return {
        operation: operationName,
        response,
        attempts,
        maxAttempts,
        exhausted: false,
        failure: null,
      }
    }

    if (!failure.retryable) {
      return {
        operation: operationName,
        response,
        attempts,
        maxAttempts,
        exhausted: false,
        failure,
      }
    }

    const delayMs = Math.max(0, Number(delaysMs[attempts - 1] ?? 0))
    const cannotRetry = attempts >= maxAttempts || now() + delayMs >= deadlineAt
    if (cannotRetry) {
      return {
        operation: operationName,
        response,
        attempts,
        maxAttempts,
        exhausted: true,
        failure,
      }
    }

    await sleep(delayMs)
  }

  throw new Error('Supabase retry loop exited without a result')
}

export function mergeRowsById(...groups) {
  const rows = new Map()
  for (const group of groups) {
    for (const row of group ?? []) {
      if (row && typeof row.id === 'string') rows.set(row.id, row)
    }
  }
  return Array.from(rows.values())
}

/**
 * Reconciles a guarded conditional UPDATE when a transient response may have
 * been lost after Postgres committed. Recovery is a read of only the IDs that
 * were known to match immediately before the UPDATE.
 */
export async function runConditionalUpdateWithRecovery({
  expectedRows,
  update,
  loadCompletedRows,
  updateRetry,
  recoveryRetry,
}) {
  if (expectedRows.length === 0) {
    return {
      ok: true,
      rows: [],
      updateOutcome: null,
      recoveryOutcome: null,
      recoveredAfterUncertainUpdate: false,
    }
  }

  const updateOutcome = await retrySupabaseOperation(update, updateRetry)
  const updateRows = Array.isArray(updateOutcome.response.data)
    ? updateOutcome.response.data
    : []

  if (updateOutcome.response.error && updateOutcome.attempts === 1 && !updateOutcome.exhausted) {
    return {
      ok: false,
      stage: 'update',
      rows: [],
      updateOutcome,
      recoveryOutcome: null,
      recoveredAfterUncertainUpdate: false,
    }
  }

  const updatedIds = new Set(updateRows.map((row) => row.id))
  const rowsToConfirm = updateOutcome.response.error
    ? expectedRows
    : updateOutcome.attempts > 1
      ? expectedRows.filter((row) => !updatedIds.has(row.id))
      : []

  if (rowsToConfirm.length === 0) {
    return {
      ok: true,
      rows: mergeRowsById(updateRows),
      updateOutcome,
      recoveryOutcome: null,
      recoveredAfterUncertainUpdate: false,
    }
  }

  const idsToConfirm = rowsToConfirm.map((row) => row.id)
  const recoveryOutcome = await retrySupabaseOperation(
    () => loadCompletedRows(idsToConfirm),
    recoveryRetry
  )
  if (recoveryOutcome.response.error) {
    return {
      ok: false,
      stage: 'recovery',
      rows: [],
      updateOutcome,
      recoveryOutcome,
      recoveredAfterUncertainUpdate: false,
    }
  }

  const recoveredRows = Array.isArray(recoveryOutcome.response.data)
    ? recoveryOutcome.response.data
    : []
  if (updateOutcome.response.error) {
    const recoveredIds = new Set(recoveredRows.map((row) => row.id))
    const allExpectedRowsCompleted = expectedRows.every((row) => recoveredIds.has(row.id))
    if (!allExpectedRowsCompleted) {
      return {
        ok: false,
        stage: 'update',
        rows: [],
        updateOutcome,
        recoveryOutcome,
        recoveredAfterUncertainUpdate: false,
      }
    }
  }

  return {
    ok: true,
    rows: mergeRowsById(updateRows, recoveredRows),
    updateOutcome,
    recoveryOutcome,
    recoveredAfterUncertainUpdate: Boolean(updateOutcome.response.error),
  }
}
