import Papa from 'papaparse'
import { readSheet } from 'read-excel-file/browser'

export function csvToJson(csv: string): string {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  if (parsed.errors.length) {
    throw new Error(parsed.errors[0].message)
  }

  return JSON.stringify(parsed.data, null, 2)
}

export function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  return Papa.unparse(Array.isArray(data) ? data : [data])
}

export async function xlsxToJson(file: File): Promise<string> {
  const rows = await readSheet(file)
  const [headers = [], ...records] = rows
  const normalizedHeaders = headers.map((header: unknown, index: number) => String(header || `column_${index + 1}`))
  const data = records.map((record: unknown[]) =>
    Object.fromEntries(normalizedHeaders.map((header: string, index: number) => [header, record[index] ?? ''])),
  )
  return JSON.stringify(data, null, 2)
}
