import { useState } from 'react'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const STATUS_BG = {
  pending:   '#C7E1FF',
  reviewing: '#E3CCFF',
  approved:  '#BEF4BD',
  rejected:  '#FCD4C9',
  cancelled: '#F2F3F7',
}

const REQ_PRIORITY = ['approved', 'reviewing', 'pending', 'rejected', 'cancelled']

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isHoliday(d) {
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

// Returns 7 arrays (Mon–Sun), each containing Date objects for that weekday in the month
function getMonthColumns(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cols = [[], [], [], [], [], [], []]
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = (date.getDay() + 6) % 7 // Mon=0 … Sun=6
    cols[dow].push(date)
  }
  return cols
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
  const R = 8

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
          const nullCount = numRows - dayList.length

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
                {dayList.map((date, rowIdx) => {
                  const d = dayOnly(date)
                  const isHol = isHoliday(d)
                  const isToday = sameDay(d, today)
                  const req = getRequestForDay(d, requests)

                  const isSelStart = sameDay(d, selStart)
                  const isSelEnd   = sameDay(d, effectiveSelEnd)
                  const inSel = selStart && effectiveSelEnd && d > selStart && d < effectiveSelEnd
                  const isSelected = isSelStart || isSelEnd

                  // Neighbours in this column (same weekday ±7 days)
                  const prevDate = rowIdx > 0 ? dayOnly(dayList[rowIdx - 1]) : null
                  const nextDate = rowIdx < dayList.length - 1 ? dayOnly(dayList[rowIdx + 1]) : null

                  // --- Vacation strip ---
                  let vacBg = null
                  let vacStripUp = false
                  let vacStripDown = false
                  if (req && !isSelected) {
                    vacBg = STATUS_BG[req.status] || '#F2F3F7'
                    if (prevDate) {
                      const pr = getRequestForDay(prevDate, requests)
                      if (pr?.id === req.id) vacStripUp = true
                    }
                    if (nextDate) {
                      const nr = getRequestForDay(nextDate, requests)
                      if (nr?.id === req.id) vacStripDown = true
                    }
                  }

                  // --- Selection strip ---
                  let selBg = null
                  let selStripUp = false
                  let selStripDown = false
                  if (inSel) {
                    selBg = '#EBF0FF'
                    if (prevDate) {
                      const pd = dayOnly(prevDate)
                      if (selStart && effectiveSelEnd && pd >= selStart && pd <= effectiveSelEnd) selStripUp = true
                    }
                    if (nextDate) {
                      const nd = dayOnly(nextDate)
                      if (selStart && effectiveSelEnd && nd >= selStart && nd <= effectiveSelEnd) selStripDown = true
                    }
                  }

                  // Half-strips extending from selected circles toward the range
                  const selStartExtDown = isSelStart && nextDate && selStart && effectiveSelEnd
                    && dayOnly(nextDate) > selStart && dayOnly(nextDate) <= effectiveSelEnd
                  const selEndExtUp   = isSelEnd && prevDate && selStart && effectiveSelEnd
                    && dayOnly(prevDate) >= selStart && dayOnly(prevDate) < effectiveSelEnd

                  const bg = vacBg || selBg
                  const stripUp   = vacStripUp   || selStripUp
                  const stripDown = vacStripDown || selStripDown

                  const br = [
                    stripUp   ? 0 : R,
                    stripUp   ? 0 : R,
                    stripDown ? 0 : R,
                    stripDown ? 0 : R,
                  ].map(v => `${v}px`).join(' ')

                  return (
                    <div
                      key={rowIdx}
                      style={{ position: 'relative', padding: 4, cursor: isHol ? 'default' : 'pointer' }}
                      onClick={() => onDayClick(d, req)}
                      onMouseEnter={() => onDayEnter(d)}
                      onMouseLeave={onDayLeave}
                    >
                      {/* Vacation / in-range background strip */}
                      {bg && (
                        <div style={{
                          position: 'absolute',
                          left: 0, right: 0,
                          top:    stripUp   ? -1 : 0,
                          bottom: stripDown ? -1 : 0,
                          background: bg,
                          borderRadius: br,
                          zIndex: 0,
                        }} />
                      )}

                      {/* Half-strip from selStart downward */}
                      {selStartExtDown && (
                        <div style={{
                          position: 'absolute',
                          left: 0, right: 0,
                          top: '50%', bottom: -1,
                          background: '#EBF0FF',
                          zIndex: 0,
                        }} />
                      )}

                      {/* Half-strip from selEnd upward */}
                      {selEndExtUp && (
                        <div style={{
                          position: 'absolute',
                          left: 0, right: 0,
                          top: -1, bottom: '50%',
                          background: '#EBF0FF',
                          zIndex: 0,
                        }} />
                      )}

                      {/* Selected circle */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          width: 28, height: 28,
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#1D2023',
                          borderRadius: R,
                          zIndex: 1,
                        }} />
                      )}

                      {/* Day number */}
                      <div style={{
                        position: 'relative',
                        height: 28,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: isSelected ? '#FAFAFA' : isToday ? '#0066FF' : isHol ? '#F95721' : '#1D2023',
                        fontSize: 12,
                        fontFamily: "'MTSCompact', sans-serif",
                        fontWeight: 400,
                        lineHeight: '16px',
                        zIndex: 2,
                      }}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}

                {/* Empty cells to equalise column height */}
                {Array.from({ length: nullCount }, (_, i) => (
                  <div key={`n${i}`} style={{ height: 36, position: 'relative' }} />
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
    if (isHoliday(d)) return
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
    if (selStart && !selEnd && !isHoliday(d)) setHover(d)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 40px' }}>
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
