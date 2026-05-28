export type DetectedContent = 'json' | 'yaml' | 'jwt' | 'csv' | 'base64' | 'text'

export function detectContent(value: string): DetectedContent {
  const trimmed = value.trim()
  if (!trimmed) return 'text'

  try {
    JSON.parse(trimmed)
    return 'json'
  } catch {
    // Continue detection.
  }

  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) return 'jwt'
  if (/^[A-Za-z0-9+/=\r\n]+$/.test(trimmed) && trimmed.length % 4 === 0) return 'base64'
  if (trimmed.includes(',') && trimmed.includes('\n')) return 'csv'
  if (/^[\w.-]+:\s+/m.test(trimmed)) return 'yaml'

  return 'text'
}
