export interface ParseResult<T> {
  ok: boolean
  data?: T
  error?: string
}

export function parseJson(value: string): ParseResult<unknown> {
  try {
    return { ok: true, data: JSON.parse(value) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON' }
  }
}

export function formatJson(value: string): ParseResult<string> {
  const parsed = parseJson(value)
  if (!parsed.ok) return { ok: false, error: parsed.error }
  return { ok: true, data: JSON.stringify(parsed.data, null, 2) }
}

export function minifyJson(value: string): ParseResult<string> {
  const parsed = parseJson(value)
  if (!parsed.ok) return { ok: false, error: parsed.error }
  return { ok: true, data: JSON.stringify(parsed.data) }
}
