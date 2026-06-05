import { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { COLLEAGUES, ALL_EMPLOYEES } from '../data/mockData'
import { Chip, SearchIcon } from '../ds/index'

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const WD = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

const BAR = {
  approved: '#BEF4BD',
  pending:  '#C7E1FF',
  reviewing:'#E3CCFF',
  draft:    '#F2F3F7',
  overlap:  '#FAC031',
}

const PERSON_W = 208
const ROW_H    = 48
const BAR_H    = 28
const BAR_TOP  = (ROW_H - BAR_H) / 2
const DAY_W    = 38

// ── Helpers ──────────────────────────────────────────────────────────────────

function diMonth(y, m)  { return new Date(y, m + 1, 0).getDate() }
function diYear(y)      { return new Date(y, 1, 29).getMonth() === 1 ? 366 : 365 }

// "Алексей Морозов" → "Морозов А."
function shortName(name) {
  if (!name) return ''
  const p = name.trim().split(/\s+/)
  if (p.length < 2) return p[0]
  return `${p[p.length - 1]} ${p.slice(0, -1).map(w => w[0].toUpperCase() + '.').join('')}`
}

function yearBarPos(seg, year) {
  const ys   = new Date(year, 0, 1).getTime()
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
  const ms = new Date(year, month, 1).getTime()
  const me = new Date(year, month + 1, 0).getTime()
  const s  = Math.max(new Date(seg.startDate + 'T00:00:00').getTime(), ms)
  const e  = Math.min(new Date(seg.endDate   + 'T00:00:00').getTime(), me)
  if (s > me || e < ms) return null
  const startDay = Math.round((s - ms) / 86400000)
  const dur      = Math.round((e - s) / 86400000) + 1
  return { left: startDay * DAY_W, width: dur * DAY_W }
}

// ── Small avatar (PersonAvatar is 52px-fixed; grid needs 32px) ───────────────
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

// ── Person left-column cell ──────────────────────────────────────────────────
function PersonCell({ person, onRemove }) {
  const label = shortName(person.name) + (person.me ? ' (вы)' : '')
  return (
    <div style={{
      width: PERSON_W, flexShrink: 0, height: ROW_H,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 10px 0 16px',
      borderRight: '1px solid #F2F3F7',
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

// ── Year grid ────────────────────────────────────────────────────────────────
function YearGrid({ year, people, barColor, onRemove }) {
  const total = diYear(year)
  // Pre-compute month separator positions (% from left)
  const separators = useMemo(() => {
    let acc = 0
    return Array.from({ length: 11 }, (_, m) => {
      acc += diMonth(year, m)
      return (acc / total) * 100
    })
  }, [year, total])

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 860 }}>
        {/* Header */}
        <div style={{ display: 'flex', height: 44, borderBottom: '1px solid #F2F3F7' }}>
          <div style={{ width: PERSON_W, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid #F2F3F7' }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>Сотрудник</span>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {Array.from({ length: 12 }, (_, m) => (
              <div key={m} style={{
                flex: diMonth(year, m),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                borderRight: m < 11 ? '1px solid #F2F3F7' : 'none',
                color: '#626C77', fontSize: 13, fontFamily: "'MTSCompact', sans-serif",
              }}>
                {MONTHS[m]}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {people.map(person => (
          <div key={person.id} style={{ display: 'flex', borderBottom: '1px solid #F2F3F7' }}>
            <PersonCell person={person} onRemove={onRemove} />
            <div style={{ flex: 1, position: 'relative', height: ROW_H }}>
              {separators.map((pct, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: '#F2F3F7', pointerEvents: 'none' }} />
              ))}
              {person.segments.map((seg, i) => {
                const pos = yearBarPos(seg, year)
                if (!pos) return null
                return (
                  <div key={i} style={{
                    position: 'absolute', top: BAR_TOP, height: BAR_H,
                    left: pos.left, width: pos.width,
                    background: barColor(seg, person.me),
                    borderRadius: 6,
                  }} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Month grid ───────────────────────────────────────────────────────────────
function MonthGrid({ year, month, people, barColor, onRemove, onPrev, onNext }) {
  const totalDays = diMonth(year, month)
  const days = Array.from({ length: totalDays }, (_, i) => {
    const dow = (new Date(year, month, i + 1).getDay() + 6) % 7
    return { n: i + 1, dow, isWeekend: dow >= 5 }
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: PERSON_W + totalDays * DAY_W }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', height: 44, borderBottom: '1px solid #F2F3F7' }}>
          <div style={{ width: PERSON_W, flexShrink: 0, borderRight: '1px solid #F2F3F7' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ fontSize: 17, fontWeight: 500, fontFamily: "'MTSCompact', sans-serif", color: '#1D2023', minWidth: 160, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Day header */}
        <div style={{ display: 'flex', height: 44, borderBottom: '1px solid #F2F3F7' }}>
          <div style={{ width: PERSON_W, flexShrink: 0, borderRight: '1px solid #F2F3F7' }} />
          {days.map(d => (
            <div key={d.n} style={{
              width: DAY_W, flexShrink: 0, height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRight: '1px solid #F2F3F7',
              color: d.isWeekend ? '#F95721' : '#626C77',
              fontSize: 11, fontFamily: "'MTSCompact', sans-serif",
            }}>
              <span>{WD[d.dow]}</span>
              <span style={{ fontWeight: 500 }}>{d.n}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {people.map(person => (
          <div key={person.id} style={{ display: 'flex', borderBottom: '1px solid #F2F3F7' }}>
            <PersonCell person={person} onRemove={onRemove} />
            <div style={{ position: 'relative', width: totalDays * DAY_W, flexShrink: 0, height: ROW_H }}>
              {days.map(d => (
                <div key={d.n} style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: d.n * DAY_W - 1, width: 1, background: '#F2F3F7',
                }} />
              ))}
              {person.segments.map((seg, i) => {
                const pos = monthBarPos(seg, year, month)
                if (!pos) return null
                return (
                  <div key={i} style={{
                    position: 'absolute', top: BAR_TOP, height: BAR_H,
                    left: pos.left, width: pos.width,
                    background: barColor(seg, person.me),
                    borderRadius: 6,
                  }} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
const INITIAL_IDS = COLLEAGUES.map(c => c.id)

export default function ColleaguesPage() {
  const { segments: planSegments, planStatus } = useApp()

  const [viewMode,   setViewMode]   = useState('year')
  const [year,       setYear]       = useState(2027)
  const [viewMonth,  setViewMonth]  = useState(0)
  const [showDrafts, setShowDrafts] = useState(true)
  const [searchQ,    setSearchQ]    = useState('')
  const [showDrop,   setShowDrop]   = useState(false)
  const [listIds,    setListIds]    = useState(INITIAL_IDS)

  const searchRef = useRef(null)

  // Reset month when year changes
  useEffect(() => { setViewMonth(0) }, [year])

  // Close dropdown on outside click
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

  // Build people data, merging planning state for current user 2027
  const people = useMemo(() => {
    return listIds.map(id => {
      const col = COLLEAGUES.find(c => c.id === id)
      const emp = ALL_EMPLOYEES.find(e => e.id === id)
      const name   = col?.name   ?? emp?.name   ?? `Сотрудник ${id}`
      const avatar = col?.avatar ?? emp?.avatar
      const me     = col?.me     ?? false

      let segs = [...(col?.segments ?? [])]

      // For current user in 2027, replace 2027 data with live planning segments
      if (me && year === 2027) {
        segs = [
          ...segs.filter(s => !s.startDate.startsWith('2027')),
          ...planSegments.map(s => ({ startDate: s.startDate, endDate: s.endDate, status: planStatus })),
        ]
      }

      // Filter to selected year
      const yr = String(year)
      segs = segs.filter(s => s.startDate.startsWith(yr) || s.endDate.startsWith(yr))

      // Optionally hide drafts
      if (!showDrafts) segs = segs.filter(s => s.status !== 'draft')

      return { id, name, avatar, me, segments: segs }
    })
  }, [listIds, year, showDrafts, planSegments, planStatus])

  // For current user: mark segments that overlap with any other listed person
  const overlapKeys = useMemo(() => {
    const me = people.find(p => p.me)
    if (!me) return new Set()
    const others = people.filter(p => !p.me)
    const keys = new Set()
    me.segments.forEach(seg => {
      const ms = new Date(seg.startDate + 'T00:00:00').getTime()
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
    if (isMe && overlapKeys.has(`${seg.startDate}|${seg.endDate}`)) return BAR.overlap
    return BAR[seg.status] ?? BAR.approved
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
                <div
                  key={emp.id}
                  onMouseDown={() => addPerson(emp)}
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
        <div style={{
          height: 44, paddingLeft: 16, paddingRight: 32,
          background: '#F2F3F7', borderRadius: 12,
          display: 'flex', alignItems: 'center', position: 'relative',
          outline: '1px rgba(188,195,208,0.5) solid', outlineOffset: '-1px',
        }}>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 17, fontFamily: "'MTSCompact', sans-serif", color: '#1D2023',
              appearance: 'none', outline: 'none',
            }}
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <div style={{ position: 'absolute', right: 12, pointerEvents: 'none' }}>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path d="M1 1L6 6L11 1" stroke="#626C77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F2F3F7', overflow: 'hidden' }}>
        {viewMode === 'year' ? (
          <YearGrid
            year={year}
            people={people}
            barColor={barColor}
            onRemove={removePerson}
          />
        ) : (
          <MonthGrid
            year={year}
            month={viewMonth}
            people={people}
            barColor={barColor}
            onRemove={removePerson}
            onPrev={prevMonth}
            onNext={nextMonth}
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
          { key: 'draft',   label: 'черновик',               border: true },
          { key: 'pending', label: 'на согласовании' },
          { key: 'approved',label: 'согласован' },
          { key: 'overlap', label: 'пересечения с коллегами' },
        ].map(({ key, label, border }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: BAR[key],
              boxShadow: border ? 'inset 0 0 0 1px #BCC3D0' : 'none',
            }} />
            <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
