import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CAMPAIGN } from '../data/mockData'
import { BTN_STYLE, Chip, SearchIcon, SelectField } from '../ds/index'
import StatusBadge from '../components/StatusBadge'

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

const PAGE_SIZE   = 10
const PERSON_W    = 256
const ROW_H       = 64
const COL_SHADOW  = 'inset -1px 0 0 #E2E5EB'
const DIVIDER     = '1px solid #E2E5EB'

const BAR_STATUS_COLOR = {
  pending:   '#C7E1FF',
  approved:  '#BEF4BD',
  rejected:  '#FCD4C9',
  reviewing: '#E3CCFF',
  draft:     '#F2F3F7',
}
const BAR_OVERLAP_COLOR = '#FAE89E'

const STATUS_LABEL = {
  pending:   'на согласовании',
  approved:  'согласован',
  rejected:  'отклонён',
  reviewing: 'ознакомление',
  draft:     'черновик',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function diMonth(y, m)  { return new Date(y, m + 1, 0).getDate() }
function diYear(y)      { return new Date(y, 1, 29).getMonth() === 1 ? 366 : 365 }

function yearBarPos(startStr, endStr, year) {
  const total = diYear(year)
  const ys = new Date(year, 0, 1).getTime()
  const ye = new Date(year, 11, 31).getTime()
  const s  = new Date(startStr + 'T00:00:00').getTime()
  const e  = new Date(endStr   + 'T00:00:00').getTime()
  const cs = Math.max(s, ys), ce = Math.min(e, ye)
  if (cs > ye || ce < ys) return null
  const offset   = (cs - ys) / 86400000
  const duration = (ce - cs) / 86400000 + 1
  return { left: `${(offset / total) * 100}%`, width: `${(duration / total) * 100}%` }
}

function getMonthSepPcts(year) {
  const total = diYear(year)
  let acc = 0
  return Array.from({ length: 11 }, (_, m) => {
    acc += diMonth(year, m)
    return acc / total * 100
  })
}

function fmtDateShort(str) {
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}

function fmtPeriod(s, e) { return `${fmtDateShort(s)} – ${fmtDateShort(e)}` }

function fmtDateRu(str) {
  const d = new Date(str + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()} г.`
}

function fmtRangeRu(s, e) {
  const sd = new Date(s + 'T00:00:00'), ed = new Date(e + 'T00:00:00')
  if (sd.getFullYear() === ed.getFullYear()) {
    if (sd.getMonth() === ed.getMonth())
      return `${sd.getDate()} – ${ed.getDate()} ${MONTHS_SHORT[ed.getMonth()]} ${ed.getFullYear()} г.`
    return `${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]} – ${ed.getDate()} ${MONTHS_SHORT[ed.getMonth()]} ${ed.getFullYear()} г.`
  }
  return `${fmtDateRu(s)} – ${fmtDateRu(e)}`
}

function shortName(fullName) {
  const p = fullName.trim().split(' ')
  if (p.length < 2) return fullName
  // Фамилия И.О. — первое слово фамилия, остальные инициалы
  const initials = p.slice(1).map(w => w[0] + '.').join('')
  return `${p[0]} ${initials}`
}

function pluralDays(n) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} дней`
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}

