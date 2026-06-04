import { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, fmtDate, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES, ALL_EMPLOYEES, CURRENT_USER } from '../data/mockData'
import {
  COLORS, BTN_STYLE,
  Banner, CalendarRange, SelectField, Chip,
  SearchIcon, InfoIcon,
} from '../ds/index.js'

const TODAY = new Date('2026-05-19T00:00:00')

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const SEG_COLORS = {
  approved:  '#BEF4BD',
  pending:   '#C7E1FF',
  reviewing: '#F8E4C5',
  draft:     '#EAF1FF',
}

const COLLEAGUES_MAP = Object.fromEntries(COLLEAGUES.map(c => [c.id, c]))
const INITIAL_COL_IDS = COLLEAGUES
  .filter(c => c.team === CURRENT_USER.team)
  .map(c => c.id)

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель' }
const EXTRA_APPROVER_OPTIONS = COLLEAGUES
  .filter(c => !c.me)
  .map(c => ({ id: String(c.id), name: c.name }))

const YEAR_OPTIONS = [
  { id: 2025, name: '2025' },
  { id: 2026, name: '2026' },
  { id: 2027, name: '2027' },
]

const PLAN_LABELS = [
  { value: 'draft',    label: 'Черновик' },
  { value: 'pending',  label: 'На согласовании' },
  { value: 'approved', label: 'Согласован' },
]

function dateToISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getBarProps(segStart, segEnd, rangeStart, rangeEnd, rangeDays) {
  const s = new Date(segStart + 'T00:00:00')
  const e = new Date(segEnd + 'T00:00:00')
  const cs = s < rangeStart ? rangeStart : s
  const ce = e > rangeEnd ? rangeEnd : e
  if (cs > rangeEnd || ce < rangeStart) return null
  const offset = Math.round((cs - rangeStart) / 86400000)
  const duration = Math.round((ce - cs) / 86400000) + 1
  return {
    left: `${(offset / rangeDays) * 100}%`,
    width: `${(duration / rangeDays) * 100}%`,
  }
}

function segTemporalStatus(seg) {
  const start = new Date(seg.startDate + 'T00:00:00')
  const end   = new Date(seg.endDate   + 'T00:00:00')
  if (TODAY > end)    return 'past'
  if (TODAY >= start) return 'ongoing'
  return 'upcoming'
}

function daysUntilStart(seg) {
  return Math.ceil((new Date(seg.startDate + 'T00:00:00') - TODAY) / 86400000)
}

