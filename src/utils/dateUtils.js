import { HOLIDAYS_2026 } from '../data/mockData'

export function countVacationDays(startDate, endDate) {
  let count = 0
  const cur = new Date(startDate)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  while (cur <= end) {
    if (!HOLIDAYS_2026.has(toKey(cur))) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export function toKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fmtDate(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}

export function fmtDateFull(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr + 'T00:00:00')
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`
}

export function pluralDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return `${n} дней`
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}
