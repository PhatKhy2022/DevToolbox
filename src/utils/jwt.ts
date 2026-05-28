export interface JwtPayload {
  payload: Record<string, unknown>
  expiresAt?: string
  isExpired?: boolean
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.trim().split('.')
  if (parts.length < 2) throw new Error('JWT must contain header and payload segments.')

  const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>
  const exp = typeof payload.exp === 'number' ? payload.exp : undefined

  return {
    payload,
    expiresAt: exp ? new Date(exp * 1000).toLocaleString() : undefined,
    isExpired: exp ? Date.now() > exp * 1000 : undefined,
  }
}
