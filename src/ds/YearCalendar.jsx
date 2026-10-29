import { useState, useEffect, useRef } from 'react'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'
import { t, tName, MONTH_NAMES, MONTH_GEN, WEEKDAYS } from '../i18n/translate'

const STATUS_STYLES = {
  pending:      { bg: '#D6E4FF', color: '#0964A5' },
  rescheduling: { bg: '#D6E4FF', color: '#0964A5' },
  reviewing:    { bg: '#E3CCFF', color: '#7936C9' },
  approved:     { bg: '#D0FBD5', color: '#236E31' },
  rejected:     { bg: '#FCD4C9', color: '#AD3400' },
  cancelled:    { bg: '#F2F3F7', color: '#626C77' },
  draft:        { bg: '#F2F3F7', color: '#1D2023' },
}

// Прошедшие отпуска: фон с прозрачностью 50%, приглушённый текст
const PAST_STATUS_STYLES = {
  pending:      { bg: '#EBF2FF', color: '#80ADE0' },
  rescheduling: { bg: '#EBF2FF', color: '#80ADE0' },
  reviewing:    { bg: '#F1E6FF', color: '#BC9BE4' },
  approved:     { bg: '#E7FDEA', color: '#85B58D' },
  cancelled:    { bg: '#F8F9FB', color: '#B0B4BE' },
  draft:        { bg: '#F8F9FB', color: '#B0B4BE' },
}

const REQ_PRIORITY = ['approved', 'reviewing', 'pending', 'rejected', 'cancelled', 'draft']

const CELL = 36
const ROW_H = 36
const GAP = 1
const WEEKS = 6
// Draggable period edge (rim width and its grip)
const EDGE_W = 6
const EDGE_HIT_STYLE = { position: 'absolute', top: 0, width: EDGE_W, height: ROW_H, zIndex: 4, cursor: 'ew-resize' }
const GRIP_W = 1
const GRIP_STYLE = { position: 'absolute', top: 14, width: GRIP_W, height: 8, borderRadius: 0.5, background: '#FFFFFF', zIndex: 1, pointerEvents: 'none' }

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
  while (grid.length < WEEKS * 7) grid.push(null)
  const weeks = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))
  return weeks
}

function shiftDay(d, n) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
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

