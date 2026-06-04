import { useState } from 'react'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

// RF production calendar 2027 holidays
const RF_HOLIDAYS_2027 = new Set([
  '2027-01-01','2027-01-04','2027-01-05','2027-01-06','2027-01-07','2027-01-08',
  '2027-02-22','2027-02-23',
  '2027-03-08',
  '2027-05-03','2027-05-10',
  '2027-06-14',
  '2027-11-04','2027-11-05',
  '2027-12-31',
])

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function isHoliday(d) {
  return RF_HOLIDAYS_2027.has(toISODate(d))
}

function countWorkDays(start, end) {
  let count = 0
  const cur = new Date(start)
  cur.setHours(0, 0, 0, 0)
  const e = new Date(end)
  e.setHours(0, 0, 0, 0)
  while (cur <= e) {
    if (!isHoliday(cur)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
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

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

function getMonthGrid(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  for (let i = 0; i < firstDow; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function formatDate(d) {
  if (!d) return '—'
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function MonthGrid({ year, month, start, effectiveEnd, today, onDayClick, onDayEnter, onDayLeave }) {
  // holiday check is local to rendering
  const grid = getMonthGrid(year, month)
  const weeks = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))

  return (
    <div style={{ flex: 1 }}>
      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 12 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#626C77', textTransform: 'uppercase', lineHeight: '16px', fontFamily: "'MTSCompact', sans-serif" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ height: 36 }} />

              const d = dayOnly(date)
              const isStart = sameDay(d, start)
              const isEnd = sameDay(d, effectiveEnd)
              const inRange = start && effectiveEnd && d > start && d < effectiveEnd
              const isSelected = isStart || isEnd
              const isToday = sameDay(d, today)
              const isHol = isHoliday(d)

              const rangeHalfStart = isStart && effectiveEnd && start.getTime() !== effectiveEnd.getTime()
              const rangeHalfEnd = isEnd && start && start.getTime() !== effectiveEnd.getTime()
              const showRangeBg = inRange || rangeHalfStart || rangeHalfEnd

              const isRowStart = di === 0
              const isRowEnd = di === 6
              const r = 12
              // Extend strip 6px under circle to eliminate corner-rounding gap
              const stripLeft = rangeHalfStart ? 'calc(50% - 6px)' : 0
              const stripRight = rangeHalfEnd ? 'calc(50% - 6px)' : 0
              const stripBorderRadius = rangeHalfStart
                ? `0 ${isRowEnd ? r : 0}px ${isRowEnd ? r : 0}px 0`
                : rangeHalfEnd
                  ? `${isRowStart ? r : 0}px 0 0 ${isRowStart ? r : 0}px`
                  : `${isRowStart ? r : 0}px ${isRowEnd ? r : 0}px ${isRowEnd ? r : 0}px ${isRowStart ? r : 0}px`

              return (
                <div
                  key={di}
                  style={{ position: 'relative', height: 36, cursor: 'pointer' }}
                  onClick={() => onDayClick(d)}
                  onMouseEnter={() => onDayEnter(d)}
                  onMouseLeave={onDayLeave}
                >
                  {/* Range background strip */}
                  {showRangeBg && (
                    <div style={{
                      position: 'absolute',
                      top: 0, bottom: 0,
                      left: stripLeft,
                      right: stripRight,
                      background: '#F2F3F7',
                      borderRadius: stripBorderRadius,
                    }} />
                  )}

                  {/* Selected circle */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      width: 36, height: 36,
                      top: 0, left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1D2023',
                      borderRadius: 12,
                      zIndex: 1,
                    }} />
                  )}

                  {/* Day number */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, lineHeight: '28px', fontWeight: 400,
                    color: isSelected ? '#FAFAFA' : isToday ? '#0066FF' : isHol ? '#F95721' : '#1D2023',
                    fontFamily: "'MTSCompact', sans-serif",
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

export function CalendarRange({ initialStart, initialEnd, onApply, onClose }) {
  const today = dayOnly(new Date())

  const [viewMonth, setViewMonth] = useState(() => {
    const base = initialStart ? dayOnly(initialStart) : today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [start, setStart] = useState(initialStart ? dayOnly(initialStart) : null)
  const [end, setEnd] = useState(initialEnd ? dayOnly(initialEnd) : null)
  const [hover, setHover] = useState(null)

  const month2 = addMonths(viewMonth, 1)

  const effectiveEnd = end
    || (start && hover && hover.getTime() !== start.getTime() ? (hover > start ? hover : null) : null)

  function handleDayClick(date) {
    if (!start || end) {
      setStart(date)
      setEnd(null)
      setHover(null)
    } else {
      if (date.getTime() < start.getTime()) {
        setEnd(start)
        setStart(date)
      } else {
        setEnd(date)
      }
      setHover(null)
    }
  }

  function handleDayEnter(date) {
    if (start && !end) setHover(date)
  }

  function handleReset() {
    setStart(null)
    setEnd(null)
    setHover(null)
  }

  function handleApply() {
    if (start) {
      onApply(start, end || start)
      onClose?.()
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 32,
      boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      width: 760,
      fontFamily: "'MTSCompact', sans-serif",
    }}>
      {/* Months + navigation */}
      <div style={{ padding: '0 20px 12px' }}>
        {/* Nav row */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 40 }}>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            style={{ position: 'absolute', left: 0, width: 32, height: 32, padding: 4, background: '#F2F3F7', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 500, color: '#1D2023', lineHeight: '24px' }}>
            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 500, color: '#1D2023', lineHeight: '24px' }}>
            {MONTH_NAMES[month2.getMonth()]} {month2.getFullYear()}
          </div>

          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            style={{ position: 'absolute', right: 0, width: 32, height: 32, padding: 4, background: '#F2F3F7', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Two-month grid */}
        <div style={{ display: 'flex', gap: 40 }}>
          <MonthGrid
            year={viewMonth.getFullYear()} month={viewMonth.getMonth()}
            start={start} effectiveEnd={effectiveEnd} today={today}
            onDayClick={handleDayClick} onDayEnter={handleDayEnter} onDayLeave={() => setHover(null)}
          />
          <MonthGrid
            year={month2.getFullYear()} month={month2.getMonth()}
            start={start} effectiveEnd={effectiveEnd} today={today}
            onDayClick={handleDayClick} onDayEnter={handleDayEnter} onDayLeave={() => setHover(null)}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px 24px', borderTop: '1px solid rgba(188,195,208,0.50)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#626C77', textTransform: 'uppercase', lineHeight: '16px' }}>Дней отпуска:</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#1D2023', textTransform: 'uppercase', lineHeight: '16px' }}>
            {start && (end || start) ? countWorkDays(start, end || start) : '—'}
          </span>
        </div>
        <button onClick={handleReset} style={{ height: 44, padding: '0 16px', background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#1D2023', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: "'MTSWide', sans-serif" }}>
          Сбросить
        </button>
        <button onClick={handleApply} style={{ height: 44, padding: '0 16px', background: '#0066FF', border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: "'MTSWide', sans-serif" }}>
          Применить
        </button>
      </div>
    </div>
  )
}
