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

function getMonthGrid(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  for (let i = 0; i < firstDow; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
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
  const grid = getMonthGrid(year, month)
  const weeks = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))
  const r = 8

  return (
    <div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: '#1D2023', lineHeight: '18px',
        marginBottom: 6, fontFamily: "'MTSWide', sans-serif",
        textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        {MONTH_NAMES[month]}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 3 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 500,
            color: '#626C77', textTransform: 'uppercase',
            lineHeight: '14px', fontFamily: "'MTSCompact', sans-serif",
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ height: 28 }} />

              const d = dayOnly(date)
              const isHol = isHoliday(d)
              const isToday = sameDay(d, today)
              const req = getRequestForDay(d, requests)

              const isSelStart = sameDay(d, selStart)
              const isSelEnd = sameDay(d, effectiveSelEnd)
              const inSel = selStart && effectiveSelEnd && d > selStart && d < effectiveSelEnd
              const isSelected = isSelStart || isSelEnd

              const isRowStart = di === 0
              const isRowEnd = di === 6

              // Vacation period strip
              let vacBg = null
              let isVacStart = false
              let isVacEnd = false
              if (req && !isSelected) {
                vacBg = STATUS_BG[req.status] || '#F2F3F7'
                isVacStart = sameDay(d, dayOnly(req.startDate))
                isVacEnd = sameDay(d, dayOnly(req.endDate))
              }

              const vacBorderRadius = isVacStart && isVacEnd
                ? `${r}px`
                : isVacStart
                  ? `${r}px 0 0 ${r}px`
                  : isVacEnd
                    ? `0 ${r}px ${r}px 0`
                    : isRowStart && isRowEnd
                      ? `${r}px`
                      : isRowStart
                        ? `${r}px 0 0 ${r}px`
                        : isRowEnd
                          ? `0 ${r}px ${r}px 0`
                          : '0'

              // Selection range strip (for new range being drawn)
              const selHalfStart = isSelStart && effectiveSelEnd && selStart.getTime() !== effectiveSelEnd.getTime()
              const selHalfEnd = isSelEnd && selStart && selStart.getTime() !== effectiveSelEnd.getTime()
              const showSelStrip = inSel || selHalfStart || selHalfEnd
              const selStripLeft = selHalfStart ? 'calc(50% - 5px)' : 0
              const selStripRight = selHalfEnd ? 'calc(50% - 5px)' : 0
              const selStripBr = selHalfStart
                ? `0 ${isRowEnd ? r : 0}px ${isRowEnd ? r : 0}px 0`
                : selHalfEnd
                  ? `${isRowStart ? r : 0}px 0 0 ${isRowStart ? r : 0}px`
                  : `${isRowStart ? r : 0}px ${isRowEnd ? r : 0}px ${isRowEnd ? r : 0}px ${isRowStart ? r : 0}px`

              return (
                <div
                  key={di}
                  style={{ position: 'relative', height: 28, cursor: isHol ? 'default' : 'pointer' }}
                  onClick={() => onDayClick(d, req)}
                  onMouseEnter={() => onDayEnter(d)}
                  onMouseLeave={onDayLeave}
                >
                  {/* Vacation period background */}
                  {vacBg && (
                    <div style={{
                      position: 'absolute',
                      top: 2, bottom: 2,
                      left: isVacStart ? 2 : 0,
                      right: isVacEnd ? 2 : 0,
                      background: vacBg,
                      borderRadius: vacBorderRadius,
                    }} />
                  )}

                  {/* Selection range strip */}
                  {showSelStrip && (
                    <div style={{
                      position: 'absolute',
                      top: 0, bottom: 0,
                      left: selStripLeft,
                      right: selStripRight,
                      background: '#F2F3F7',
                      borderRadius: selStripBr,
                    }} />
                  )}

                  {/* Selected circle */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      width: 28, height: 28,
                      top: 0, left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1D2023',
                      borderRadius: r,
                      zIndex: 1,
                    }} />
                  )}

                  {/* Day number */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 400, lineHeight: '18px',
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

export function YearCalendar({ year, requests = [], onRequestClick, onNewRequest }) {
  const today = dayOnly(new Date())
  const [selStart, setSelStart] = useState(null)
  const [selEnd, setSelEnd] = useState(null)
  const [hover, setHover] = useState(null)

  const effectiveSelEnd = selEnd
    || (selStart && hover && hover.getTime() !== selStart.getTime() && hover > selStart ? hover : null)

  function handleDayClick(d, req) {
    if (req) {
      setSelStart(null)
      setSelEnd(null)
      setHover(null)
      onRequestClick?.(req)
      return
    }
    if (isHoliday(d)) return
    if (!selStart || selEnd) {
      setSelStart(d)
      setSelEnd(null)
      setHover(null)
    } else {
      let s = selStart, e = d
      if (e < s) [s, e] = [e, s]
      setSelStart(s)
      setSelEnd(e)
      setHover(null)
      onNewRequest?.(s, e)
    }
  }

  function handleDayEnter(d) {
    if (selStart && !selEnd && !isHoliday(d)) setHover(d)
  }

  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 32px' }}>
      {months.map(m => (
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