function Overlay({ onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

// ─────────── Colleagues Gantt Panel ───────────
function ColleaguesPlanPanel({ planStatus, userSegments }) {
  const [colYear, setColYear]         = useState(2026)
  const [viewStart, setViewStart]     = useState(0)
  const [showDrafts, setShowDrafts]   = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [colIds, setColIds]           = useState(INITIAL_COL_IDS)

  const visibleMonths = useMemo(
    () => Array.from({ length: 6 }, (_, i) => viewStart + i),
    [viewStart],
  )
  const rangeStart   = useMemo(() => new Date(colYear, viewStart, 1), [colYear, viewStart])
  const rangeEnd     = useMemo(() => new Date(colYear, viewStart + 6, 0), [colYear, viewStart])
  const rangeDays    = useMemo(() => Math.round((rangeEnd - rangeStart) / 86400000) + 1, [rangeStart, rangeEnd])
  const totalMoDays  = useMemo(
    () => visibleMonths.reduce((s, m) => s + daysInMonth(colYear, m), 0),
    [colYear, visibleMonths],
  )

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return ALL_EMPLOYEES
      .filter(e => !colIds.includes(e.id) && e.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [searchQuery, colIds])

  const people = useMemo(() => colIds.map(id => {
    const col  = COLLEAGUES_MAP[id]
    const emp  = ALL_EMPLOYEES.find(e => e.id === id)
    const name = col?.name ?? emp?.name ?? `Сотрудник ${id}`
    const me   = col?.me ?? false
    const avatar = col?.avatar ?? emp?.avatar
    const allSegs = col?.segments ?? []
    const segs = showDrafts ? allSegs : allSegs.filter(s => s.status !== 'draft')
    return {
      id, name, me, avatar,
      segments: me ? userSegments.map(s => ({ ...s, status: planStatus })) : segs,
    }
  }), [colIds, showDrafts, userSegments, planStatus])

  const PERSON_COL_W = 277

  return (
    <div style={{
      background: '#fff',
      borderRadius: 24,
      padding: 32,
      outline: `1px ${COLORS.stroke} solid`,
      outlineOffset: '-1px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide',sans-serif", lineHeight: '28px' }}>
        Планы отпуска коллег
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <div style={{
            height: 44, background: COLORS.bg, borderRadius: 16,
            outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
            display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
          }}>
            <SearchIcon />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Поиск по сотрудникам"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif",
              }}
            />
          </div>
          {searchFocused && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 48, left: 0, right: 0, zIndex: 200,
              background: '#fff', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              border: `1px solid ${COLORS.stroke}`, overflow: 'hidden',
            }}>
              {searchResults.map(emp => (
                <div
                  key={emp.id}
                  onMouseDown={() => { setColIds(prev => [...prev, emp.id]); setSearchQuery('') }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                    color: COLORS.text, fontFamily: "'MTSCompact',sans-serif",
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ flex: 1 }}>{emp.name}</span>
                  <span style={{ fontSize: 12, color: COLORS.secondary }}>{emp.team}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Year select */}
        <div style={{ width: 110 }}>
          <SelectField
            value={colYear}
            onChange={v => { setColYear(v); setViewStart(0) }}
            options={YEAR_OPTIONS}
          />
        </div>

        {/* Nav arrows — 1-month step */}
        {[
          { dir: -1, path: 'M7 1L1 7L7 13' },
          { dir:  1, path: 'M1 1L7 7L1 13' },
        ].map(({ dir, path }) => {
          const next = viewStart + dir
          const disabled = next < 0 || next > 6
          return (
            <button
              key={dir}
              onClick={() => !disabled && setViewStart(next)}
              style={{
                width: 44, height: 44, background: COLORS.bg, border: 'none', borderRadius: 16,
                cursor: disabled ? 'not-allowed' : 'pointer',
                outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: disabled ? 0.35 : 1, flexShrink: 0,
              }}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d={path} stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )
        })}
      </div>

      {/* Show drafts */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div
          onClick={() => setShowDrafts(v => !v)}
          style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${showDrafts ? COLORS.blue : '#BCC3D0'}`,
            background: showDrafts ? COLORS.blue : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {showDrafts && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span style={{ fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif" }}>
          Показывать черновики
        </span>
      </label>

      {/* Gantt table */}
      <div style={{ overflow: 'auto' }}>
        {/* Month headers */}
        <div style={{ display: 'flex', height: 40, minWidth: 0 }}>
          <div style={{
            width: PERSON_COL_W, flexShrink: 0,
            paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
            background: '#F2F3F7', boxShadow: '-1px 0px 0px #E2E5EB inset',
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTS Sans',sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Сотрудник
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {visibleMonths.map(m => (
              <div key={m} style={{
                width: `${(daysInMonth(colYear, m) / totalMoDays) * 100}%`,
                background: '#F2F3F7', boxShadow: '-1px 0px 0px #E2E5EB inset',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#626C77', fontSize: 14, fontFamily: "'MTS Sans',sans-serif",
                fontWeight: 400, lineHeight: '20px',
              }}>
                {MONTH_NAMES[m]}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {people.length === 0
          ? <div style={{ padding: '32px 0', textAlign: 'center', color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact',sans-serif" }}>
              Нет сотрудников
            </div>
          : people.map((person, idx) => (
            <div key={person.id}>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                {/* Person cell */}
                <div style={{
                  width: PERSON_COL_W, flexShrink: 0,
                  paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                  boxShadow: '-1px 0px 0px #E2E5EB inset',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {/* Avatar with stroke overlay */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 16,
                    position: 'relative', overflow: 'hidden',
                    background: COLORS.bg, flexShrink: 0,
                  }}>
                    {person.avatar
                      ? <img src={person.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: COLORS.secondary }}>
                          {person.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                        </div>
                    }
                    {/* Inner stroke overlay */}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 16,
                      border: '1px rgba(188,195,208,0.50) solid', pointerEvents: 'none',
                    }} />
                  </div>
                  <span style={{
                    color: '#1D2023', fontSize: 14, fontFamily: "'MTS Compact',sans-serif",
                    fontWeight: 400, lineHeight: '20px',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {person.name}{person.me ? ' (вы)' : ''}
                  </span>
                  {/* X button */}
                  <button
                    onClick={() => setColIds(prev => prev.filter(x => x !== person.id))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 4, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <div style={{ width: 12, height: 12, position: 'relative', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1L11 11M11 1L1 11" stroke="#8D969F" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Bars area */}
                <div style={{ flex: 1, position: 'relative', height: 68, overflow: 'hidden' }}>
                  {person.segments.map((seg, bi) => {
                    const bp = getBarProps(seg.startDate, seg.endDate, rangeStart, rangeEnd, rangeDays)
                    if (!bp) return null
                    return (
                      <div key={bi} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        background: SEG_COLORS[seg.status ?? 'approved'] ?? SEG_COLORS.approved,
                        ...bp,
                      }} title={`${fmtDate(seg.startDate)} — ${fmtDate(seg.endDate)}`} />
                    )
                  })}
                </div>
              </div>
              {/* Row separator — only between rows */}
              {idx < people.length - 1 && (
                <div style={{ height: 1, background: 'rgba(188,195,208,0.50)', minWidth: 0 }} />
              )}
            </div>
          ))
        }
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'draft',    label: 'черновик' },
          { key: 'pending',  label: 'на согласовании' },
          { key: 'approved', label: 'согласован' },
        ].map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: SEG_COLORS[key], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────── Main Page ───────────
export default function PlanningPage({ onGoToRequests }) {
  const {
    campaign, segments, setSegments, draftSaved, setDraftSaved,
    planStatus, setPlanStatus, approvedSegments, reschedules, setReschedules,
    balance,
  } = useApp()

  const year = campaign.year

  const distributedDays = useMemo(() => segments.reduce((s, seg) => s + seg.days, 0), [segments])
  const remainingDays   = campaign.totalDays - distributedDays
  const hasLongSegment  = segments.some(s => s.days >= 14)
  const canSubmit       = remainingDays === 0 && hasLongSegment
  const progressPct     = Math.min(100, Math.round((distributedDays / campaign.totalDays) * 100))

  const [showAddDialog,     setShowAddDialog]     = useState(false)
  const [addError,          setAddError]          = useState('')
  const [showSubmitDialog,  setShowSubmitDialog]  = useState(false)
  const [extraApprover,     setExtraApprover]     = useState(null)
  const [rescheduleSegId,   setRescheduleSegId]   = useState(null)
  const [rescheduleError,   setRescheduleError]   = useState('')

  const displaySegments = planStatus === 'approved' ? approvedSegments : segments

  function tryAddSegment(start, end) {
    setAddError('')
    const startStr = dateToISO(start)
    const endStr   = dateToISO(end)
    const s = new Date(startStr + 'T00:00:00')
    const e = new Date(endStr   + 'T00:00:00')
    if (s.getFullYear() !== year || e.getFullYear() !== year) {
      setAddError(`Даты должны быть в ${year} году`); return false
    }
    for (const seg of segments) {
      const ss = new Date(seg.startDate + 'T00:00:00')
      const se = new Date(seg.endDate   + 'T00:00:00')
      if (s <= se && e >= ss) { setAddError('Период пересекается с существующим'); return false }
    }
    const days = countVacationDays(s, e)
    if (days > remainingDays) {
      setAddError(`${pluralDays(days)} — превышает остаток ${pluralDays(remainingDays)}`); return false
    }
    const seg = { id: Date.now(), startDate: startStr, endDate: endStr, days }
    setSegments(prev => [...prev, seg].sort((a, b) => a.startDate.localeCompare(b.startDate)))
    setDraftSaved(false)
    return true
  }

  function handleAddApply(start, end) {
    if (tryAddSegment(start, end)) setShowAddDialog(false)
  }

  function handleRescheduleApply(start, end) {
    setRescheduleError('')
    const startStr = dateToISO(start)
    const endStr   = dateToISO(end)
    const ns = new Date(startStr + 'T00:00:00')
    const ne = new Date(endStr   + 'T00:00:00')
    for (const seg of approvedSegments) {
      if (seg.id === rescheduleSegId) continue
      const ss = new Date(seg.startDate + 'T00:00:00')
      const se = new Date(seg.endDate   + 'T00:00:00')
      if (ns <= se && ne >= ss) { setRescheduleError('Период пересекается с другим отрезком'); return }
    }
    setReschedules(prev => ({
      ...prev,
      [rescheduleSegId]: {
        count:   (prev[rescheduleSegId]?.count ?? 0) + 1,
        pending: { startDate: startStr, endDate: endStr },
      },
    }))
    setRescheduleSegId(null)
  }

  const rescheduleSegment = rescheduleSegId
    ? approvedSegments.find(s => s.id === rescheduleSegId)
    : null

  const submitBlockers = [
    remainingDays > 0 && `нераспределено ${pluralDays(remainingDays)}`,
    !hasLongSegment   && 'нет отрезка ≥ 14 дней',
  ].filter(Boolean)

  // ── Balance cards data ──
  const balanceCards = [
    {
      label: `Основной отпуск на ${year} г.`,
      value: `${campaign.totalDays} дней`,
    },
    {
      label: 'Накопленный отпуск',
      value: `${balance?.main ?? 20} дней`,
    },
    {
      label: 'Распределено',
      value: `${distributedDays} из ${campaign.totalDays} дней`,
      info: 'Дни, распределённые по периодам отпуска',
    },
  ]

  const CARD_STYLE = {
    background: '#fff',
    borderRadius: 20,
    padding: '20px 24px',
    outline: `1px ${COLORS.stroke} solid`,
    outlineOffset: '-1px',
  }

  const BTN = (extra) => ({
    ...BTN_STYLE,
    height: 44,
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    width: '100%',
    ...extra,
  })

  return (
    <div style={{ fontFamily: "'MTSCompact',sans-serif" }}>

      {/* ── Balance cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32, marginTop: 40, marginBottom: 32 }}>
        {balanceCards.map((card, i) => (
          <div key={i} style={{ ...CARD_STYLE, gridColumn: 'span 4', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif", lineHeight: '18px' }}>
                {card.label}
              </span>
              {card.info && (
                <span title={card.info} style={{ cursor: 'help', display: 'flex', alignItems: 'center' }}>
                  <InfoIcon color={COLORS.hint} />
                </span>
              )}
            </div>
            <div style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSCompact',sans-serif", fontWeight: 500, lineHeight: '28px', wordWrap: 'break-word' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32, alignItems: 'start' }}>

        {/* ── Left: Vacation Periods (4/12 cols) ── */}
        <div style={{
          gridColumn: 'span 4',
          background: '#fff', borderRadius: 24, padding: 32,
          outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide',sans-serif", lineHeight: '28px' }}>
            Периоды отпуска
          </div>

          {/* Status banners */}
          {planStatus === 'pending' && (
            <Banner title="Ожидает согласования" subtitle="План отправлен руководителю. Ожидайте ответа." />
          )}
          {planStatus === 'approved' && (
            <Banner title="План согласован" subtitle={`Руководитель одобрил ваш план отпуска на ${year} год`} />
          )}

          {/* Rules link (draft only) */}
          {planStatus === 'draft' && (
            <button style={{
              width: '100%', padding: '10px 16px',
              background: COLORS.bg, border: 'none', borderRadius: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoIcon color={COLORS.blue} />
                <span style={{ fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif" }}>
                  Правила планирования отпуска
                </span>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="#8C9BAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Progress bar (draft only) */}
          {planStatus === 'draft' && (
            <div>
              <div style={{ height: 8, background: COLORS.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`, borderRadius: 4,
                  background: remainingDays === 0 ? '#26CD58' : '#FFBB00',
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>
                {distributedDays} из {campaign.totalDays} дней распределено
              </span>
            </div>
          )}

          {/* Error */}
          {addError && <Banner type="error" title={addError} />}

          {/* Segments list */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displaySegments.length === 0
              ? <div style={{ padding: '24px 0', textAlign: 'center', color: COLORS.secondary, fontSize: 14 }}>
                  Нет добавленных отрезков
                </div>
              : displaySegments.map(seg => {
                  const rInfo = reschedules[seg.id] ?? { count: 0, pending: null }
                  const tStatus = planStatus === 'approved' ? segTemporalStatus(seg) : null
                  const dl = tStatus === 'upcoming' ? daysUntilStart(seg) : 0
                  const canReschedule = planStatus === 'approved'
                    && tStatus === 'upcoming' && dl >= 10
                    && rInfo.count < 2 && !rInfo.pending

                  const rescheduleTitle = !canReschedule && planStatus === 'approved'
                    ? tStatus === 'past'    ? 'Отрезок уже прошёл'
                    : tStatus === 'ongoing' ? 'Уже начался'
                    : dl < 10              ? 'Менее 10 дней до начала'
                    : rInfo.count >= 2     ? 'Лимит переносов (2/2)'
                    : rInfo.pending        ? 'Перенос на согласовании'
                    : '' : ''

                  return (
                    <div key={seg.id} style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 12,
                      paddingTop: 10, paddingBottom: 10,
                      borderBottom: `1px solid ${COLORS.stroke}`,
                    }}>
                      {planStatus === 'draft' && (
                        <button
                          onClick={() => { setSegments(prev => prev.filter(s => s.id !== seg.id)); setDraftSaved(false) }}
                          style={{
                            width: 24, height: 24, position: 'relative',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, flexShrink: 0,
                          }}
                        >
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ position: 'absolute', left: 1, top: 1 }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.04351 2.04351C0.476114 3.6109 0.353796 5.18347 0.109159 8.32861C0.0414809 9.1987 0 10.0993 0 11C0 11.9007 0.0414808 12.8013 0.109159 13.6714C0.353796 16.8165 0.476114 18.3891 2.04351 19.9565C3.6109 21.5239 5.18347 21.6462 8.32861 21.8908C9.1987 21.9585 10.0994 22 11 22C11.9007 22 12.8013 21.9585 13.6714 21.8908C16.8165 21.6462 18.3891 21.5239 19.9565 19.9565C21.5239 18.3891 21.6462 16.8165 21.8908 13.6714C21.9585 12.8013 22 11.9007 22 11C22 10.0993 21.9585 9.1987 21.8908 8.32861C21.6462 5.18347 21.5239 3.6109 19.9565 2.04351C18.3891 0.476114 16.8165 0.353796 13.6714 0.109158C12.8013 0.0414806 11.9007 0 11 0C10.0994 0 9.1987 0.0414806 8.32861 0.109158C5.18347 0.353796 3.6109 0.476115 2.04351 2.04351Z" fill="#F95721"/>
                          </svg>
                          <div style={{ width: 10, height: 2, left: 7, top: 11, position: 'absolute', background: '#fff', borderRadius: 1 }} />
                        </button>
                      )}
                      <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ color: COLORS.text, fontSize: 17, fontFamily: "'MTSCompact',sans-serif", fontWeight: 400, lineHeight: '24px', wordWrap: 'break-word' }}>
                          {fmtDate(seg.startDate)} – {fmtDate(seg.endDate)}
                        </div>
                        <div style={{ color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact',sans-serif", fontWeight: 400, lineHeight: '20px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {pluralDays(seg.days)}
                          {rInfo.pending && (
                            <span style={{ color: '#FFBB00' }}>перенос на согласовании</span>
                          )}
                        </div>
                        {rInfo.pending && (
                          <div style={{ fontSize: 12, color: COLORS.secondary, marginTop: 2 }}>
                            Новые даты: {fmtDate(rInfo.pending.startDate)} — {fmtDate(rInfo.pending.endDate)}
                          </div>
                        )}
                      </div>
                      {planStatus === 'approved' && (
                        <button
                          onClick={() => canReschedule && setRescheduleSegId(seg.id)}
                          disabled={!canReschedule}
                          title={rescheduleTitle}
                          style={{
                            ...BTN_STYLE,
                            height: 32, padding: '0 12px',
                            background: canReschedule ? COLORS.blue : COLORS.bg,
                            color: canReschedule ? '#fff' : COLORS.hint,
                            border: 'none', borderRadius: 12,
                            cursor: canReschedule ? 'pointer' : 'not-allowed',
                            fontSize: 11, flexShrink: 0,
                          }}
                        >
                          Перенести
                        </button>
                      )}
                    </div>
                  )
                })
            }
          </div>

          {/* Draft actions */}
          {planStatus === 'draft' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <button onClick={() => setShowAddDialog(true)} style={BTN({ background: COLORS.bg, color: COLORS.text })}>
                Добавить период
              </button>
              <button
                onClick={() => canSubmit && setShowSubmitDialog(true)}
                disabled={!canSubmit}
                title={!canSubmit ? submitBlockers.join(' · ') : undefined}
                style={BTN({
                  background: canSubmit ? COLORS.blue : COLORS.bg,
                  color: canSubmit ? '#fff' : COLORS.hint,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                })}
              >
                Отправить на согласование
              </button>
            </div>
          )}

          {planStatus === 'approved' && (
            <div style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>
              Перенос возможен за 10 и более дней до начала — не более 2 переносов на отрезок
            </div>
          )}
        </div>

        {/* ── Right: Colleagues Plans (8/12 cols) ── */}
        <div style={{ gridColumn: 'span 8', minWidth: 0 }}>
          <ColleaguesPlanPanel
            planStatus={planStatus}
            userSegments={planStatus === 'approved' ? approvedSegments : segments}
          />
        </div>
      </div>

      {/* ── Demo switcher ── */}
      <div style={{
        marginTop: 48, display: 'flex', alignItems: 'center', gap: 8,
        padding: '16px 24px', background: COLORS.bg, borderRadius: 16, width: 'fit-content',
      }}>
        <span style={{ fontSize: 12, color: COLORS.hint, fontFamily: "'MTSCompact',sans-serif", marginRight: 4 }}>
          демо:
        </span>
        {PLAN_LABELS.map(opt => (
          <Chip key={opt.value} active={planStatus === opt.value} onClick={() => setPlanStatus(opt.value)}>
            {opt.label}
          </Chip>
        ))}
      </div>

      {/* ── Add period dialog ── */}
      {showAddDialog && (
        <Overlay onClose={() => { setShowAddDialog(false); setAddError('') }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <CalendarRange onApply={handleAddApply} />
            {addError && (
              <div style={{
                padding: '10px 20px', background: '#FFF3F0', borderRadius: 12,
                color: '#F95721', fontSize: 14, fontFamily: "'MTSCompact',sans-serif",
              }}>
                {addError}
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* ── Submit plan dialog ── */}
      {showSubmitDialog && (
        <Overlay onClose={() => setShowSubmitDialog(false)}>
          <div style={{
            background: '#fff', borderRadius: 32, padding: 32, width: 440,
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide',sans-serif" }}>
              Отправить на согласование
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: "'MTSCompact',sans-serif" }}>
                Отрезки отпуска ({segments.length})
              </div>
              {segments.map((seg, i) => (
                <div key={seg.id} style={{ fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif", paddingBottom: 6 }}>
                  <span style={{ color: COLORS.secondary }}>{i + 1}.{' '}</span>
                  {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                  <span style={{ color: COLORS.secondary }}> ({pluralDays(seg.days)})</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', background: COLORS.bg, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif" }}>
                {DEFAULT_APPROVER.name}
              </div>
              <div style={{ fontSize: 13, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>
                {DEFAULT_APPROVER.role}
              </div>
            </div>
            <SelectField
              label="Дополнительный согласующий"
              value={extraApprover}
              onChange={setExtraApprover}
              options={EXTRA_APPROVER_OPTIONS}
              placeholder="Не назначать"
              searchable
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSubmitDialog(false)}
                style={BTN({ flex: 1, background: COLORS.bg, color: COLORS.text })}
              >
                Отмена
              </button>
              <button
                onClick={() => { setPlanStatus('pending'); setShowSubmitDialog(false) }}
                style={BTN({ flex: 2, background: COLORS.blue, color: '#fff' })}
              >
                Отправить
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Reschedule dialog ── */}
      {rescheduleSegId && rescheduleSegment && (
        <Overlay onClose={() => { setRescheduleSegId(null); setRescheduleError('') }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <CalendarRange
              initialStart={new Date(rescheduleSegment.startDate + 'T00:00:00')}
              initialEnd={new Date(rescheduleSegment.endDate + 'T00:00:00')}
              onApply={handleRescheduleApply}
            />
            {rescheduleError && (
              <div style={{
                padding: '10px 20px', background: '#FFF3F0', borderRadius: 12,
                color: '#F95721', fontSize: 14, fontFamily: "'MTSCompact',sans-serif",
              }}>
                {rescheduleError}
              </div>
            )}
          </div>
        </Overlay>
      )}
    </div>
  )
}
