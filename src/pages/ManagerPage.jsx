import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CAMPAIGN } from '../data/mockData'
import { COLORS, BTN_STYLE } from '../ds/index'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const YEAR_OPTIONS = [
  { id: CAMPAIGN.year - 1, name: String(CAMPAIGN.year - 1) },
  { id: CAMPAIGN.year,     name: String(CAMPAIGN.year) },
]

const SEG_BAR = {
  pending_clean:   '#C7E1FF',
  pending_overlap: '#FAE89E',
  approved:        '#BEF4BD',
  reviewing:       '#E3CCFF',
  draft:           '#F2F3F7',
  rejected:        '#FCD4C9',
}

const STATUS_STYLE = {
  pending:   { bg: '#C7E1FF', color: '#005CBD', label: 'На согласовании' },
  approved:  { bg: '#BEF4BD', color: '#007502', label: 'Согласовано' },
  rejected:  { bg: '#FCD4C9', color: '#AD3400', label: 'Отклонено' },
  reviewing: { bg: '#E3CCFF', color: '#7936C9', label: 'Ознакомление' },
  draft:     { bg: '#F2F3F7', color: '#626C77', label: 'Черновик' },
}

const PAGE_SIZE = 10
const PERSON_COL_W = 256

const FIGMA_REQUESTS = [
  { id: 'r1',  reqNum: '123456', name: 'Константинопольский Константин', position: 'Старший разработчик',      team: 'Центр компетенций портальных решений', startDate: '2027-03-13', endDate: '2027-03-20', days: 8,  status: 'approved'  },
  { id: 'r2',  reqNum: '123456', name: 'Константинопольский Константин', position: 'Старший разработчик',      team: 'Центр компетенций портальных решений', startDate: '2027-05-01', endDate: '2027-05-10', days: 10, status: 'pending'   },
  { id: 'r3',  reqNum: '123456', name: 'Константинопольский Константин', position: 'Старший разработчик',      team: 'Центр компетенций портальных решений', startDate: '2027-08-15', endDate: '2027-08-20', days: 6,  status: 'pending'   },
  { id: 'r4',  reqNum: '123456', name: 'Константинопольский Константин', position: 'Старший разработчик',      team: 'Центр компетенций портальных решений', startDate: '2027-12-01', endDate: '2027-12-05', days: 5,  status: 'pending'   },
  { id: 'r5',  reqNum: '234567', name: 'Анастасия Смирнова',             position: 'Младший дизайнер',         team: 'Отдел графического дизайна',           startDate: '2027-12-10', endDate: '2027-12-15', days: 6,  status: 'rejected'  },
  { id: 'r6',  reqNum: '345678', name: 'Игорь Петров',                   position: 'Технический писатель',     team: 'Группа документации',                  startDate: '2027-12-20', endDate: '2027-12-25', days: 6,  status: 'approved'  },
  { id: 'r7',  reqNum: '456789', name: 'Елена Григорьева',               position: 'Аналитик данных',          team: 'Отдел аналитики',                      startDate: '2028-01-02', endDate: '2028-01-07', days: 6,  status: 'approved'  },
  { id: 'r8',  reqNum: '567890', name: 'Сергей Ковалев',                 position: 'Front-end разработчик',    team: 'Команда веб-разработки',               startDate: '2028-01-15', endDate: '2028-01-20', days: 6,  status: 'pending'   },
  { id: 'r9',  reqNum: '678901', name: 'Мария Федорова',                 position: 'UX/UI дизайнер',           team: 'Отдел пользовательского опыта',        startDate: '2028-01-28', endDate: '2028-02-02', days: 6,  status: 'reviewing' },
  { id: 'r10', reqNum: '789012', name: 'Дмитрий Соловьев',               position: 'Системный администратор',  team: 'IT поддержка',                         startDate: '2028-02-07', endDate: '2028-02-12', days: 6,  status: 'reviewing' },
]

function fmtDateShort(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function fmtPeriod(startDate, endDate) {
  return `${fmtDateShort(startDate)} – ${fmtDateShort(endDate)}`
}

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }

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

function shortName(fullName) {
  const p = fullName.trim().split(' ')
  if (p.length < 2) return fullName
  return `${p[1]} ${p[0][0]}.`
}

