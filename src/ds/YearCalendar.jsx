import { useState } from 'react'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const STATUS_STYLES = {
  pending:   { bg: '#C7E1FF', color: '#005CBD' },
  reviewing: { bg: '#E3CCFF', color: '#7936C9' },
  approved:  { bg: '#BEF4BD', color: '#007502' },
  rejected:  { bg: '#FCD4C9', color: '#AD3400' },
  cancelled: { bg: '#F2F3F7', color: '#626C77' },
  draft:     { bg: '#F2F3F7', color: '#1D2023' },
}

const REQ_PRIORITY = ['approved', 'reviewing', 'pending', 'rejected', 'cancelled', 'draft']

const CELL = 36      // pill size
const ROW_H = 37     // row cell height: CELL + 1px gap at bottom

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

// Standard row-based calendar grid (same approach as CalendarRange)
function getMonthWeeks(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  for (let i = 0; i < firstDow; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  const weeks = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))
  return weeks
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

function YearMonthGrid({ year, month, requests, selStart, effectiveSelEnd, today, onDayClick, onDayEnter, onDayLeave, colleagueDates }) {
  const weeks = getMonthWeeks(year, month)
  const r = 12

  return (
    <div style={{ width: CELL * 7 }}>
      {/* Month name */}
      <div style={{
        textAlign: 'center',
        color: '#1D2023',
        fontSize: 18,
        fontFamily: "'MTSCompact', sans-serif",
        fontWeight: 500,
        lineHeight: '21px',
        marginBottom: 12,
      }}>
        {MONTH_NAMES[month]}
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)`, marginBottom: 4 }}>
        {WEEKDAYS.map(wd => (
          <div key={wd} style={{
            width: CELL,
            textAlign: 'center',
            color: '#626C77',
            fontSize: 12,
            fontFamily: "'MTSCompact', sans-serif",
            fontWeight: 500,
            textTransform: 'uppercase',
            lineHeight: '16px',
          }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Week rows — ROW_H = CELL + 1px top + 1px bottom so pills have 1px gap */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)` }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ width: CELL, height: ROW_H }} />

              const d = dayOnly(date)
              const isNonWorking = isWeekendOrHoliday(d)
              const isToday = sameDay(d, today)
              const req = getRequestForDay(d, requests)
              const vacStyle = req ? (STATUS_STYLES[req.status] || STATUS_STYLES.cancelled) : null
              const hasColleagueDot = colleagueDates?.has(toISODate(d)) ?? false

              const isStart = sameDay(d, selStart)
              const isEnd   = sameDay(d, effectiveSelEnd)
              const inRange = selStart && effectiveSelEnd && d > selStart && d < effectiveSelEnd
              const isSelected = isStart || isEnd

              // Strip logic — identical to CalendarRange
              const rangeHalfStart = isStart && effectiveSelEnd && selStart.getTime() !== effectiveSelEnd.getTime()
              const rangeHalfEnd   = isEnd   && selStart       && selStart.getTime() !== effectiveSelEnd.getTime()
              const showStripBg    = inRange || rangeHalfStart || rangeHalfEnd

              const isRowStart = di === 0
              const isRowEnd   = di === 6

              const stripLeft  = rangeHalfStart ? 'calc(50% - 6px)' : 0
              const stripRight = rangeHalfEnd   ? 'calc(50% - 6px)' : 0
              const stripBr    = rangeHalfStart
                ? `0 ${isRowEnd   ? r : 0}px ${isRowEnd   ? r : 0}px 0`
                : rangeHalfEnd
                  ? `${isRowStart ? r : 0}px 0 0 ${isRowStart ? r : 0}px`
                  : `${isRowStart ? r : 0}px ${isRowEnd ? r : 0}px ${isRowEnd ? r : 0}px ${isRowStart ? r : 0}px`

              // Text color
              const inAnyHighlight = isSelected || showStripBg
              let textColor = isToday ? '#0066FF' : isNonWorking ? '#F95721' : '#1D2023'
              if (isSelected) textColor = '#FAFAFA'
              else if (vacStyle && !inAnyHighlight) textColor = vacStyle.color
              const fontWeight = (isSelected || (vacStyle && !inAnyHighlight)) ? 500 : 400

              return (
                <div
                  key={di}
                  style={{ position: 'relative', width: CELL, height: ROW_H, cursor: 'pointer' }}
                  onClick={() => onDayClick(d, req)}
                  onMouseEnter={() => onDayEnter(d)}
                  onMouseLeave={onDayLeave}
                >
                  {/* Selection range strip — bottom 1px left empty for gap */}
                  {showStripBg && (
                    <div style={{
                      position: 'absolute',
                      top: 0, bottom: 1,
                      left: stripLeft,
                      right: stripRight,
                      background: '#F2F3F7',
                      borderRadius: stripBr,
                    }} />
                  )}

                  {/* Vacation pill — 36×36, bottom 1px left for gap */}
                  {vacStyle && !showStripBg && !isSelected && (
                    <div style={{
                      position: 'absolute',
                      width: CELL, height: CELL,
                      top: 0, left: 0,
                      background: vacStyle.bg,
                      borderRadius: r,
                    }} />
                  )}

                  {/* Selection circle (start / end) — 36×36 */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      width: CELL, height: CELL,
                      top: 0, left: 0,
                      background: '#1D2023',
                      borderRadius: r,
                      zIndex: 1,
                    }} />
                  )}

                  {/* Colleague vacation dot */}
                  {hasColleagueDot && (
                    <div style={{
                      position: 'absolute',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: '#FFBB00',
                      top: 2, right: 2,
                      zIndex: 3,
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
                    zIndex: 2,
                  }}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Calendar width: 3 months × (7 × CELL) + 2 × gap
const MONTH_WIDTH = CELL * 7          // 252
const COL_GAP     = 24
const ROW_GAP     = 32
export const YEAR_CALENDAR_WIDTH = 3 * MONTH_WIDTH + 2 * COL_GAP  // 756

export function YearCalendar({ year, requests = [], onRequestClick, onNewRequest, colleagueDates }) {
  const today = dayOnly(new Date())
  const [selStart, setSelStart] = useState(null)
  const [selEnd,   setSelEnd]   = useState(null)
  const [hover,    setHover]    = useState(null)

  const effectiveSelEnd = selEnd
    || (selStart && hover && hover > selStart ? hover : null)

  function handleDayClick(d, req) {
    if (req && !selStart) {
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${MONTH_WIDTH}px)`,
      columnGap: COL_GAP,
      rowGap: ROW_GAP,
      width: YEAR_CALENDAR_WIDTH,
    }}>
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
          colleagueDates={colleagueDates}
        />
      ))}
    </div>
  )
}
