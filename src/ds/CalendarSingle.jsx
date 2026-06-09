import { useState } from 'react'

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const CELL_W = 44
const CELL_H = 40

function dayOnly(d) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function sameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

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

const CAL_WIDTH = 7 * CELL_W + 40 // 348

export function CalendarSingle({ initialDate, onApply, onClose, minDate }) {
  const today = dayOnly(new Date())
  const init = initialDate ? dayOnly(initialDate) : null
  const [viewYear, setViewYear] = useState(init ? init.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(init ? init.getMonth() : today.getMonth())
  const [selected, setSelected] = useState(init)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleClick(d) {
    if (minDate && d < minDate) return
    setSelected(d)
    onApply(d)
  }

  const weeks = getMonthWeeks(viewYear, viewMonth)

  return (
    <div style={{
      width: CAL_WIDTH,
      background: '#fff',
      borderRadius: 24,
      padding: 20,
      boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
      boxSizing: 'border-box',
      fontFamily: "'MTSCompact', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ padding: '6px 12px', background: '#F2F3F7', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#1D2023', lineHeight: '20px' }}>
            {MONTH_NAMES[viewMonth]}
          </div>
          <div style={{ padding: '6px 12px', background: '#F2F3F7', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#1D2023', lineHeight: '20px' }}>
            {viewYear}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={prevMonth}
            style={{ padding: 4, background: '#F2F3F7', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#1D2023" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={nextMonth}
            style={{ padding: 4, background: '#F2F3F7', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#1D2023" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL_W}px)`, marginBottom: 8 }}>
        {WEEKDAYS.map(wd => (
          <div key={wd} style={{ textAlign: 'center', color: '#626C77', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', lineHeight: '16px' }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL_W}px)` }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ width: CELL_W, height: CELL_H }} />

              const d = dayOnly(date)
              const isPast = minDate ? d < minDate : false
              const isToday = sameDay(d, today)
              const isSel = selected && sameDay(d, selected)

              let textColor = '#1D2023'
              if (isToday && !isSel) textColor = '#0066FF'
              if (isPast) textColor = '#BCC3D0'
              if (isSel) textColor = '#FAFAFA'

              return (
                <div
                  key={di}
                  onClick={() => !isPast && handleClick(d)}
                  style={{
                    width: CELL_W, height: CELL_H,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isPast ? 'default' : 'pointer',
                    position: 'relative',
                  }}
                >
                  {isSel && (
                    <div style={{
                      position: 'absolute',
                      width: 36, height: 36,
                      background: '#1D2023',
                      borderRadius: 12,
                    }} />
                  )}
                  <div style={{
                    position: 'relative', zIndex: 1,
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: '28px',
                    color: textColor,
                    textAlign: 'center',
                    userSelect: 'none',
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
