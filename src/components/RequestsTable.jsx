import { useState, useMemo, useEffect, useRef } from 'react'
import { Chip, StatusBadge, SearchIcon, MoreIcon, ChevronUp } from '../ds/index'
import { useApp } from '../context/AppContext'
import { t, pluralDays, MONTHS_TABLE } from '../i18n/translate'

const PAGE_SIZE = 10
const FONT = "'MTSCompact', sans-serif"
const STROKE = '1px solid rgba(188,195,208,0.5)'
const ROW_DIVIDER = '1px solid #E2E5EB'

const FILTERS = [
  { key: 'all',      label: 'Все',             statuses: null },
  { key: 'pending',  label: 'На согласовании', statuses: ['pending', 'rescheduling', 'reviewing'] },
  { key: 'approved', label: 'Согласованы',     statuses: ['approved'] },
  { key: 'rejected', label: 'Отклонены',       statuses: ['rejected'] },
]

const COLUMNS = [
  { key: 'id',     label: '№ заявки',          width: 140 },
  { key: 'type',   label: 'Вид отпуска',       width: 340 },
  { key: 'period', label: 'Период',            width: 270 },
  { key: 'days',   label: 'Всего дней',        width: 130 },
  { key: 'resch',  label: 'Осталось переносов', width: 180 },
  { key: 'status', label: 'Статус' },
  { key: 'menu',   label: '',                  width: 56 },
]

const TH = {
  padding: '10px 16px', fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#626C77',
  textAlign: 'left', fontFamily: FONT, background: '#F2F3F7', whiteSpace: 'nowrap',
}
const TD = {
  padding: '10px 16px', fontSize: 17, lineHeight: '24px', color: '#1D2023',
  fontFamily: FONT, verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
}