function downloadCSV(requests) {
  const rows = requests.map(r => [r.name, r.team, r.position, fmtPeriod(r.startDate, r.endDate), STATUS_LABEL[r.status] ?? r.status])
  const csv = [['Сотрудник','Подразделение','Должность','Период','Статус'], ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `team-report-${CAMPAIGN.year}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function ManagerTooltip({ tooltip }) {
  if (!tooltip) return null
  const hasOverlap = tooltip.overlaps?.length > 0
  return (
    <div style={{
      position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 8,
      zIndex: 9999, background: '#1D2023', borderRadius: 12,
      padding: '10px 14px', pointerEvents: 'none', minWidth: 160, maxWidth: 280,
    }}>
      <div style={{ fontSize: 13, color: '#FAFAFA', fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, marginBottom: 4 }}>
        {fmtDateRu(tooltip.startDate)} — {fmtDateRu(tooltip.endDate)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: BAR_STATUS_COLOR[tooltip.status] ?? '#BCC3D0' }} />
        <span style={{ fontSize: 12, color: '#BCC3D0', fontFamily: "'MTSCompact', sans-serif" }}>
          {STATUS_LABEL[tooltip.status] ?? tooltip.status}
        </span>
      </div>
      {hasOverlap && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: BAR_OVERLAP_COLOR }} />
          <span style={{ fontSize: 12, color: '#BCC3D0', fontFamily: "'MTSCompact', sans-serif" }}>
            пересекается: {tooltip.overlaps.join(', ')}
          </span>
        </div>
      )}
      <div style={{ position: 'absolute', left: -6, top: 14, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #1D2023' }} />
    </div>
  )
}

// ── Year grid ─────────────────────────────────────────────────────────────────
function ManagerPersonCell({ person }) {
  const initials = person.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div style={{
      width: PERSON_W, flexShrink: 0, height: ROW_H,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 16px', boxShadow: COL_SHADOW, boxSizing: 'border-box',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: '#F2F3F7', overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {person.avatar
          ? <img src={person.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <span style={{ fontSize: 12, fontWeight: 600, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{initials}</span>
        }
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, border: '1px rgba(188,195,208,0.50) solid', pointerEvents: 'none' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontFamily: "'MTSCompact', sans-serif",
          color: '#1D2023', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {shortName(person.name)}
        </div>
        {person.position && (
          <div style={{
            fontSize: 12, fontFamily: "'MTSCompact', sans-serif",
            color: '#626C77', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2,
          }}>
            {person.position}
          </div>
        )}
      </div>
    </div>
  )
}

function ManagerYearGrid({ year, people, overlapIds, onBarClick, onBarEnter, onBarMove, onBarLeave }) {
  const total    = diYear(year)
  const sepPcts  = useMemo(() => getMonthSepPcts(year), [year])

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 860 }}>

        {/* Header */}
        <div style={{ display: 'flex', height: 40, background: '#F2F3F7' }}>
          <div style={{ width: PERSON_W, flexShrink: 0, padding: '0 16px', boxShadow: COL_SHADOW, display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>Сотрудник</span>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {Array.from({ length: 12 }, (_, m) => (
              <div key={m} style={{
                flex: diMonth(year, m), padding: '0 12px',
                boxShadow: m < 11 ? COL_SHADOW : 'none',
                display: 'flex', alignItems: 'center', overflow: 'hidden',
              }}>
                <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", whiteSpace: 'nowrap' }}>
                  {MONTH_NAMES[m]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {people.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>
            Нет заявок для отображения
          </div>
        ) : people.map((person, pi) => (
          <div key={person.name} style={{ display: 'flex', borderBottom: pi < people.length - 1 ? DIVIDER : 'none' }}>
            <ManagerPersonCell person={person} />
            <div style={{ flex: 1, position: 'relative', height: ROW_H }}>
              {sepPcts.map((pct, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: '#E2E5EB', pointerEvents: 'none' }} />
              ))}
              {person.requests.map(req => {
                const pos = yearBarPos(req.startDate, req.endDate, year)
                if (!pos) return null
                const isOverlap = overlapIds.has(req.id)
                const color = isOverlap && req.status !== 'approved' ? BAR_OVERLAP_COLOR : (BAR_STATUS_COLOR[req.status] ?? '#F2F3F7')
                return (
                  <div
                    key={req.id}
                    onClick={() => onBarClick?.(req)}
                    onMouseEnter={e => onBarEnter?.(e, req, isOverlap)}
                    onMouseMove={e => onBarMove?.(e)}
                    onMouseLeave={() => onBarLeave?.()}
                    style={{
                      position: 'absolute', top: 0, height: '100%',
                      ...pos, background: color, cursor: 'pointer',
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Request view modal (manager) ──────────────────────────────────────────────
function RequestViewModal({ request, onClose, onApprove, onOpenReject }) {
  if (!request) return null
  const canApprove = request.status === 'pending'

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 480, background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '24px', paddingTop: 4 }}>
              Заявка на плановый отпуск
            </div>
            <button
              onClick={onClose}
              style={{ padding: 4, background: '#F2F3F7', borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L11.9999 13.4143L16.2929 17.7073C16.6834 18.0978 17.3166 18.0978 17.7071 17.7073C18.0976 17.3167 18.0976 16.6836 17.7071 16.293L13.4141 12.0001L17.7071 7.70711C18.0976 7.31658 18.0976 6.68342 17.7071 6.29289C17.3166 5.90237 16.6834 5.90237 16.2929 6.29289L11.9999 10.5859L7.70711 6.29304C7.31658 5.90252 6.68342 5.90252 6.2929 6.29304C5.90237 6.68357 5.90237 7.31673 6.29289 7.70726L10.5857 12.0001L6.29289 16.2929Z" fill="#1D2023"/>
              </svg>
            </button>
          </div>
          <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
            № {request.reqNum}
          </div>
        </div>

        {/* Body */}
        <div className="modal-scroll" style={{ paddingLeft: 20, paddingRight: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 12 }}>
            <StatusBadge status={request.status} />
          </div>

          {/* Employee row */}
          <div style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: '#F2F3F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 600, color: '#626C77', fontFamily: "'MTSCompact', sans-serif",
            }}>
              {request.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('')}
            </div>
            <div style={{ flex: '1 1 0' }}>
              <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{request.name}</div>
              <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{request.position}</div>
            </div>
          </div>

          <InfoCell label="Подразделение" value={request.team} />
          <InfoCell label="Период" value={fmtRangeRu(request.startDate, request.endDate)} />
          <InfoCell label="Количество дней отпуска" value={pluralDays(request.days)} />

          {/* Actions */}
          {canApprove && (
            <div style={{ paddingTop: 12, paddingBottom: 20, display: 'flex', gap: 10 }}>
              <button
                onClick={() => { onApprove(request.id); onClose() }}
                style={{ flex: 1, height: 44, background: '#0066FF', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#FFFFFF' }}
              >
                СОГЛАСОВАТЬ
              </button>
              <button
                onClick={() => { onOpenReject(request); onClose() }}
                style={{ flex: 1, height: 44, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#D8400C' }}
              >
                ОТКЛОНИТЬ
              </button>
            </div>
          )}
          {!canApprove && <div style={{ paddingBottom: 20 }} />}
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value }) {
  if (!value) return null
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{label}</div>
      <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{value}</div>
    </div>
  )
}

// ── Reject reason modal ────────────────────────────────────────────────────────
function RejectModal({ request, onClose, onConfirm }) {
  const [comment, setComment] = useState('')
  const [error, setError]     = useState('')

  function confirm() {
    if (!comment.trim()) { setError('Укажите причину отклонения'); return }
    onConfirm(request.id, comment)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 32, padding: 32, width: 440, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'MTSCompact', sans-serif" }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
              Отклонить заявку
            </div>
            <div style={{ fontSize: 14, color: '#626C77', marginTop: 4 }}>
              {request.name} · {fmtPeriod(request.startDate, request.endDate)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F2F3F7', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L11.9999 13.4143L16.2929 17.7073C16.6834 18.0978 17.3166 18.0978 17.7071 17.7073C18.0976 17.3167 18.0976 16.6836 17.7071 16.293L13.4141 12.0001L17.7071 7.70711C18.0976 7.31658 18.0976 6.68342 17.7071 6.29289C17.3166 5.90237 16.6834 5.90237 16.2929 6.29289L11.9999 10.5859L7.70711 6.29304C7.31658 5.90252 6.68342 5.90252 6.2929 6.29304C5.90237 6.68357 5.90237 7.31673 6.29289 7.70726L10.5857 12.0001L6.29289 16.2929Z" fill="#1D2023"/>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 14, color: '#626C77' }}>
            Причина отклонения <span style={{ color: '#E30611' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={e => { setComment(e.target.value); setError('') }}
            placeholder="Введите комментарий"
            className="mts-textarea"
            style={{
              width: '100%', height: 96, boxSizing: 'border-box',
              background: '#F2F3F7', border: 'none',
              outline: `1px ${error ? '#E30611' : 'rgba(188,195,208,0.50)'} solid`,
              outlineOffset: '-1px', borderRadius: 16,
              padding: '10px 12px', fontSize: 15, lineHeight: '22px',
              color: '#1D2023', fontFamily: "'MTSCompact', sans-serif", resize: 'none',
            }}
          />
          {error && <span style={{ fontSize: 12, color: '#E30611' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ ...BTN_STYLE, flex: 1, height: 44, background: '#F2F3F7', color: '#1D2023', border: 'none', borderRadius: 16, cursor: 'pointer' }}>
            Отмена
          </button>
          <button onClick={confirm} style={{ ...BTN_STYLE, flex: 2, height: 44, background: '#F95721', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer' }}>
            Отклонить
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Actions dropdown ──────────────────────────────────────────────────────────
function ActionsDropdown({ request, onApprove, onReject }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  if (request.status !== 'pending') return null

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        style={{
          border: 'none', background: '#F2F3F7', cursor: 'pointer',
          padding: 4, borderRadius: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" fill="none">
          <circle cx="2" cy="2" r="2" fill="#1D2023"/>
          <circle cx="9" cy="2" r="2" fill="#1D2023"/>
          <circle cx="16" cy="2" r="2" fill="#1D2023"/>
        </svg>
      </button>
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            background: '#fff', borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            border: '1px solid #E8EDF2',
            overflow: 'hidden', zIndex: 200, minWidth: 160,
          }}
        >
          <div
            onClick={() => { onApprove(request.id); setOpen(false) }}
            style={{ padding: '14px 16px', fontSize: 17, lineHeight: '24px', color: '#007502', cursor: 'pointer', fontFamily: "'MTSCompact', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            Согласовать
          </div>
          <div
            onClick={() => { onReject(request); setOpen(false) }}
            style={{ padding: '14px 16px', fontSize: 17, lineHeight: '24px', color: '#AD3400', cursor: 'pointer', fontFamily: "'MTSCompact', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            Отклонить
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  const items = []; let prev = null
  for (const p of visible) {
    if (prev !== null && p - prev > 1) items.push(`dots${prev}`)
    items.push(p); prev = p
  }
  const btn = (active, disabled) => ({
    height: 44, minWidth: 44, borderRadius: 16, border: 'none',
    background: active ? '#F2F3F7' : 'transparent',
    color: disabled ? '#BCC3D0' : '#1D2023',
    fontSize: active ? 20 : 17, fontFamily: "'MTSCompact', sans-serif",
    fontWeight: active ? 500 : 400, cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px',
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 4 }}>
      <button onClick={() => page > 1 && onPage(page - 1)} style={{ ...btn(false, page === 1), fontSize: 20 }}>‹</button>
      {items.map(item =>
        typeof item === 'string'
          ? <span key={item} style={{ color: '#626C77', padding: '0 4px', fontSize: 17 }}>...</span>
          : <button key={item} onClick={() => onPage(item)} style={btn(item === page, false)}>{item}</button>
      )}
      <button onClick={() => page < totalPages && onPage(page + 1)} style={{ ...btn(false, page === totalPages), fontSize: 20 }}>›</button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManagerPage() {
  const { subordinates, campaign, incomingRequests, setIncomingRequests } = useApp()

  const [view,            setView]            = useState('table')
  const [search,          setSearch]          = useState('')
  const [deptFilter,      setDeptFilter]      = useState('all')
  const [page,            setPage]            = useState(1)
  const [gridYear,        setGridYear]        = useState(CAMPAIGN.year)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectTarget,    setRejectTarget]    = useState(null)
  const [tooltip,         setTooltip]         = useState(null)

  // Department options (dynamic from data)
  const deptOptions = useMemo(() => {
    const teams = [...new Set(incomingRequests.map(r => r.team))]
    return [
      { id: 'all', name: 'Все подразделения' },
      ...teams.map(t => ({ id: t, name: t })),
    ]
  }, [incomingRequests])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase().trim()
    return incomingRequests.filter(r => {
      const matchDept   = deptFilter === 'all' || r.team === deptFilter
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q) || r.position.toLowerCase().includes(q)
      return matchDept && matchSearch
    })
  }, [incomingRequests, search, deptFilter])

  // Stats from ALL requests (not filtered)
  const totalCount    = incomingRequests.length
  const pendingCount  = incomingRequests.filter(r => r.status === 'pending').length
  const approvedCount = incomingRequests.filter(r => r.status === 'approved').length
  const reviewingCount = incomingRequests.filter(r => r.status === 'reviewing').length

  // Table pagination
  const pagedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Grid: group filtered requests by person (exclude rejected for display)
  const gridPeople = useMemo(() => {
    const byName = {}
    for (const req of filteredRequests) {
      if (req.status === 'rejected') continue
      if (!byName[req.name]) byName[req.name] = { name: req.name, position: req.position, team: req.team, avatar: req.avatar, requests: [] }
      byName[req.name].requests.push(req)
    }
    return Object.values(byName)
  }, [filteredRequests])

  // All overlapping request IDs (any two employees, non-rejected)
  const overlapIds = useMemo(() => {
    const active = filteredRequests.filter(r => r.status !== 'rejected')
    const ids = new Set()
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (active[i].name === active[j].name) continue
        const aS = new Date(active[i].startDate + 'T00:00:00')
        const aE = new Date(active[i].endDate   + 'T00:00:00')
        const bS = new Date(active[j].startDate + 'T00:00:00')
        const bE = new Date(active[j].endDate   + 'T00:00:00')
        if (aS <= bE && aE >= bS) { ids.add(active[i].id); ids.add(active[j].id) }
      }
    }
    return ids
  }, [filteredRequests])

  // Overlap names map: reqId → [name1, name2, ...]
  const overlapNamesMap = useMemo(() => {
    const active = filteredRequests.filter(r => r.status !== 'rejected')
    const map = {}
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (active[i].name === active[j].name) continue
        const aS = new Date(active[i].startDate + 'T00:00:00')
        const aE = new Date(active[i].endDate   + 'T00:00:00')
        const bS = new Date(active[j].startDate + 'T00:00:00')
        const bE = new Date(active[j].endDate   + 'T00:00:00')
        if (aS <= bE && aE >= bS) {
          if (!map[active[i].id]) map[active[i].id] = []
          if (!map[active[j].id]) map[active[j].id] = []
          const ni = shortName(active[j].name), nj = shortName(active[i].name)
          if (!map[active[i].id].includes(ni)) map[active[i].id].push(ni)
          if (!map[active[j].id].includes(nj)) map[active[j].id].push(nj)
        }
      }
    }
    return map
  }, [filteredRequests])

  function handleApprove(id) {
    setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
  }

  function handleReject(id, comment) {
    setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rejectionComment: comment } : r))
    setRejectTarget(null)
  }

  const TH = {
    padding: '12px 16px', fontSize: 13, fontWeight: 400, color: '#626C77',
    textAlign: 'left', fontFamily: "'MTSCompact', sans-serif",
    background: '#F2F3F7', borderBottom: DIVIDER, whiteSpace: 'nowrap',
  }
  const TD = {
    padding: '16px', fontSize: 14, color: '#1D2023',
    fontFamily: "'MTSCompact', sans-serif", verticalAlign: 'middle',
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48, fontFamily: "'MTSCompact', sans-serif" }}>

      {/* ── Campaign stats ── */}
      <div style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ paddingBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: '1 1 0', color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>
            Статистика по кампании {campaign.year}
          </div>
          <button
            onClick={() => downloadCSV(incomingRequests)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M8 10l-3-3M8 10l3-3M2 12h12" stroke="#0070E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
              Скачать отчет
            </span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {[
            { label: 'Подано заявок',   value: totalCount },
            { label: 'На согласовании', value: pendingCount },
            { label: 'Согласованы',     value: approvedCount },
            { label: 'На ознакомлении', value: reviewingCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: '1 1 0', height: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>{label}</div>
              <div style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '28px' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section heading ── */}
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
        Входящие заявки
      </h2>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Chip active={view === 'table'} onClick={() => setView('table')}>Таблица</Chip>
          <Chip active={view === 'chart'} onClick={() => setView('chart')}>График</Chip>
        </div>

        {/* Search — same width as ColleaguesPage */}
        <div style={{ flex: '0 0 280px', position: 'relative' }}>
          <div style={{
            height: 44, paddingLeft: 12, paddingRight: 12,
            background: '#F2F3F7', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            outline: '1px rgba(188,195,208,0.5) solid', outlineOffset: '-1px',
          }}>
            <SearchIcon color="#8C9BAB" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Поиск по сотрудникам"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", color: '#1D2023' }}
            />
          </div>
        </div>

        {/* Department filter */}
        <div style={{ width: 240 }}>
          <SelectField
            value={deptFilter}
            options={deptOptions}
            onChange={v => { setDeptFilter(v); setPage(1) }}
          />
        </div>

        {/* Year selector for grid */}
        {view === 'chart' && (
          <div style={{ width: 120 }}>
            <SelectField
              value={String(gridYear)}
              options={[
                { id: String(CAMPAIGN.year - 1), name: String(CAMPAIGN.year - 1) },
                { id: String(CAMPAIGN.year),     name: String(CAMPAIGN.year) },
                { id: String(CAMPAIGN.year + 1), name: String(CAMPAIGN.year + 1) },
              ]}
              onChange={v => setGridYear(Number(v))}
            />
          </div>
        )}
      </div>

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col style={{ width: 280 }} />
                <col />
                <col style={{ width: 220 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={TH}>№ заявки</th>
                  <th style={{ ...TH, boxShadow: '-1px 0 0 #E2E5EB inset' }}>Сотрудник</th>
                  <th style={{ ...TH, boxShadow: '-1px 0 0 #E2E5EB inset' }}>Подразделение</th>
                  <th style={{ ...TH, boxShadow: '-1px 0 0 #E2E5EB inset' }}>Период отпуска</th>
                  <th style={{ ...TH, boxShadow: '-1px 0 0 #E2E5EB inset' }}>Статус</th>
                  <th style={{ ...TH, boxShadow: '-1px 0 0 #E2E5EB inset', textAlign: 'center' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {pagedRequests.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#626C77', padding: 32 }}>Нет заявок</td></tr>
                ) : pagedRequests.map((req, i) => {
                  const isLast = i === pagedRequests.length - 1
                  const rowBorder = isLast ? 'none' : DIVIDER
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...TD, borderBottom: rowBorder, color: '#626C77' }}>{req.reqNum}</td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>
                        <div style={{ fontSize: 14, color: '#1D2023', lineHeight: '20px' }}>{req.name}</div>
                        <div style={{ fontSize: 12, color: '#626C77', lineHeight: '16px', marginTop: 2 }}>{req.position}</div>
                      </td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>{req.team}</td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>
                        <div style={{ fontSize: 14, lineHeight: '20px' }}>{fmtPeriod(req.startDate, req.endDate)}</div>
                        <div style={{ fontSize: 12, color: '#626C77', lineHeight: '16px', marginTop: 2 }}>{pluralDays(req.days)}</div>
                      </td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ ...TD, borderBottom: rowBorder, textAlign: 'center' }}>
                        <ActionsDropdown
                          request={req}
                          onApprove={handleApprove}
                          onReject={r => setRejectTarget(r)}
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

      {/* ── CHART (YEAR GRID) VIEW ── */}
      {view === 'chart' && (
        <>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { color: BAR_STATUS_COLOR.pending,  label: 'на согласовании' },
              { color: BAR_OVERLAP_COLOR,          label: 'пересечения' },
              { color: BAR_STATUS_COLOR.approved,  label: 'согласован' },
              { color: BAR_STATUS_COLOR.reviewing, label: 'ознакомление' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: DIVIDER, borderTop: 'none', overflow: 'hidden' }}>
            <ManagerTooltip tooltip={tooltip} />
            <ManagerYearGrid
              year={gridYear}
              people={gridPeople}
              overlapIds={overlapIds}
              onBarClick={req => setSelectedRequest(req)}
              onBarEnter={(e, req, isOverlap) => setTooltip({
                startDate: req.startDate,
                endDate: req.endDate,
                status: req.status,
                overlaps: overlapNamesMap[req.id] ?? [],
                x: e.clientX, y: e.clientY,
              })}
              onBarMove={e => setTooltip(p => p ? { ...p, x: e.clientX, y: e.clientY } : p)}
              onBarLeave={() => setTooltip(null)}
            />
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {selectedRequest && (
        <RequestViewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={id => { handleApprove(id); setSelectedRequest(null) }}
          onOpenReject={req => { setRejectTarget(req); setSelectedRequest(null) }}
        />
      )}

      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  )
}
