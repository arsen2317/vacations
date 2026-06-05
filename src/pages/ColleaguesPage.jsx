import { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { COLLEAGUES, ALL_EMPLOYEES } from '../data/mockData'
import { Chip, SearchIcon, SelectField } from '../ds/index'

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const WD = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

const STATUS_LABEL = {
  approved:  'Согласован',
  pending:   'На согласовании',
  reviewing: 'Ознакомление',
  draft:     'Черновик',
}

const BAR = {
  approved: '#BEF4BD',
  pending:  '#C7E1FF',
  reviewing:'#E3CCFF',
  draft:    '#F2F3F7',
  overlap:  '#FAC031',
}

const PERSON_W = 277
const ROW_H    = 48
const DIVIDER  = '1px solid #E2E5EB'

// ── Helpers ──────────────────────────────────────────────────────────────────

function diMonth(y, m)  { return new Date(y, m + 1, 0).getDate() }
function diYear(y)      { return new Date(y, 1, 29).getMonth() === 1 ? 366 : 365 }

function shortName(person) {
  const parts = (person.name || '').trim().split(/\s+/)
  const surname = parts[parts.length - 1]
  const firstName = parts[0] || ''
  let initials = firstName ? firstName[0].toUpperCase() + '.' : ''
  if (person.patronymic) initials += person.patronymic[0].toUpperCase() + '.'
  return `${surname} ${initials}`.trim()
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

function yearBarPos(seg, year) {
  const ys    = new Date(year, 0, 1).getTime()
  const total = diYear(year) * 86400000
  const s = Math.max(new Date(seg.startDate + 'T00:00:00').getTime(), ys)
  const e = Math.min(new Date(seg.endDate   + 'T00:00:00').getTime(), new Date(year, 11, 31).getTime())
  if (s > e + 86400000) return null
  return {
    left:  `${(s - ys) / total * 100}%`,
    width: `${Math.max((e - s + 86400000) / total * 100, 0.4)}%`,
  }
}

function monthBarPos(seg, year, month) {
  const ms        = new Date(year, month, 1).getTime()
  const me        = new Date(year, month + 1, 0).getTime()
  const s         = Math.max(new Date(seg.startDate + 'T00:00:00').getTime(), ms)
  const e         = Math.min(new Date(seg.endDate   + 'T00:00:00').getTime(), me)
  if (s > me || e < ms) return null
  const totalDays = diMonth(year, month)
  const startDay  = Math.round((s - ms) / 86400000)
  const dur       = Math.round((e - s) / 86400000) + 1
  return {
    left:  `${startDay / totalDays * 100}%`,
    width: `${dur       / totalDays * 100}%`,
  }
}

// ── Small avatar ─────────────────────────────────────────────────────────────
function SmallAvatar({ src }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#E8EDF2', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <svg width="26" height="26" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="17" r="8" fill="#BCC3D0"/>
            <path d="M5 40c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#BCC3D0"/>
          </svg>
      }
    </div>
  )
}

