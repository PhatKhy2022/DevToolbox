export const timezones = [
  'UTC',
  'Asia/Phnom_Penh',
  'Asia/Bangkok',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
]

export function timestampToDate(timestamp: string, timezone: string): string {
  const value = Number(timestamp)
  if (!Number.isFinite(value)) throw new Error('Timestamp must be a number.')
  const millis = timestamp.length <= 10 ? value * 1000 : value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: timezone,
  }).format(new Date(millis))
}

export function dateToTimestamp(value: string, timezone: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) throw new Error('Date is invalid.')
  const [, year, month, day, hour, minute, second] = match
  const asUTC = Date.UTC(+year, +month - 1, +day, +hour, +minute, second ? +second : 0)

  // Find the timezone's offset at this instant by re-rendering it in that zone
  // and comparing wall-clock times, then correct for the difference.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(asUTC))
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const hourPart = part('hour')
  const asZoned = Date.UTC(part('year'), part('month') - 1, part('day'), hourPart === 24 ? 0 : hourPart, part('minute'), part('second'))

  const offset = asZoned - asUTC
  return Math.floor((asUTC - offset) / 1000).toString()
}
