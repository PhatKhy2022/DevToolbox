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

export function dateToTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Date is invalid.')
  return Math.floor(date.getTime() / 1000).toString()
}