// ── Person left cell (shared by both grids) ──────────────────────────────────
function PersonCell({ person, onRemove, height = ROW_H }) {
  const label = shortName(person) + (person.me ? ' (вы)' : '')
  return (
    <div style={{
      width: PERSON_W, flexShrink: 0, height,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 10px 0 16px',
      borderRight: DIVIDER,
      boxSizing: 'border-box',
    }}>
      <SmallAvatar src={person.avatar} />
      <span style={{
        flex: 1, fontSize: 14, fontFamily: "'MTSCompact', sans-serif",
        color: '#1D2023', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <button
        onClick={() => onRemove(person.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M1 1L11 11M11 1L1 11" stroke="#BCC3D0" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
function ColleaguesTooltip({ tooltip }) {
  if (!tooltip) return null
  const hasOverlap = tooltip.overlaps.length > 0
  return (
    <div style={{
      position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 8,
      zIndex: 9999, background: '#1D2023', borderRadius: 12,
      padding: '10px 14px', pointerEvents: 'none', minWidth: 160, maxWidth: 260,
    }}>
      <div style={{ fontSize: 13, color: '#FAFAFA', fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, marginBottom: 4 }}>
        {tooltip.fmtStart} — {tooltip.fmtEnd}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: hasOverlap ? '#FAC031' : BAR[tooltip.status] ?? BAR.approved }} />
        <span style={{ fontSize: 12, color: '#BCC3D0', fontFamily: "'MTSCompact', sans-serif" }}>
          {hasOverlap ? `пересекается с отпуском: ${tooltip.overlaps.join(', ')}` : STATUS_LABEL[tooltip.status] ?? tooltip.status}
        </span>
      </div>
      <div style={{ position: 'absolute', left: -6, top: 14, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #1D2023' }} />
    </div>
  )
}

// ── Bar helper ───────────────────────────────────────────────────────────────
function Bar({ pos, color, onEnter, onMove, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: 'absolute', top: 0, height: '100%',
        left: pos.left, width: pos.width,
        background: color, borderRadius: 0, cursor: 'default',
      }}
    />
  )
}

// ── Year grid ────────────────────────────────────────────────────────────────
function YearGrid({ year, people, barColor, onRemove, onBarEnter, onBarMove, onBarLeave }) {
  const total = diYear(year)

  // Right-edge positions of months 0..10 (as % of year), used for separator lines in body
  const separatorPcts = useMemo(() => {
    let acc = 0
    return Array.from({ length: 11 }, (_, m) => {
      acc += diMonth(year, m)
      return acc / total * 100
    })
  }, [year, total])

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 860 }}>

        {/* Header */}
        <div style={{ display: 'flex', height: 40, background: '#F2F3F7' }}>
          <div style={{ width: PERSON_W, flexShrink: 0, padding: '0 16px', borderRight: DIVIDER, display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>Сотрудник</span>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {Array.from({ length: 12 }, (_, m) => (
              <div key={m} style={{
                flex: diMonth(year, m),
                padding: '0 12px',
                borderRight: m < 11 ? DIVIDER : 'none',
                display: 'flex', alignItems: 'center',
                overflow: 'hidden',
              }}>
                <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", whiteSpace: 'nowrap' }}>
                  {MONTHS[m]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {people.map((person, pi) => (
          <div key={person.id} style={{ display: 'flex', borderBottom: pi < people.length - 1 ? DIVIDER : 'none' }}>
            <PersonCell person={person} onRemove={onRemove} />
            <div style={{ flex: 1, position: 'relative', height: ROW_H }}>
              {/* Month separator lines */}
              {separatorPcts.map((pct, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: '#E2E5EB', pointerEvents: 'none' }} />
              ))}
              {person.segments.map((seg, i) => {
                const pos = yearBarPos(seg, year)
                if (!pos) return null
                return <Bar key={i} pos={pos} color={barColor(seg, person.me)}
                  onEnter={e => onBarEnter?.(e, seg, person)}
                  onMove={e => onBarMove?.(e)}
                  onLeave={() => onBarLeave?.()}
                />
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

// ── Month grid ───────────────────────────────────────────────────────────────
function MonthGrid({ year, month, people, barColor, onRemove, onPrev, onNext, onBarEnter, onBarMove, onBarLeave }) {
  const totalDays = diMonth(year, month)
  const days = Array.from({ length: totalDays }, (_, i) => {
    const dow = (new Date(year, month, i + 1).getDay() + 6) % 7
    return { n: i + 1, dow, isWeekend: dow >= 5 }
  })

  // Separator positions in body (right edge of day n): n/totalDays * 100%
  // Only draw n=1..totalDays-1 (last has no right separator)
  const sepPcts = Array.from({ length: totalDays - 1 }, (_, i) => (i + 1) / totalDays * 100)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 860 }}>

        {/* Header: nav cell + day cells in one flex row */}
        <div style={{ display: 'flex', height: 72, background: '#F2F3F7' }}>
          {/* Nav + title */}
          <div style={{ width: PERSON_W, flexShrink: 0, borderRight: DIVIDER, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}>
            <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="#626C77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ fontSize: 14, fontFamily: "'MTSCompact', sans-serif", color: '#626C77', whiteSpace: 'nowrap' }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="#626C77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {/* Day columns */}
          <div style={{ flex: 1, display: 'flex' }}>
            {days.map(d => (
              <div key={d.n} style={{
                flex: 1,
                borderRight: d.n < totalDays ? DIVIDER : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: d.isWeekend ? '#F15641' : '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", lineHeight: '16px' }}>{WD[d.dow]}</span>
                <span style={{ color: d.isWeekend ? '#F15641' : '#1D2023', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{d.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Person rows */}
        {people.map((person, pi) => (
          <div key={person.id} style={{ display: 'flex', borderBottom: pi < people.length - 1 ? DIVIDER : 'none' }}>
            <PersonCell person={person} onRemove={onRemove} />
            <div style={{ flex: 1, position: 'relative', height: ROW_H }}>
              {/* Day separator lines aligned with header borderRight */}
              {sepPcts.map((pct, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: '#E2E5EB', pointerEvents: 'none' }} />
              ))}
              {person.segments.map((seg, i) => {
                const pos = monthBarPos(seg, year, month)
                if (!pos) return null
                return <Bar key={i} pos={pos} color={barColor(seg, person.me)}
                  onEnter={e => onBarEnter?.(e, seg, person)}
                  onMove={e => onBarMove?.(e)}
                  onLeave={() => onBarLeave?.()}
                />
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
const CURRENT_YEAR = 2026
const INITIAL_IDS = COLLEAGUES.map(c => c.id)

export default function ColleaguesPage() {
  const { segments: planSegments, planStatus } = useApp()

  const [viewMode,   setViewMode]   = useState('year')
  const [year,       setYear]       = useState(CURRENT_YEAR)
  const [viewMonth,  setViewMonth]  = useState(new Date().getMonth())
  const [showDrafts, setShowDrafts] = useState(true)
  const [searchQ,    setSearchQ]    = useState('')
  const [showDrop,   setShowDrop]   = useState(false)
  const [listIds,    setListIds]    = useState(INITIAL_IDS)
  const [tooltip,    setTooltip]    = useState(null)

  const searchRef = useRef(null)

  useEffect(() => { setViewMonth(0) }, [year])

  useEffect(() => {
    function h(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQ.trim()) return []
    const q = searchQ.toLowerCase()
    return ALL_EMPLOYEES
      .filter(e => !listIds.includes(e.id) && e.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [searchQ, listIds])

  const people = useMemo(() => {
    return listIds.map(id => {
      const col = COLLEAGUES.find(c => c.id === id)
      const emp = ALL_EMPLOYEES.find(e => e.id === id)
      const name       = col?.name       ?? emp?.name       ?? `Сотрудник ${id}`
      const patronymic = col?.patronymic ?? emp?.patronymic
      const avatar     = col?.avatar     ?? emp?.avatar
      const me         = col?.me         ?? false

      let segs = [...(col?.segments ?? [])]

      if (me && year === 2027) {
        segs = [
          ...segs.filter(s => !s.startDate.startsWith('2027')),
          ...planSegments.map(s => ({ startDate: s.startDate, endDate: s.endDate, status: planStatus })),
        ]
      }

      const yr = String(year)
      segs = segs.filter(s => s.startDate.startsWith(yr) || s.endDate.startsWith(yr))
      if (!showDrafts) segs = segs.filter(s => s.status !== 'draft')

      return { id, name, patronymic, avatar, me, segments: segs }
    })
  }, [listIds, year, showDrafts, planSegments, planStatus])

  const overlapKeys = useMemo(() => {
    const me = people.find(p => p.me)
    if (!me) return new Set()
    const others = people.filter(p => !p.me)
    const keys = new Set()
    me.segments.forEach(seg => {
      const ms  = new Date(seg.startDate + 'T00:00:00').getTime()
      const me2 = new Date(seg.endDate   + 'T00:00:00').getTime()
      const hasOverlap = others.some(o =>
        o.segments.some(os => {
          const oss = new Date(os.startDate + 'T00:00:00').getTime()
          const ose = new Date(os.endDate   + 'T00:00:00').getTime()
          return ms <= ose && me2 >= oss
        })
      )
      if (hasOverlap) keys.add(`${seg.startDate}|${seg.endDate}`)
    })
    return keys
  }, [people])

  function barColor(seg, isMe) {
    const isOverlappable = seg.status === 'draft' || seg.status === 'pending'
    if (isMe && isOverlappable && overlapKeys.has(`${seg.startDate}|${seg.endDate}`)) return BAR.overlap
    return BAR[seg.status] ?? BAR.approved
  }

  function handleBarEnter(e, seg, person) {
    const isOverlappable = seg.status === 'draft' || seg.status === 'pending'
    let overlaps = []
    if (isOverlappable) {
      const ms = new Date(seg.startDate + 'T00:00:00').getTime()
      const me = new Date(seg.endDate   + 'T00:00:00').getTime()
      overlaps = people
        .filter(p => p.id !== person.id)
        .flatMap(p => p.segments.filter(os => {
          const oss = new Date(os.startDate + 'T00:00:00').getTime()
          const ose = new Date(os.endDate   + 'T00:00:00').getTime()
          return ms <= ose && me >= oss
        }).map(() => shortName(p)))
      overlaps = [...new Set(overlaps)]
    }
    setTooltip({ fmtStart: fmtDate(seg.startDate), fmtEnd: fmtDate(seg.endDate), status: seg.status, overlaps, x: e.clientX, y: e.clientY })
  }

  function addPerson(emp) {
    setListIds(prev => [...prev, emp.id])
    setSearchQ('')
    setShowDrop(false)
  }

  function removePerson(id) {
    setListIds(prev => prev.filter(x => x !== id))
  }

  function prevMonth() {
    if (viewMonth === 0) { setYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ColleaguesTooltip tooltip={tooltip} />

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: '0 0 280px' }}>
          <div style={{
            height: 44, paddingLeft: 12, paddingRight: 12,
            background: '#F2F3F7', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            outline: '1px rgba(188,195,208,0.5) solid', outlineOffset: '-1px',
          }}>
            <SearchIcon color="#8C9BAB" />
            <input
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setShowDrop(true) }}
              onFocus={() => setShowDrop(true)}
              placeholder="Поиск по сотрудникам"
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: 17, fontFamily: "'MTSCompact', sans-serif",
                color: '#1D2023', outline: 'none',
              }}
            />
          </div>
          {showDrop && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#fff', borderRadius: 16,
              boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
              zIndex: 200, overflow: 'hidden',
            }}>
              {searchResults.map(emp => (
                <div key={emp.id} onMouseDown={() => addPerson(emp)}
                  style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F2F3F7'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <SmallAvatar src={emp.avatar} />
                  <div>
                    <div style={{ fontSize: 14, color: '#1D2023', fontFamily: "'MTSCompact', sans-serif" }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{emp.team}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Year selector */}
        <div style={{ width: 120 }}>
          <SelectField
            value={String(year)}
            options={[{ id: '2026', name: '2026' }, { id: '2027', name: '2027' }]}
            onChange={v => setYear(Number(v))}
          />
        </div>

        {/* Show drafts */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setShowDrafts(v => !v)}
            style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${showDrafts ? '#0066FF' : '#BCC3D0'}`,
              background: showDrafts ? '#0066FF' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {showDrafts && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: 17, color: '#1D2023', fontFamily: "'MTSCompact', sans-serif" }}>Показывать черновики</span>
        </label>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip active={viewMode === 'year'}  onClick={() => setViewMode('year')}>Год</Chip>
          <Chip active={viewMode === 'month'} onClick={() => setViewMode('month')}>Месяц</Chip>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ background: '#fff', border: DIVIDER, borderTop: 'none', overflow: 'hidden' }}>
        {viewMode === 'year' ? (
          <YearGrid
            year={year} people={people} barColor={barColor} onRemove={removePerson}
            onBarEnter={handleBarEnter}
            onBarMove={e => setTooltip(p => p ? { ...p, x: e.clientX, y: e.clientY } : p)}
            onBarLeave={() => setTooltip(null)}
          />
        ) : (
          <MonthGrid
            year={year} month={viewMonth} people={people} barColor={barColor} onRemove={removePerson}
            onPrev={prevMonth} onNext={nextMonth}
            onBarEnter={handleBarEnter}
            onBarMove={e => setTooltip(p => p ? { ...p, x: e.clientX, y: e.clientY } : p)}
            onBarLeave={() => setTooltip(null)}
          />
        )}
        {people.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#626C77', fontFamily: "'MTSCompact', sans-serif", fontSize: 14 }}>
            Нет сотрудников для отображения
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'draft',    label: 'черновик',               border: true },
          { key: 'pending',  label: 'на согласовании' },
          { key: 'approved', label: 'согласован' },
          { key: 'overlap',  label: 'пересечения с коллегами' },
        ].map(({ key, label, border }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: BAR[key], boxShadow: border ? 'inset 0 0 0 1px #BCC3D0' : 'none',
            }} />
            <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
