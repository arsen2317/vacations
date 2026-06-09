import { useState } from 'react'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const MONTH_GEN  = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const STATUS_STYLES = {
  pending:      { bg: '#C7E1FF', color: '#005CBD' },
  rescheduling: { bg: '#C7E1FF', color: '#005CBD' },
  reviewing:    { bg: '#E3CCFF', color: '#7936C9' },
  approved:     { bg: '#BEF4BD', color: '#007502' },
  rejected:     { bg: '#FCD4C9', color: '#AD3400' },
  cancelled:    { bg: '#F2F3F7', color: '#626C77' },
  draft:        { bg: '#F2F3F7', color: '#1D2023' },
}

const REQ_PRIORITY = ['approved', 'reviewing', 'pending', 'rejected', 'cancelled', 'draft']

const CELL = 36
const ROW_H = 36

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

function formatNameShort(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const surname = parts[parts.length - 1]
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ')
  return `${surname} ${initials}`
}

function formatDateRangeISO(startISO, endISO) {
  const s = new Date(startISO + 'T00:00:00')
  const e = new Date(endISO + 'T00:00:00')
  return `${s.getDate()} ${MONTH_GEN[s.getMonth()]} – ${e.getDate()} ${MONTH_GEN[e.getMonth()]}`
}

function getMonthWeeks(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
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
    if (req.status === 'rejected') continue
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

function YearMonthGrid({ year, month, requests, selStart, effectiveSelEnd, today, onDayClick, onDayEnter, onDayLeave, colleagueMap, onColEnter, onColLeave, onDeleteRequest }) {
  const weeks = getMonthWeeks(year, month)
  const r = 12

  return (
    <div style={{ width: '100%' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)` }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ width: CELL, height: ROW_H }} />

              const d = dayOnly(date)
              const isPast = d < today && !sameDay(d, today)
              const isNonWorking = isWeekendOrHoliday(d)
              const isToday = sameDay(d, today)
              const req = getRequestForDay(d, requests)
              const vacStyle = req ? (STATUS_STYLES[req.status] || STATUS_STYLES.cancelled) : null
              const isoDate = toISODate(d)
              const hasColleagueDot = colleagueMap?.has(isoDate) ?? false

              const isStart = sameDay(d, selStart)
              const isEnd   = sameDay(d, effectiveSelEnd)
              const inRange = selStart && effectiveSelEnd && d > selStart && d < effectiveSelEnd
              const isSelected = isStart || isEnd

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

              const canClick = !isPast || req !== null

              const inAnyHighlight = isSelected || showStripBg
              let textColor = isToday ? '#0066FF' : isNonWorking ? '#F95721' : '#1D2023'
              if (isSelected) textColor = '#FAFAFA'
              else if (vacStyle && !inAnyHighlight) textColor = vacStyle.color
              if (isPast) {
                if (vacStyle && !inAnyHighlight) {
                  const MUTED = { approved: '#80BA81', pending: '#80ADE0', rescheduling: '#80ADE0', reviewing: '#BC9BE4', cancelled: '#B0B4BE', draft: '#B0B4BE' }
                  textColor = MUTED[req?.status] ?? '#BCC3D0'
                } else {
                  textColor = '#BCC3D0'
                }
              }
              const fontWeight = (isSelected || (vacStyle && !inAnyHighlight)) ? 500 : 400

              // Delete button: show on end date of each request when onDeleteRequest is provided
              const reqEndingHere = onDeleteRequest
                ? requests.find(r2 => r2.status !== 'rejected' && sameDay(dayOnly(r2.endDate), d))
                : null

              return (
                <div
                  key={di}
                  style={{ position: 'relative', width: CELL, height: ROW_H, cursor: canClick ? 'pointer' : 'default' }}
                  onClick={() => { if (canClick) onDayClick(d, req) }}
                  onMouseEnter={() => { if (canClick) onDayEnter(d) }}
                  onMouseLeave={onDayLeave}
                >
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

                  {vacStyle && !showStripBg && !isSelected && (
                    <div style={{
                      position: 'absolute',
                      width: CELL, height: CELL,
                      top: 0, left: 0,
                      background: vacStyle.bg,
                      borderRadius: r,
                    }} />
                  )}

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
                    <div
                      style={{
                        position: 'absolute',
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: '#FFBB00',
                        top: 4, right: 4,
                        zIndex: 3,
                      }}
                      onMouseEnter={e => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        onColEnter?.(rect.left + rect.width / 2, rect.top, colleagueMap.get(isoDate))
                      }}
                      onMouseLeave={e => { e.stopPropagation(); onColLeave?.() }}
                    />
                  )}

                  {/* Delete button on last date of each request */}
                  {reqEndingHere && onDeleteRequest && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0, right: 0,
                        width: 16, height: 16,
                        zIndex: 4,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                      }}
                      onClick={e => { e.stopPropagation(); onDeleteRequest(reqEndingHere) }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L11.9999 13.4143L16.2929 17.7073C16.6834 18.0978 17.3166 18.0978 17.7071 17.7073C18.0976 17.3167 18.0976 16.6836 17.7071 16.293L13.4141 12.0001L17.7071 7.70711C18.0976 7.31658 18.0976 6.68342 17.7071 6.29289C17.3166 5.90237 16.6834 5.90237 16.2929 6.29289L11.9999 10.5859L7.70711 6.29304C7.31658 5.90252 6.68342 5.90252 6.2929 6.29304C5.90237 6.68357 5.90237 7.31673 6.29289 7.70726L10.5857 12.0001L6.29289 16.2929Z" fill="#1D2023"/>
                      </svg>
                    </div>
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
    </div>
  )
}

const COL_GAP = 24
const ROW_GAP = 24
const MONTH_W = (832 - COL_GAP * 2) / 3  // 261.33
export function calendarWidth(cols) { return cols * MONTH_W + (cols - 1) * COL_GAP }
export const YEAR_CALENDAR_WIDTH = calendarWidth(3)  // 832

export function YearCalendar({ year, requests = [], onRequestClick, onNewRequest, colleagueMap, cols = 3, onDeleteRequest }) {
  const today = dayOnly(new Date())
  const [selStart, setSelStart] = useState(null)
  const [selEnd,   setSelEnd]   = useState(null)
  const [hover,    setHover]    = useState(null)
  const [colTooltip, setColTooltip] = useState(null) // { x, y, entries }

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
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        columnGap: COL_GAP,
        rowGap: ROW_GAP,
        width: calendarWidth(cols),
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
            onDayLeave={() => { setHover(null) }}
            colleagueMap={colleagueMap}
            onColEnter={(x, y, entries) => setColTooltip({ x, y, entries })}
            onColLeave={() => setColTooltip(null)}
            onDeleteRequest={onDeleteRequest}
          />
        ))}
      </div>

      {colTooltip && (
        <div style={{
          position: 'fixed',
          left: colTooltip.x,
          top: colTooltip.y,
          transform: 'translate(-50%, calc(-100% - 4px))',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            padding: 12,
            background: '#1D2023',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 180,
          }}>
            <div style={{ color: '#FAFAFA', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
              Отпуска коллег
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {colTooltip.entries.map((entry, i) => (
                <div key={i} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FAC031', flexShrink: 0 }} />
                  <div style={{ color: '#FAFAFA', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    {formatNameShort(entry.name)} ({formatDateRangeISO(entry.startDate, entry.endDate)})
                  </div>
                </div>
              ))}
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="8" viewBox="0 0 20 8" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 8C13 8 15.9999 0 20 0H0C3.9749 0 7 8 10 8Z" fill="#1D2023"/>
          </svg>
        </div>
      )}
    </>
  )
}