function pluralDays(n) {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} дней`
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
      background: s.bg, color: s.color, borderRadius: 8,
      fontSize: 14, fontWeight: 500, lineHeight: '20px',
      whiteSpace: 'nowrap', fontFamily: "'MTSCompact', sans-serif",
    }}>
      {s.label}
    </span>
  )
}

function Overlay({ onClose, children }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function ActionsMenu({ rowId, status, open, onToggle, onApprove, onReject }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onToggle(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onToggle])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={e => { e.stopPropagation(); onToggle(open ? null : rowId) }}
        style={{
          border: 'none', background: '#F2F3F7', cursor: 'pointer',
          padding: 4, borderRadius: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" fill="none">
          <path d="M0.0180118 1.53841C0.0612773 0.957075 0.08291 0.666409 0.37466 0.37466C0.666409 0.08291 0.957075 0.0612773 1.53841 0.0180118C1.6891 0.00679629 1.84455 0 2 0C2.15545 0 2.3109 0.00679629 2.46159 0.0180118C3.04293 0.0612773 3.33359 0.08291 3.62534 0.37466C3.91709 0.666409 3.93872 0.957075 3.98199 1.53841C3.9932 1.6891 4 1.84455 4 2C4 2.15545 3.9932 2.3109 3.98199 2.46159C3.93872 3.04293 3.91709 3.33359 3.62534 3.62534C3.33359 3.91709 3.04293 3.93872 2.46159 3.98199C2.3109 3.9932 2.15545 4 1.53841 3.98199C0.957075 3.93872 0.666409 3.91709 0.37466 3.62534C0.08291 3.33359 0.0612773 3.04293 0.0180118 2.46159C0.00679629 2.3109 0 2.15545 0 2C0 1.84455 0.00679629 1.6891 0.0180118 1.53841Z" fill="#1D2023"/>
          <path d="M7.01801 1.53841C7.06128 0.957075 7.08291 0.666409 7.37466 0.37466C7.66641 0.08291 7.95707 0.0612773 8.53841 0.0180118C8.6891 0.00679629 8.84455 0 9 0C9.15545 0 9.3109 0.00679629 9.46159 0.0180118C10.0429 0.0612773 10.3336 0.08291 10.6253 0.37466C10.9171 0.666409 10.9387 0.957075 10.982 1.53841C10.9932 1.6891 11 1.84455 11 2C11 2.15545 10.9932 2.3109 10.982 2.46159C10.9387 3.04293 10.9171 3.33359 10.6253 3.62534C10.3336 3.91709 10.0429 3.93872 9.46159 3.98199C9.3109 3.9932 9.15545 4 9 4C8.84455 4 8.6891 3.9932 8.53841 3.98199C7.95707 3.93872 7.66641 3.91709 7.37466 3.62534C7.08291 3.33359 7.06128 3.04293 7.01801 2.46159C7.0068 2.3109 7 2.15545 7 2C7 1.84455 7.0068 1.6891 7.01801 1.53841Z" fill="#1D2023"/>
          <path d="M14.3747 0.37466C14.0829 0.666409 14.0613 0.957075 14.018 1.53841C14.0068 1.6891 14 1.84455 14 2C14 2.15545 14.0068 2.3109 14.018 2.46159C14.0613 3.04293 14.0829 3.33359 14.3747 3.62534C14.6664 3.91709 14.9571 3.93872 15.5384 3.98199C15.6891 3.9932 15.8446 4 16 4C16.1554 4 16.3109 3.9932 16.4616 3.98199C17.0429 3.93872 17.3336 3.91709 17.6253 3.62534C17.9171 3.33359 17.9387 3.04293 17.982 2.46159C17.9932 2.3109 18 2.15545 18 2C18 1.84455 17.9932 1.6891 17.982 1.53841C17.9387 0.957075 17.9171 0.666409 17.6253 0.37466C17.3336 0.08291 17.0429 0.0612773 16.4616 0.0180118C16.3109 0.00679629 16.1554 0 16 0C15.8446 0 15.6891 0.00679629 15.5384 0.0180118C14.9571 0.0612773 14.6664 0.08291 14.3747 0.37466Z" fill="#1D2023"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, bottom: 'calc(100% + 4px)',
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: `1px solid ${COLORS.stroke}`,
          overflow: 'hidden', zIndex: 200, minWidth: 160,
        }}>
          {status === 'pending' ? (
            <>
              <div
                onClick={e => { e.stopPropagation(); onApprove() }}
                style={{ padding: '12px 16px', fontSize: 14, color: '#007502', cursor: 'pointer', fontFamily: "'MTSCompact',sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >Согласовать</div>
              <div
                onClick={e => { e.stopPropagation(); onReject() }}
                style={{ padding: '12px 16px', fontSize: 14, color: '#AD3400', cursor: 'pointer', fontFamily: "'MTSCompact',sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >Отклонить</div>
            </>
          ) : (
            <div style={{ padding: '12px 16px', fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>
              Нет доступных действий
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Pagination({ page, total, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  const items = []
  let prev = null
  for (const p of visible) {
    if (prev !== null && p - prev > 1) items.push(`dots${prev}`)
    items.push(p)
    prev = p
  }

  const btnBase = (active, disabled) => ({
    height: 44, minWidth: 44, borderRadius: 16, border: 'none',
    background: active ? '#F2F3F7' : 'transparent',
    color: disabled ? COLORS.hint : COLORS.text,
    fontSize: active ? 20 : 17,
    fontFamily: "'MTSCompact', sans-serif",
    fontWeight: active ? 500 : 400,
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 8px',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 4 }}>
      <button onClick={() => page > 1 && onPage(page - 1)} style={{ ...btnBase(false, page === 1), fontSize: 20 }}>‹</button>
      {items.map(item =>
        typeof item === 'string'
          ? <span key={item} style={{ color: COLORS.secondary, padding: '0 4px', fontSize: 17 }}>...</span>
          : <button key={item} onClick={() => onPage(item)} style={btnBase(item === page, false)}>{item}</button>
      )}
      <button onClick={() => page < totalPages && onPage(page + 1)} style={{ ...btnBase(false, page === totalPages), fontSize: 20 }}>›</button>
    </div>
  )
}

export default function ManagerPage() {
  const { subordinates, setSubordinates, campaign } = useApp()
  const [view, setView]           = useState('table')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [actionsOpen, setActionsOpen] = useState(null)
  const [statusOverrides, setStatusOverrides] = useState({})
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError, setRejectError]   = useState('')

  // Gantt state
  const [ganttYear, setGanttYear]   = useState(CAMPAIGN.year - 1)
  const [viewStart, setViewStart]   = useState(0)

  const visibleMonths = useMemo(() => Array.from({ length: 6 }, (_, i) => viewStart + i), [viewStart])
  const rangeStart    = useMemo(() => new Date(ganttYear, viewStart, 1), [ganttYear, viewStart])
  const rangeEnd      = useMemo(() => new Date(ganttYear, viewStart + 6, 0), [ganttYear, viewStart])
  const rangeDays     = useMemo(() => Math.round((rangeEnd - rangeStart) / 86400000) + 1, [rangeStart, rangeEnd])
  const totalMoDays   = useMemo(() => visibleMonths.reduce((s, m) => s + daysInMonth(ganttYear, m), 0), [ganttYear, visibleMonths])

  const allRequests = useMemo(() =>
    FIGMA_REQUESTS.map(r => ({ ...r, status: statusOverrides[r.id] ?? r.status }))
  , [statusOverrides])

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return allRequests
    const q = search.toLowerCase()
    return allRequests.filter(r =>
      r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q) || r.position.toLowerCase().includes(q)
    )
  }, [allRequests, search])

  const pagedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalCount    = allRequests.length
  const pendingCount  = allRequests.filter(r => r.status === 'pending').length
  const approvedCount = allRequests.filter(r => r.status === 'approved').length
  const reviewingCount = allRequests.filter(r => r.status === 'reviewing').length

  // Overlap detection for gantt
  const overlapSet = useMemo(() => {
    const pending = []
    for (const sub of subordinates) {
      if (sub.planStatus !== 'pending') continue
      for (const seg of (sub.segments ?? [])) {
        pending.push({ subId: sub.id, startDate: seg.startDate, endDate: seg.endDate })
      }
    }
    const overlapping = new Set()
    for (let i = 0; i < pending.length; i++) {
      for (let j = i + 1; j < pending.length; j++) {
        const a = pending[i], b = pending[j]
        if (a.subId === b.subId) continue
        const aS = new Date(a.startDate + 'T00:00:00'), aE = new Date(a.endDate + 'T00:00:00')
        const bS = new Date(b.startDate + 'T00:00:00'), bE = new Date(b.endDate + 'T00:00:00')
        if (aS <= bE && aE >= bS) {
          overlapping.add(`${a.subId}_${a.startDate}_${a.endDate}`)
          overlapping.add(`${b.subId}_${b.startDate}_${b.endDate}`)
        }
      }
    }
    return overlapping
  }, [subordinates])

  const ganttPeople = useMemo(() => {
    const q = search.toLowerCase()
    return subordinates
      .filter(sub => !q || sub.name.toLowerCase().includes(q) || (sub.team ?? '').toLowerCase().includes(q))
      .map(sub => {
        const segs = (sub.segments ?? []).filter(seg => parseInt(seg.startDate.split('-')[0]) === ganttYear)
        return { ...sub, segs }
      })
  }, [subordinates, search, ganttYear])

  function handleApprove(rowId) {
    setStatusOverrides(prev => ({ ...prev, [rowId]: 'approved' }))
    setActionsOpen(null)
  }

  function openReject(req) {
    setRejectTarget(req)
    setRejectComment('')
    setRejectError('')
    setActionsOpen(null)
  }

  function confirmReject() {
    if (!rejectComment.trim()) { setRejectError('Укажите причину отклонения'); return }
    setStatusOverrides(prev => ({ ...prev, [rejectTarget.id]: 'rejected' }))
    setRejectTarget(null)
  }

  function downloadReport() {
    const rows = allRequests.map(r => [r.name, r.team, r.position, fmtPeriod(r.startDate, r.endDate), STATUS_STYLE[r.status]?.label ?? r.status])
    const csv = [['Сотрудник', 'Подразделение', 'Должность', 'Период', 'Статус'], ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `team-report-${campaign.year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const TH_BASE = {
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 400,
    color: COLORS.secondary,
    textAlign: 'left',
    fontFamily: "'MTS Sans', sans-serif",
    background: COLORS.bg,
    borderBottom: `1px solid ${COLORS.stroke}`,
    whiteSpace: 'nowrap',
  }

  const TD_BASE = {
    padding: '16px',
    fontSize: 14,
    color: COLORS.text,
    fontFamily: "'MTSCompact', sans-serif",
    verticalAlign: 'middle',
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48, fontFamily: "'MTSCompact', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '32px' }}>
          Статистика по кампании {campaign.year}
        </h2>
        <button
          onClick={downloadReport}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: 10, borderRadius: 16, border: 'none',
            background: '#F2F3F7', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13H14" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 12, fontFamily: "'MTSWide', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.60, color: '#1D2023', lineHeight: '16px' }}>
            Скачать отчёт
          </span>
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Подано заявок',    value: totalCount },
          { label: 'На согласовании',  value: pendingCount },
          { label: 'Согласованы',      value: approvedCount },
          { label: 'На ознакомлении',  value: reviewingCount },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 32,
            padding: '24px 32px',
            outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
          }}>
            <div style={{ fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, color: COLORS.secondary, lineHeight: '24px', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 24, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, color: COLORS.text, lineHeight: '32px' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
        Входящие заявки
      </h2>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {[{ key: 'table', label: 'Таблица' }, { key: 'chart', label: 'График' }].map(opt => (
            <button key={opt.key} onClick={() => setView(opt.key)} style={{
              padding: 12, border: 'none', cursor: 'pointer',
              borderRadius: 16,
              fontSize: 15, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500,
              lineHeight: '22px',
              background: view === opt.key ? '#1D2023' : '#F2F3F7',
              color: view === opt.key ? '#FAFAFA' : '#1D2023',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div style={{
          flex: 1, height: 44, background: COLORS.bg, borderRadius: 16,
          outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#626C77" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="#626C77" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Поиск по сотрудникам"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact', sans-serif" }}
          />
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col style={{ width: 320 }} />
                <col />
                <col style={{ width: 200 }} />
                <col style={{ width: 157 }} />
                <col style={{ width: 94 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={TH_BASE}>№ заявки</th>
                  <th style={{ ...TH_BASE, boxShadow: '-1px 0px 0px #E2E5EB inset' }}>Сотрудник</th>
                  <th style={{ ...TH_BASE, boxShadow: '-1px 0px 0px #E2E5EB inset' }}>Подразделение</th>
                  <th style={{ ...TH_BASE, boxShadow: '-1px 0px 0px #E2E5EB inset' }}>Период отпуска</th>
                  <th style={{ ...TH_BASE, boxShadow: '-1px 0px 0px #E2E5EB inset' }}>Статус</th>
                  <th style={{ ...TH_BASE, boxShadow: '-1px 0px 0px #E2E5EB inset', textAlign: 'center' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {pagedRequests.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...TD_BASE, textAlign: 'center', color: COLORS.secondary, padding: 32 }}>Нет заявок</td></tr>
                ) : pagedRequests.map((req, i) => {
                  const isLast = i === pagedRequests.length - 1
                  const rowBorder = isLast ? 'none' : `1px solid ${COLORS.stroke}`
                  return (
                    <tr key={req.id}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...TD_BASE, borderBottom: rowBorder, color: COLORS.secondary }}>
                        {req.reqNum}
                      </td>
                      <td style={{ ...TD_BASE, borderBottom: rowBorder }}>
                        <div style={{ fontSize: 14, color: COLORS.text, lineHeight: '20px' }}>{req.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.secondary, lineHeight: '16px', marginTop: 2 }}>{req.position}</div>
                      </td>
                      <td style={{ ...TD_BASE, borderBottom: rowBorder, color: COLORS.text }}>{req.team}</td>
                      <td style={{ ...TD_BASE, borderBottom: rowBorder }}>
                        <div style={{ fontSize: 14, color: COLORS.text, lineHeight: '20px' }}>{fmtPeriod(req.startDate, req.endDate)}</div>
                        <div style={{ fontSize: 12, color: COLORS.secondary, lineHeight: '16px', marginTop: 2 }}>{pluralDays(req.days)}</div>
                      </td>
                      <td style={{ ...TD_BASE, borderBottom: rowBorder }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ ...TD_BASE, borderBottom: rowBorder, textAlign: 'center' }}>
                        <ActionsMenu
                          rowId={req.id}
                          status={req.status}
                          open={actionsOpen === req.id}
                          onToggle={setActionsOpen}
                          onApprove={() => handleApprove(req.id)}
                          onReject={() => openReject(req)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={filteredRequests.length} onPage={setPage} />
        </>
      )}

      {/* ── CHART (GANTT) VIEW ── */}
      {view === 'chart' && (
        <div style={{
          background: '#fff', borderRadius: 24, padding: 24,
          outline: `1px ${COLORS.stroke} solid`, outlineOffset: '-1px',
        }}>
          {/* Gantt controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: COLORS.bg, borderRadius: 16, padding: 4, gap: 2, flexShrink: 0 }}>
              {YEAR_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => { setGanttYear(opt.id); setViewStart(0) }} style={{
                  padding: '6px 16px', border: 'none', cursor: 'pointer', borderRadius: 12,
                  fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500,
                  background: ganttYear === opt.id ? '#1D2023' : 'transparent',
                  color: ganttYear === opt.id ? '#FAFAFA' : COLORS.text,
                }}>
                  {opt.name}
                </button>
              ))}
            </div>
            {[{ dir: -1, path: 'M7 1L1 7L7 13' }, { dir: 1, path: 'M1 1L7 7L1 13' }].map(({ dir, path }) => {
              const next = viewStart + dir
              const disabled = next < 0 || next > 6
              return (
                <button key={dir} onClick={() => !disabled && setViewStart(next)} style={{
                  width: 40, height: 40, background: COLORS.bg, border: 'none', borderRadius: 12,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: disabled ? 0.3 : 1, flexShrink: 0,
                }}>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d={path} stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { color: SEG_BAR.pending_clean,   label: 'на согласовании, нет пересечений' },
              { color: SEG_BAR.pending_overlap,  label: 'на согласовании, есть пересечения' },
              { color: SEG_BAR.approved,         label: 'согласован' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact',sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Month header */}
          <div style={{ display: 'flex', height: 40 }}>
            <div style={{
              width: PERSON_COL_W, flexShrink: 0, paddingLeft: 16,
              background: COLORS.bg, boxShadow: '-1px 0 0 #E2E5EB inset',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{ color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact',sans-serif" }}>Сотрудник</span>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              {visibleMonths.map(m => (
                <div key={m} style={{
                  width: `${(daysInMonth(ganttYear, m) / totalMoDays) * 100}%`,
                  background: COLORS.bg, boxShadow: '-1px 0 0 #E2E5EB inset',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact',sans-serif",
                }}>
                  {MONTH_NAMES[m]}
                </div>
              ))}
            </div>
          </div>

          {/* Employee rows */}
          {ganttPeople.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: COLORS.secondary, fontSize: 14 }}>Нет сотрудников</div>
          ) : ganttPeople.map((sub, idx) => (
            <div key={sub.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: PERSON_COL_W, flexShrink: 0,
                  paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                  boxShadow: '-1px 0 0 #E2E5EB inset',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: COLORS.bg, position: 'relative' }}>
                    {sub.avatar
                      ? <img src={sub.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: COLORS.secondary }}>
                          {sub.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                        </div>
                    }
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1px rgba(188,195,208,0.50) solid', pointerEvents: 'none' }} />
                  </div>
                  <span style={{ fontSize: 14, color: COLORS.text, fontFamily: "'MTSCompact',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shortName(sub.name)}
                  </span>
                </div>
                <div style={{ flex: 1, position: 'relative', height: 68 }}>
                  {sub.segs.map((seg, bi) => {
                    const bp = getBarProps(seg.startDate, seg.endDate, rangeStart, rangeEnd, rangeDays)
                    if (!bp) return null
                    const key = `${sub.id}_${seg.startDate}_${seg.endDate}`
                    const isOverlap = overlapSet.has(key)
                    const barColor = sub.planStatus === 'approved'
                      ? SEG_BAR.approved
                      : sub.planStatus === 'pending'
                        ? (isOverlap ? SEG_BAR.pending_overlap : SEG_BAR.pending_clean)
                        : (SEG_BAR[sub.planStatus] ?? SEG_BAR.draft)
                    return (
                      <div key={bi} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        background: barColor, borderRadius: 0, ...bp,
                      }} />
                    )
                  })}
                </div>
              </div>
              {idx < ganttPeople.length - 1 && (
                <div style={{ height: 1, background: 'rgba(188,195,208,0.50)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <Overlay onClose={() => setRejectTarget(null)}>
          <div style={{
            background: '#fff', borderRadius: 32, padding: 32, width: 440,
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14)',
            display: 'flex', flexDirection: 'column', gap: 20,
            fontFamily: "'MTSCompact', sans-serif",
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide',sans-serif", lineHeight: '28px' }}>
                  Отклонить заявку
                </div>
                <div style={{ fontSize: 14, color: COLORS.secondary, marginTop: 4 }}>
                  {rejectTarget.name} · {fmtPeriod(rejectTarget.startDate, rejectTarget.endDate)}
                </div>
              </div>
              <button onClick={() => setRejectTarget(null)} style={{ width: 32, height: 32, background: COLORS.bg, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 14, color: COLORS.secondary }}>
                Причина отклонения <span style={{ color: '#E30611' }}>*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={e => { setRejectComment(e.target.value); setRejectError('') }}
                placeholder="Введите комментарий"
                style={{
                  width: '100%', height: 96, boxSizing: 'border-box',
                  background: COLORS.bg, border: 'none',
                  outline: `1px ${rejectError ? '#E30611' : 'rgba(188,195,208,0.50)'} solid`,
                  outlineOffset: '-1px', borderRadius: 16,
                  padding: '10px 12px', fontSize: 15, lineHeight: '22px',
                  color: COLORS.text, fontFamily: "'MTSCompact', sans-serif", resize: 'none',
                }}
              />
              {rejectError && <span style={{ fontSize: 12, color: '#E30611' }}>{rejectError}</span>}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setRejectTarget(null)} style={{ ...BTN_STYLE, flex: 1, height: 44, background: COLORS.bg, color: COLORS.text, border: 'none', borderRadius: 16, cursor: 'pointer' }}>
                Отмена
              </button>
              <button onClick={confirmReject} style={{ ...BTN_STYLE, flex: 2, height: 44, background: '#F95721', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer' }}>
                Отклонить
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