function YearMonthGrid({ year, month, requests, selStart, selEnd, effectiveSelEnd, today, onDayClick, onDayEnter, onDayLeave, colleagueMap, onColEnter, onColLeave, canResize, activeReqId, dragging, dragAnchor, onEdgeDown, onDragEnter, onReqHover }) {
  const weeks = getMonthWeeks(year, month)
  const r = 12

  const inSelection = d => !!(d && selStart && effectiveSelEnd && d >= selStart && d <= effectiveSelEnd)

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        alignSelf: 'stretch',
        padding: '12px 20px',
        textAlign: 'center',
        color: '#1D2023',
        fontSize: 20,
        fontFamily: "'MTSCompact', sans-serif",
        fontWeight: 500,
        lineHeight: '24px',
      }}>
        {MONTH_NAMES[month]}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: GAP }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
        {weeks.map((week, wi) => {
          const days = week.map(date => date ? dayOnly(date) : null)
          const reqs = days.map(d => d ? getRequestForDay(d, requests) : null)
          return (
          <div key={wi} style={{ display: 'flex', gap: GAP }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ width: CELL, height: ROW_H, flexShrink: 0 }} />

              const d = days[di]
              const isPast = d < today && !sameDay(d, today)
              const isNonWorking = isWeekendOrHoliday(d)
              const isToday = sameDay(d, today)
              const req = reqs[di]
              const vacStyle = req
                ? (isPast ? PAST_STATUS_STYLES[req.status] : null) || STATUS_STYLES[req.status] || STATUS_STYLES.cancelled
                : null
              const isoDate = toISODate(d)
              const hasColleagueMark = colleagueMap?.has(isoDate) ?? false

              const isStart = sameDay(d, selStart)
              const isEnd   = sameDay(d, effectiveSelEnd)
              const isSelected = isStart || isEnd
              const isSingleSel = isStart && (!effectiveSelEnd || selStart.getTime() === effectiveSelEnd.getTime())
              const showStripBg = inSelection(d) && !isSingleSel

              // Фон отпуска и выделения — сплошная полоса внутри недели
              const vacJoinLeft  = !!req && di > 0 && reqs[di - 1] === req
              const vacJoinRight = !!req && di < 6 && reqs[di + 1] === req
              const selJoinLeft  = showStripBg && !isStart && di > 0 && inSelection(days[di - 1])
              const selJoinRight = showStripBg && !isEnd   && di < 6 && inSelection(days[di + 1])

              const radius = (joinL, joinR) => `${joinL ? 0 : r}px ${joinR ? 0 : r}px ${joinR ? 0 : r}px ${joinL ? 0 : r}px`

              const canClick = !isPast || req !== null

              // Draggable period edges (resizing draft periods)
              const isReqStart = !!req && sameDay(d, dayOnly(req.startDate))
              const isReqEnd   = !!req && sameDay(d, dayOnly(req.endDate))
              // An edge pressed right against another period can't move — it gets no rim
              // Both edges stay visible while dragging; the fixed one still hides when blocked
              const isMovingEdge = !!dragAnchor && req?.id === activeReqId && !sameDay(d, dragAnchor)
              const edgeStart = canResize && isReqStart && (isMovingEdge || !getRequestForDay(shiftDay(d, -1), requests))
              const edgeEnd   = canResize && isReqEnd   && (isMovingEdge || !getRequestForDay(shiftDay(d, 1), requests))
              // Edges are shown only for the hovered (or dragged) period
              const resizable  = req?.id === activeReqId && (edgeStart || edgeEnd)
              const cursor = dragging || resizable ? 'ew-resize' : canClick ? 'pointer' : 'default'

              const inAnyHighlight = isSelected || showStripBg
              let textColor = isToday ? '#0066FF' : isNonWorking ? '#FF0032' : '#1D2023'
              if (isPast) textColor = '#969FA8'
              if (vacStyle && !inAnyHighlight) textColor = vacStyle.color
              if (isSelected) textColor = '#FAFAFA'
              const isMedium = isSelected || (vacStyle && !inAnyHighlight)

              return (
                <div
                  key={di}
                  style={{ position: 'relative', width: CELL, height: ROW_H, flexShrink: 0, cursor }}
                  onClick={() => { if (canClick) onDayClick(d, req) }}
                  onMouseDown={e => {
                    if (!resizable) return
                    e.preventDefault()
                    onEdgeDown(req, edgeStart && !edgeEnd ? 'start' : 'end')
                  }}
                  onMouseEnter={e => {
                    if (dragging) { onDragEnter(d); return }
                    onReqHover(req?.id ?? null)
                    if (canClick) onDayEnter(d)
                    if (hasColleagueMark && !(selStart && !selEnd)) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      onColEnter?.(rect.left + rect.width / 2, rect.top, colleagueMap.get(isoDate))
                    }
                  }}
                  onMouseLeave={() => {
                    onDayLeave()
                    if (hasColleagueMark) onColLeave?.()
                  }}
                >
                  {showStripBg && (
                    <div style={{
                      position: 'absolute',
                      top: 0, height: ROW_H,
                      left: isStart ? CELL / 2 : 0,
                      right: isEnd ? CELL / 2 : (selJoinRight ? -GAP : 0),
                      background: '#F2F3F7',
                      borderRadius: isStart || isEnd
                        ? (isStart ? radius(true, selJoinRight) : radius(selJoinLeft, true))
                        : radius(selJoinLeft, selJoinRight),
                    }} />
                  )}

                  {/* Draggable edge: dark rim with a grip on the outer side of the first/last day */}
                  {resizable && !showStripBg && !isSelected && (
                    <>
                      <div style={{
                        position: 'absolute', top: 0, height: ROW_H,
                        left: edgeStart ? -EDGE_W : 0,
                        width: CELL + (edgeStart ? EDGE_W : 0) + (edgeEnd ? EDGE_W : 0),
                        background: '#007CFF',
                        borderRadius: r,
                        zIndex: 1,
                      }} />
                      {edgeStart && <div style={{ ...GRIP_STYLE, left: -EDGE_W / 2 - GRIP_W / 2 }} />}
                      {edgeEnd && <div style={{ ...GRIP_STYLE, left: CELL + EDGE_W / 2 - GRIP_W / 2 }} />}
                      {/* Hit area over the part of the rim that sticks into the neighbouring cell */}
                      {edgeStart && <div style={{ ...EDGE_HIT_STYLE, left: -EDGE_W }} />}
                      {edgeEnd && <div style={{ ...EDGE_HIT_STYLE, left: CELL }} />}
                    </>
                  )}

                  {vacStyle && !showStripBg && !isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, height: ROW_H,
                      width: CELL + (vacJoinRight ? GAP : 0),
                      // Editable period under the cursor (or being dragged) is highlighted
                      background: canResize && req.id === activeReqId ? '#EAF1FF' : vacStyle.bg,
                      borderRadius: radius(vacJoinLeft, vacJoinRight),
                      zIndex: 1,
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

                  {/* Отметка пересечения с отпусками коллег */}
                  {hasColleagueMark && (
                    <div
                      style={{
                        position: 'absolute',
                        width: 20, height: 2,
                        borderRadius: 100,
                        background: '#FAC031',
                        top: 28, left: 8,
                        zIndex: 3,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Day number */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17,
                    fontFamily: "'MTSCompact', sans-serif",
                    fontWeight: isMedium ? 500 : 400,
                    color: textColor,
                    lineHeight: isMedium ? '20px' : '24px',
                    zIndex: 2,
                  }}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
          )
        })}
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

export function YearCalendar({ year, requests = [], onRequestClick, onNewRequest, colleagueMap, cols = 3, onResizeRequest, onResizePreview }) {
  const today = dayOnly(new Date())
  const [selStart, setSelStart] = useState(null)
  const [selEnd,   setSelEnd]   = useState(null)
  const [hover,    setHover]    = useState(null)
  const [colTooltip, setColTooltip] = useState(null) // { x, y, entries }

  // Dragging a period edge: { id, anchor, min, max, start, end }
  const [drag, setDrag] = useState(null)
  const [hoverReqId, setHoverReqId] = useState(null)
  const suppressClick = useRef(false)

  const viewRequests = drag
    ? requests.map(r => r.id === drag.id ? { ...r, startDate: drag.start, endDate: drag.end } : r)
    : requests

  useEffect(() => {
    if (!drag) return
    function handleUp() {
      const orig = requests.find(r => r.id === drag.id)
      const changed = orig && (!sameDay(dayOnly(orig.startDate), drag.start) || !sameDay(dayOnly(orig.endDate), drag.end))
      setDrag(null)
      onResizePreview?.(null)
      // The click that follows mouseup must not start a new selection
      suppressClick.current = true
      setTimeout(() => { suppressClick.current = false }, 0)
      if (changed) onResizeRequest?.(orig, drag.start, drag.end)
    }
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [drag, requests, onResizeRequest, onResizePreview])

  function handleEdgeDown(req, edge) {
    const s = dayOnly(req.startDate)
    const e = dayOnly(req.endDate)
    const anchor = edge === 'start' ? e : s
    // A period can't be dragged onto its neighbours: limit to the free days around it
    let min = null, max = null
    for (const other of requests) {
      if (other.id === req.id || other.status === 'rejected') continue
      const os = dayOnly(other.startDate)
      const oe = dayOnly(other.endDate)
      if (oe < anchor) {
        const next = new Date(oe); next.setDate(next.getDate() + 1)
        if (!min || next > min) min = next
      } else if (os > anchor) {
        const prev = new Date(os); prev.setDate(prev.getDate() - 1)
        if (!max || prev < max) max = prev
      }
    }
    setSelStart(null); setSelEnd(null); setHover(null); setColTooltip(null)
    setDrag({ id: req.id, anchor, min, max, start: s, end: e })
    onResizePreview?.({ id: req.id, start: s, end: e })
  }

  // Live range while dragging; reported to the parent so it can update counters
  function handleDragEnter(d) {
    if (!drag) return
    if (drag.min && d < drag.min) d = drag.min
    if (drag.max && d > drag.max) d = drag.max
    const start = d < drag.anchor ? d : drag.anchor
    const end   = d < drag.anchor ? drag.anchor : d
    setDrag({ ...drag, start, end })
    onResizePreview?.({ id: drag.id, start, end })
  }

  const effectiveSelEnd = selEnd
    || (selStart && hover && hover > selStart ? hover : null)

  function handleDayClick(d, req) {
    if (suppressClick.current) return
    if (req && !selStart) {
      onRequestClick?.(req)
      return
    }
    if (!selStart || selEnd) {
      setSelStart(d); setSelEnd(null); setHover(null); setColTooltip(null)
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
        userSelect: 'none',
      }}
        onMouseLeave={() => { if (!drag) setHoverReqId(null) }}
      >
        {Array.from({ length: 12 }, (_, m) => (
          <YearMonthGrid
            key={m}
            year={year}
            month={m}
            requests={viewRequests}
            selStart={selStart}
            selEnd={selEnd}
            effectiveSelEnd={effectiveSelEnd}
            today={today}
            onDayClick={handleDayClick}
            onDayEnter={handleDayEnter}
            onDayLeave={() => { setHover(null) }}
            colleagueMap={colleagueMap}
            onColEnter={(x, y, entries) => setColTooltip({ x, y, entries })}
            onColLeave={() => setColTooltip(null)}
            canResize={!!onResizeRequest}
            activeReqId={drag ? drag.id : hoverReqId}
            onReqHover={setHoverReqId}
            dragging={!!drag}
            dragAnchor={drag?.anchor ?? null}
            onEdgeDown={handleEdgeDown}
            onDragEnter={handleDragEnter}
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
              {t('Отпуска коллег')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {colTooltip.entries.map((entry, i) => (
                <div key={i} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FAC031', flexShrink: 0 }} />
                  <div style={{ color: '#FAFAFA', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    {formatNameShort(tName(entry.name))} ({formatDateRangeISO(entry.startDate, entry.endDate)})
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
