import { useState } from 'react'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

// Matches StatusBadge colors exactly
const STATUS_STYLES = {
  pending:   { bg: '#C7E1FF', color: '#005CBD' },
  reviewing: { bg: '#E3CCFF', color: '#7936C9' },
  approved:  { bg: '#BEF4BD', color: '#007502' },
  rejected:  { bg: '#FCD4C9', color: '#AD3400' },
  cancelled: { bg: '#F2F3F7', color: '#626C77' },
  draft:     { bg: '#F2F3F7', color: '#626C77' },
}

const REQ_PRIORITY = ['approved', 'reviewing', 'pending', 'rejected', 'cancelled', 'draft']

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isWeekendOrHoliday(d) {
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return true
  const iso = toISODate(d)
  return HOLIDAYS_2026.has(iso) || HOLIDAYS_2027.has(iso)
}

function dayOnly(d) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function sameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Returns 7 arrays (Mon–Sun). Each array starts with null placeholders so
// rows align across columns (Mon=0 … Sun=6, Mon-based week).
function getMonthColumns(year, month) {
  const firstDate = new Date(year, month, 1)
  const firstDow = (firstDate.getDay() + 6) % 7 // Mon=0 … Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build plain day lists per weekday
  const cols = [[], [], [], [], [], [], []]
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = (date.getDay() + 6) % 7
    cols[dow].push(date)
  }

  // Prepend leading nulls so that all columns start on the same visual row
  // Columns whose weekday index < firstDow appear empty in week 1
  return cols.map((dayList, colIdx) => {
    const leading = colIdx < firstDow ? 1 : 0
    return [...Array(leading).fill(null), ...dayList]
  })
}

function getRequestForDay(d, requests) {
  const t = d.getTime()
  let best = null
  for (const req of requests) {
    const s = dayOnly(req.startDate).getTime()
    const e = dayOnly(req.endDate).getTime()
    if (t >= s && t <= e) {
      if (!best || REQ_PRIORITY.indexOf(req.status) < REQ_PRIORITY.indexOf(best.status)) {
        best = req
      }
    }
  }
  return best
}

function YearMonthGrid({ year, month, requests, selStart, effectiveSelEnd, today, onDayClick, onDayEnter, onDayLeave }) {
  const cols = getMonthColumns(year, month)
  const numRows = Math.max(...cols.map(c => c.length))

  return (
    <div>
      {/* Month name */}
      <div style={{
        textAlign: 'center',
        color: '#1D2023',
        fontSize: 18,
        fontFamily: "'MTSCompact', sans-serif",
        fontWeight: 500,
        lineHeight: '21px',
        marginBottom: 16,
      }}>
        {MONTH_NAMES[month]}
      </div>

      {/* 7 weekday columns */}
      <div style={{ display: 'flex' }}>
        {cols.map((dayList, colIdx) => {
          const trailingCount = numRows - dayList.length

          return (
            <div key={colIdx} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Weekday header */}
              <div style={{
                textAlign: 'center',
                color: '#626C77',
                fontSize: 12,
                fontFamily: "'MTSCompact', sans-serif",
                fontWeight: 500,
                textTransform: 'uppercase',
                lineHeight: '16px',
              }}>
                {WEEKDAYS[colIdx]}
              </div>

              {/* Day cells */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Leading/trailing null slots (null items in dayList) + actual dates */}
                {Array.from({ length: numRows }, (_, rowIdx) => {
                  const date = dayList[rowIdx] ?? null

                  if (!date) {
                    return <div key={rowIdx} style={{ height: 36 }} />
                  }

                  const d = dayOnly(date)
                  const isNonWorking = isWeekendOrHoliday(d)
                  const isToday = sameDay(d, today)
                  const req = getRequestForDay(d, requests)

                  const isSelStart = sameDay(d, selStart)
                  const isSelEnd   = sameDay(d, effectiveSelEnd)
                  const inSel = selStart && effectiveSelEnd && d > selStart && d < effectiveSelEnd
                  const isSelected = isSelStart || isSelEnd

                  const vacStyle = req ? (STATUS_STYLES[req.status] || STATUS_STYLES.cancelled) : null

                  // Pill background and text color
                  let pillBg = null
                  let pillColor = null
                  let fontWeight = 400

                  if (isSelected) {
                    pillBg = '#1D2023'
                    pillColor = '#FAFAFA'
                    fontWeight = 500
                  } else if (vacStyle) {
                    pillBg = vacStyle.bg
                    pillColor = vacStyle.color
                    fontWeight = 500
                  } else if (inSel) {
                    pillBg = '#EBF0FF'
                    pillColor = '#0055CC'
                    fontWeight = 500
                  }

                  const textColor = pillColor
                    ?? (isToday ? '#0066FF' : isNonWorking ? '#F95721' : '#1D2023')

                  return (
                    <div
                      key={rowIdx}
                      style={{ position: 'relative', height: 36, cursor: 'pointer' }}
                      onClick={() => onDayClick(d, req)}
                      onMouseEnter={() => onDayEnter(d)}
                      onMouseLeave={onDayLeave}
                    >
                      {/* 36×36 pill, borderRadius 12 */}
                      {pillBg && (
                        <div style={{
                          position: 'absolute',
                          width: 36, height: 36,
                          top: 0, left: '50%',
                          transform: 'translateX(-50%)',
                          background: pillBg,
                          borderRadius: 12,
                        }} />
                      )}

                      {/* Day number */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12,
                        fontFamily: "'MTSCompact', sans-serif",
                        fontWeight,
                        color: textColor,
                        lineHeight: '16px',
                        zIndex: 1,
                      }}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}

                {/* Trailing null slots */}
                {Array.from({ length: trailingCount }, (_, i) => (
                  <div key={`t${i}`} style={{ height: 36 }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function YearCalendar({ year, requests = [], onRequestClick, onNewRequest }) {
  const today = dayOnly(new Date())
  const [selStart, setSelStart] = useState(null)
  const [selEnd,   setSelEnd]   = useState(null)
  const [hover,    setHover]    = useState(null)

  const effectiveSelEnd = selEnd
    || (selStart && hover && hover > selStart ? hover : null)

  function handleDayClick(d, req) {
    if (req) {
      setSelStart(null); setSelEnd(null); setHover(null)
      onRequestClick?.(req)
      return
    }
    if (!selStart || selEnd) {
      setSelStart(d); setSelEnd(null); setHover(null)
    } else {
      let s = selStart, e = d
      if (e < s) [s, e] = [e, s]
      setSelStart(s); setSelEnd(e); setHover(null)
      onNewRequest?.(s, e)
    }
  }

  function handleDayEnter(d) {
    if (selStart && !selEnd) setHover(d)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px 24px' }}>
      {Array.from({ length: 12 }, (_, m) => (
        <YearMonthGrid
          key={m}
          year={year}
          month={m}
          requests={requests}
          selStart={selStart}
          effectiveSelEnd={effectiveSelEnd}
          today={today}
          onDayClick={handleDayClick}
          onDayEnter={handleDayEnter}
          onDayLeave={() => setHover(null)}
        />
      ))}
    </div>
  )
}