function formatTableDate(d) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_TABLE[d.getMonth()]} ${d.getFullYear()}`
}

function canReschedule(r) {
  if (r.type !== 'planned' || r.status !== 'approved') return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((r.startDate - today) / 86400000)
  return daysLeft > 10 && (r.rescheduleLimit ?? 2) - (r.rescheduleCount ?? 0) > 0
}

function RowMenu({ request, onDetails, onReschedule }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const items = [
    ...(canReschedule(request) ? [{ label: t('Перенести'), onClick: () => onReschedule(request) }] : []),
    { label: t('Подробнее'), onClick: () => onDetails(request) },
  ]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        style={{ border: 'none', padding: 4, borderRadius: 8, cursor: 'pointer', background: open ? '#F2F3F7' : 'transparent', display: 'inline-flex' }}
      >
        <MoreIcon />
      </button>
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 200,
            padding: 6, background: '#fff', borderRadius: 16,
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', minWidth: 140,
          }}
        >
          {items.map(item => (
            <div
              key={item.label}
              onClick={() => { setOpen(false); item.onClick() }}
              style={{ padding: '10px 6px', borderRadius: 12, cursor: 'pointer', color: '#1D2023', fontSize: 17, fontFamily: FONT, lineHeight: '24px', whiteSpace: 'nowrap', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              {item.label}
            </div>
          ))}
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
    if (prev !== null && p - prev > 1) items.push('dots' + prev)
    items.push(p)
    prev = p
  }

  const arrow = (dir, disabled) => (
    <button
      onClick={() => !disabled && onPage(page + dir)}
      disabled={disabled}
      style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: disabled ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}
    >
      <span style={{ display: 'flex', transform: `rotate(${dir < 0 ? -90 : 90}deg)` }}><ChevronUp /></span>
    </button>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 24 }}>
      {arrow(-1, page === 1)}
      {items.map(item =>
        typeof item === 'string'
          ? <span key={item} style={{ color: '#626C77', fontSize: 17, fontFamily: FONT }}>…</span>
          : (
            <button
              key={item}
              onClick={() => onPage(item)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px', borderRadius: 12, border: 'none',
                background: item === page ? '#F2F3F7' : 'transparent',
                color: '#1D2023', fontSize: 17, lineHeight: '24px', fontFamily: FONT,
                fontWeight: item === page ? 500 : 400, cursor: 'pointer',
              }}
            >
              {item}
            </button>
          )
      )}
      {arrow(1, page === totalPages)}
    </div>
  )
}

export default function RequestsTable({ onSelectRequest, onReschedule }) {
  const { requests, segments, planStatus } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  // Submitted vacation plan segments are listed as requests too
  const planningRequests = useMemo(() => {
    if (!segments?.length || !planStatus || planStatus === 'draft' || planStatus === 'approved') return []
    return segments.map(seg => ({
      id: seg.id,
      type: 'planned',
      typeLabel: 'Ежегодный основной оплачиваемый',
      planCategory: 'Плановый',
      startDate: new Date(seg.startDate + 'T00:00:00'),
      endDate: new Date(seg.endDate + 'T00:00:00'),
      days: seg.days,
      status: planStatus,
      isPlanned: true,
      approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
      rescheduleCount: 0,
      rescheduleLimit: 2,
    }))
  }, [segments, planStatus])

  const statuses = FILTERS.find(f => f.key === filter).statuses
  const q = query.trim()
  const filtered = [...planningRequests, ...requests]
    .filter(r => !statuses || statuses.includes(r.status))
    .filter(r => !q || String(r.id).includes(q))
    .sort((a, b) => a.startDate - b.startDate)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTERS.map(f => (
          <Chip key={f.key} active={filter === f.key} onClick={() => { setFilter(f.key); setPage(1) }}>
            <span style={{ fontSize: 17, lineHeight: '20px' }}>{t(f.label)}</span>
          </Chip>
        ))}
        <div style={{
          width: 306, height: 44, boxSizing: 'border-box',
          background: '#F2F3F7', borderRadius: 16, border: STROKE,
          display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px 0 12px',
        }}>
          <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder={t('№ заявки')}
            inputMode="numeric"
            className="mts-search-input"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 17, lineHeight: '24px', color: '#1D2023', fontFamily: FONT }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ border: STROKE, borderRadius: 16, overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
          <colgroup>
            {COLUMNS.map(c => <col key={c.key} style={c.width ? { width: c.width } : undefined} />)}
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th
                  key={c.key}
                  style={{
                    ...TH,
                    ...(i === 0 ? { borderTopLeftRadius: 16 } : null),
                    ...(i === COLUMNS.length - 1 ? { borderTopRightRadius: 16 } : null),
                  }}
                >
                  {c.label && t(c.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ ...TD, textAlign: 'center', color: '#626C77', padding: '32px 16px' }}>
                  {t('Заявок не найдено')}
                </td>
              </tr>
            ) : paged.map((r, i) => {
              const cell = { ...TD, borderBottom: i === paged.length - 1 ? 'none' : ROW_DIVIDER }
              const left = r.type === 'planned' ? (r.rescheduleLimit ?? 2) - (r.rescheduleCount ?? 0) : null
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRequest(r)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8F8FA' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}
                >
                  <td style={cell}>{r.id}</td>
                  <td style={cell}>{t(r.typeLabel)}</td>
                  <td style={cell}>{formatTableDate(r.startDate)} – {formatTableDate(r.endDate)}</td>
                  <td style={cell}>{r.days} {pluralDays(r.days)}</td>
                  <td style={cell}>{left ?? '–'}</td>
                  <td style={{ ...cell, overflow: 'visible' }}><StatusBadge type={r.status} /></td>
                  <td style={{ ...cell, overflow: 'visible', textAlign: 'center', padding: '10px 8px' }}>
                    <RowMenu request={r} onDetails={onSelectRequest} onReschedule={onReschedule} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={filtered.length} onPage={setPage} />
    </div>
  )
}
