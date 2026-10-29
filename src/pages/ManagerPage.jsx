import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CAMPAIGN } from '../data/mockData'
import { Banner, Chip, SearchIcon, SelectField, MoreIcon, ChevronUp, Drawer, TextAreaField } from '../ds/index'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { t, tName, tTeam, tPosition, pluralDays as unitDays, MONTH_NAMES, MONTHS_SHORT } from '../i18n/translate'
import { LOCALE } from '../i18n/locale'

// ── Constants ─────────────────────────────────────────────────────────────────
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
const BAR_OVERLAP_COLOR = '#FAC031'

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

const DATE_SUFFIX = LOCALE === 'en' ? '' : ' г.'

function fmtDateRu(str) {
  const d = new Date(str + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}${DATE_SUFFIX}`
}

function fmtRangeRu(s, e) {
  const sd = new Date(s + 'T00:00:00'), ed = new Date(e + 'T00:00:00')
  if (sd.getFullYear() === ed.getFullYear()) {
    if (sd.getMonth() === ed.getMonth())
      return `${sd.getDate()} – ${ed.getDate()} ${MONTHS_SHORT[ed.getMonth()]} ${ed.getFullYear()}${DATE_SUFFIX}`
    return `${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]} – ${ed.getDate()} ${MONTHS_SHORT[ed.getMonth()]} ${ed.getFullYear()}${DATE_SUFFIX}`
  }
  return `${fmtDateRu(s)} – ${fmtDateRu(e)}`
}

function shortName(fullName) {
  const name = tName(fullName)
  const p = name.trim().split(/\s+/)
  if (p.length < 2) return name
  if (LOCALE === 'en') {
    // EN names are "FirstName Surname" — show "Surname F."
    const surname = p[p.length - 1]
    const initials = p.slice(0, -1).map(w => w[0] + '.').join('')
    return `${surname} ${initials}`
  }
  // Фамилия И.О. — первое слово фамилия, остальные инициалы
  const initials = p.slice(1).map(w => w[0] + '.').join('')
  return `${p[0]} ${initials}`
}

function pluralDays(n) {
  return `${n} ${unitDays(n)}`
}

function downloadCSV(requests) {
  const rows = requests.map(r => [tName(r.name), tTeam(r.team), tPosition(r.position), fmtPeriod(r.startDate, r.endDate), t(STATUS_LABEL[r.status] ?? r.status)])
  const csv = [[t('Сотрудник'), t('Подразделение'), t('Должность'), t('Период'), t('Статус')], ...rows]
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
          {t(STATUS_LABEL[tooltip.status] ?? tooltip.status)}
        </span>
      </div>
      {hasOverlap && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: BAR_OVERLAP_COLOR }} />
          <span style={{ fontSize: 12, color: '#BCC3D0', fontFamily: "'MTSCompact', sans-serif" }}>
            {t('пересекается: ')}{tooltip.overlaps.join(', ')}
          </span>
        </div>
      )}
      <div style={{ position: 'absolute', left: -6, top: 14, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #1D2023' }} />
    </div>
  )
}

// ── Year grid ─────────────────────────────────────────────────────────────────
function ManagerPersonCell({ person }) {
  const initials = tName(person.name).trim().split(' ').slice(0, 2).map(w => w[0]).join('')
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
            {tPosition(person.position)}
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
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>{t('Сотрудник')}</span>
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
            {t('Нет заявок для отображения')}
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
function RequestViewModal({ request, overlaps = [], onClose, onApprove, onOpenReject }) {
  if (!request) return null
  const canApprove = request.status === 'pending'
  const title = t(request.type === 'unplanned' ? 'Заявка на внеплановый отпуск' : 'Заявка на плановый отпуск')

  return (
    <Drawer
      title={title}
      subtitle={`№ ${request.reqNum}`}
      onClose={onClose}
      actions={canApprove ? [
        { label: t('согласовать'), type: 'primary', onClick: () => { onApprove(request.id); onClose() } },
        { label: t('отклонить'), type: 'danger', onClick: () => { onOpenReject(request); onClose() } },
      ] : []}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            {tName(request.name).trim().split(' ').slice(0, 2).map(w => w[0]).join('')}
          </div>
          <div style={{ flex: '1 1 0' }}>
            <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{tName(request.name)}</div>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{tPosition(request.position)}</div>
          </div>
        </div>

        <InfoCell label={t('Подразделение')} value={tTeam(request.team)} />
        <InfoCell label={t('Тип отпуска')}   value={t(request.typeLabel)} />
        <InfoCell label={t('Период')} value={fmtRangeRu(request.startDate, request.endDate)} />
        <InfoCell label={t('Количество дней отпуска')} value={pluralDays(request.days)} />

        {overlaps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
            {overlaps.map(r => (
              <Banner
                key={r.id}
                type="warning"
                title={`${t('Период отпуска пересекается с')} ${shortName(r.name)}: ${fmtRangeRu(r.startDate, r.endDate)}`}
              />
            ))}
          </div>
        )}
      </div>
    </Drawer>
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
    if (!comment.trim()) { setError(t('Укажите причину отклонения')); return }
    onConfirm(request.id, comment)
  }

  return (
    <Drawer
      title={t('Отклонить заявку')}
      subtitle={`${tName(request.name)} · ${fmtPeriod(request.startDate, request.endDate)}`}
      onClose={onClose}
      zIndex={1010}
      actions={[
        { label: t('отклонить'), type: 'danger', onClick: confirm },
        { label: t('отмена'), type: 'secondary', onClick: onClose },
      ]}
    >
      <TextAreaField
        label={t('Причина отклонения')}
        value={comment}
        onChange={v => { setComment(v); setError('') }}
        placeholder={t('Введите комментарий')}
        error={error}
      />
    </Drawer>
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
          border: 'none', background: open ? '#F2F3F7' : 'transparent', cursor: 'pointer',
          padding: 4, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <MoreIcon />
      </button>
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            padding: 6, background: 'white',
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
            borderRadius: 16, display: 'inline-flex', flexDirection: 'column',
            justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, zIndex: 200,
          }}
        >
          <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
            <div
              onClick={() => { onApprove(request.id); setOpen(false) }}
              style={{
                alignSelf: 'stretch', paddingLeft: 6, paddingRight: 6, paddingTop: 10, paddingBottom: 10,
                background: 'white', borderRadius: 12, justifyContent: 'flex-start', alignItems: 'center',
                gap: 8, display: 'inline-flex', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px', whiteSpace: 'nowrap' }}>
                {t('Согласовать')}
              </div>
            </div>
            <div
              onClick={() => { onReject(request); setOpen(false) }}
              style={{
                alignSelf: 'stretch', paddingLeft: 6, paddingRight: 6, paddingTop: 10, paddingBottom: 10,
                background: 'white', borderRadius: 12, justifyContent: 'flex-start', alignItems: 'center',
                gap: 8, display: 'inline-flex', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ color: '#D8400C', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px', whiteSpace: 'nowrap' }}>
                {t('Отклонить')}
              </div>
            </div>
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
    height: 32, minWidth: 32, borderRadius: 12, border: 'none',
    background: active ? '#F2F3F7' : 'transparent',
    color: disabled ? '#BCC3D0' : '#1D2023',
    fontSize: 17, fontFamily: "'MTSCompact', sans-serif",
    fontWeight: active ? 500 : 400, cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px',
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 24, gap: 8 }}>
      <button onClick={() => page > 1 && onPage(page - 1)} style={{ ...btn(false, page === 1), opacity: page === 1 ? 0.3 : 1 }}><span style={{ display: 'flex', transform: 'rotate(-90deg)' }}><ChevronUp /></span></button>
      {items.map(item =>
        typeof item === 'string'
          ? <span key={item} style={{ color: '#626C77', padding: '0 4px', fontSize: 17 }}>...</span>
          : <button key={item} onClick={() => onPage(item)} style={btn(item === page, false)}>{item}</button>
      )}
      <button onClick={() => page < totalPages && onPage(page + 1)} style={{ ...btn(false, page === totalPages), opacity: page === totalPages ? 0.3 : 1 }}><span style={{ display: 'flex', transform: 'rotate(90deg)' }}><ChevronUp /></span></button>
    </div>
  )
}

// ── Report stats modal ────────────────────────────────────────────────────────
function ReportStatsModal({ onClose, onDownload, requests, subordinates }) {
  const totalCount    = requests.length
  const pendingCount  = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const noPlanCount   = subordinates.filter(s => s.planStatus === 'draft').length

  return (
    <Drawer
      title={`${t('Статистика по кампании')} ${CAMPAIGN.year}`}
      subtitle={t('Скачайте подробный отчет по планированию отпусков ваших сотрудников.')}
      onClose={onClose}
      actions={[
        { label: t('скачать отчёт'), type: 'primary', onClick: onDownload },
        { label: t('отмена'), type: 'secondary', onClick: onClose },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <InfoCell label={t('Подано заявок')}          value={String(totalCount)} />
        <InfoCell label={t('На согласовании')}         value={String(pendingCount)} />
        <InfoCell label={t('Согласованы')}             value={String(approvedCount)} />
        <InfoCell label={t('Не создан план отпуска')}  value={String(noPlanCount)} />
      </div>
    </Drawer>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManagerPage() {
  const { subordinates, campaign, incomingRequests, setIncomingRequests } = useApp()

  const [view,            setView]            = useState('table')
  const [search,          setSearch]          = useState('')
  const [deptFilter,      setDeptFilter]      = useState('all')
  const [typeFilter,      setTypeFilter]      = useState('all')
  const [yearFilter,      setYearFilter]      = useState('all')
  const [page,            setPage]            = useState(1)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectTarget,    setRejectTarget]    = useState(null)
  const [tooltip,         setTooltip]         = useState(null)
  const [toast,           setToast]           = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)

  // Department options (dynamic from data)
  const deptOptions = useMemo(() => {
    const teams = [...new Set(incomingRequests.map(r => r.team))]
    return [
      { id: 'all', name: t('Все подразделения') },
      ...teams.map(team => ({ id: team, name: tTeam(team) })),
    ]
  }, [incomingRequests])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase().trim()
    return incomingRequests.filter(r => {
      const matchDept   = deptFilter === 'all' || r.team === deptFilter
      const matchType   = typeFilter === 'all' || r.type === typeFilter
      const matchYear   = yearFilter === 'all' || r.startDate.startsWith(yearFilter)
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q) || r.position.toLowerCase().includes(q)
      return matchDept && matchType && matchYear && matchSearch
    })
  }, [incomingRequests, search, deptFilter, typeFilter, yearFilter])

  // Overlaps for the currently open request (used in modal)
  const selectedOverlaps = useMemo(() => {
    if (!selectedRequest) return []
    const rS = new Date(selectedRequest.startDate + 'T00:00:00')
    const rE = new Date(selectedRequest.endDate   + 'T00:00:00')
    return incomingRequests.filter(r => {
      if (r.id   === selectedRequest.id)   return false
      if (r.name === selectedRequest.name) return false
      if (r.status === 'rejected')         return false
      const s = new Date(r.startDate + 'T00:00:00')
      const e = new Date(r.endDate   + 'T00:00:00')
      return rS <= e && rE >= s
    })
  }, [selectedRequest, incomingRequests])

  // Stats from ALL requests (not filtered)
  const totalCount    = incomingRequests.length
  const pendingCount  = incomingRequests.filter(r => r.status === 'pending').length
  const approvedCount = incomingRequests.filter(r => r.status === 'approved').length
  const reviewingCount = incomingRequests.filter(r => r.status === 'reviewing').length

  // Table pagination
  const pagedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Grid: group filtered requests by person (chart shows CAMPAIGN.year only)
  const gridPeople = useMemo(() => {
    const byName = {}
    for (const req of filteredRequests) {
      if (req.status === 'rejected') continue
      if (!yearBarPos(req.startDate, req.endDate, CAMPAIGN.year)) continue
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
    setToast(t('Заявка согласована'))
  }

  function handleReject(id, comment) {
    setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rejectionComment: comment } : r))
    setRejectTarget(null)
    setToast(t('Заявка отклонена'))
  }

  // Table style: rounded outline, grey header, 17px rows
  const TH = {
    padding: '10px 16px', fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#626C77',
    textAlign: 'left', fontFamily: "'MTSCompact', sans-serif",
    background: '#F2F3F7', whiteSpace: 'nowrap',
  }
  const TD = {
    padding: '10px 16px', fontSize: 17, lineHeight: '24px', color: '#1D2023',
    fontFamily: "'MTSCompact', sans-serif", verticalAlign: 'middle',
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48, fontFamily: "'MTSCompact', sans-serif" }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Chip active={view === 'table'} onClick={() => setView('table')}>{t('Таблица')}</Chip>
          <Chip active={view === 'chart'} onClick={() => setView('chart')}>{t('График')}</Chip>
        </div>

        {/* Search — same width as ColleaguesPage */}
        <div style={{ flex: '0 0 280px', position: 'relative' }}>
          <div style={{
            height: 44, paddingLeft: 12, paddingRight: 12,
            background: '#F2F3F7', borderRadius: 16,
            display: 'flex', alignItems: 'center', gap: 8,
            outline: '1px rgba(188,195,208,0.5) solid', outlineOffset: '-1px',
          }}>
            <SearchIcon color="#8C9BAB" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Поиск по сотрудникам')}
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

        {/* Type filter */}
        <div style={{ width: 200 }}>
          <SelectField
            value={typeFilter}
            options={[
              { id: 'all',       name: t('Все заявки') },
              { id: 'planned',   name: t('Плановый отпуск') },
              { id: 'unplanned', name: t('Внеплановый отпуск') },
            ]}
            onChange={v => { setTypeFilter(v); setPage(1) }}
          />
        </div>

        {/* Year filter */}
        <div style={{ width: 140 }}>
          <SelectField
            value={yearFilter}
            options={[
              { id: 'all',                     name: t('Все годы') },
              { id: String(CAMPAIGN.year - 1), name: String(CAMPAIGN.year - 1) },
              { id: String(CAMPAIGN.year),     name: String(CAMPAIGN.year) },
            ]}
            onChange={v => { setYearFilter(v); setPage(1) }}
          />
        </div>

        {/* Download report */}
        <button
          onClick={() => setShowReportModal(true)}
          style={{ height: 44, paddingLeft: 20, paddingRight: 20, borderRadius: 16, border: 'none', background: '#F2F3F7', color: '#1D2023', fontSize: 12, fontFamily: "'MTSWide', sans-serif", fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0, marginLeft: 'auto' }}
        >
          {t('Скачать отчёт')}
        </button>
      </div>

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid rgba(188,195,208,0.5)', borderRadius: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col style={{ width: 280 }} />
                <col />
                <col style={{ width: 250 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={TH}>{t('№ заявки')}</th>
                  <th style={TH}>{t('Сотрудник')}</th>
                  <th style={TH}>{t('Подразделение')}</th>
                  <th style={TH}>{t('Период отпуска')}</th>
                  <th style={TH}>{t('Статус')}</th>
                  <th style={{ ...TH, textAlign: 'center' }} aria-label={t('Действия')} />
                </tr>
              </thead>
              <tbody>
                {pagedRequests.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#626C77', padding: 32 }}>{t('Нет заявок')}</td></tr>
                ) : pagedRequests.map((req, i) => {
                  const isLast = i === pagedRequests.length - 1
                  const rowBorder = isLast ? 'none' : DIVIDER
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8F8FA'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...TD, borderBottom: rowBorder }}>{req.reqNum}</td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>
                        <div>{tName(req.name)}</div>
                        <div style={{ fontSize: 14, color: '#626C77', lineHeight: '20px' }}>{tPosition(req.position)}</div>
                      </td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>{tTeam(req.team)}</td>
                      <td style={{ ...TD, borderBottom: rowBorder }}>
                        <div>{fmtPeriod(req.startDate, req.endDate)}</div>
                        <div style={{ fontSize: 14, color: '#626C77', lineHeight: '20px' }}>{pluralDays(req.days)}</div>
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
                <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{t(label)}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: DIVIDER, borderTop: 'none', overflow: 'hidden' }}>
            <ManagerTooltip tooltip={tooltip} />
            <ManagerYearGrid
              year={CAMPAIGN.year}
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
          overlaps={selectedOverlaps}
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
      {showReportModal && (
        <ReportStatsModal
          requests={incomingRequests}
          subordinates={subordinates}
          onClose={() => setShowReportModal(false)}
          onDownload={() => { downloadCSV(incomingRequests); setShowReportModal(false) }}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
