import { useState, useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import PlanSubmitModal from '../components/PlanSubmitModal'
import VacationCalculatorModal from '../components/VacationCalculatorModal'
import Toast from '../components/Toast'
import { BTN_STYLE, Banner, Chip, StatusBadge, PersonAvatar, YearCalendar, calendarWidth, CalculatorIcon, SearchIcon, DoneIcon, WarningIcon, MoreIcon, CrossIcon, Drawer, DateRangeField } from '../ds/index'
import { countVacationDays } from '../utils/dateUtils'
import { COLLEAGUES, CURRENT_USER } from '../data/mockData'
import { t, tName, tTeam, MONTH_GEN_SHORT, pluralDays } from '../i18n/translate'
import { LOCALE } from '../i18n/locale'

const MIN_PLAN_DAYS = 28

const FONT = "'MTSCompact', sans-serif"
const SECTION_TITLE = { margin: 0, color: '#1D2023', fontFeatureSettings: "'liga' off, 'clig' off", fontFamily: "'MTSWide', sans-serif", fontSize: 24, fontWeight: 500, lineHeight: '28px' }
const CELL_TITLE = { color: '#1D2023', fontSize: 17, fontFamily: FONT, fontWeight: 500, lineHeight: '24px' }
const CELL_CAPTION = { color: '#626C77', fontSize: 14, fontFamily: FONT, fontWeight: 400, lineHeight: '20px' }

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  return `${s.getDate()} ${MONTH_GEN_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTH_GEN_SHORT[e.getMonth()]}`
}

function formatSegmentDate(isoStr) {
  const d = new Date(isoStr + 'T00:00:00')
  return `${d.getDate()} ${MONTH_GEN_SHORT[d.getMonth()]}`
}

// Icon inside a 16px slot (DS icons are drawn on a 24px grid)
function SmallIcon({ children }) {
  return (
    <span style={{ width: 16, height: 16, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <span style={{ display: 'flex', transform: 'scale(0.6667)' }}>{children}</span>
    </span>
  )
}

// Left panel for 2026: balance + vacation list
function Panel2026({ balance, yearRequests, setSelectedRequest, onOpenCalculator, onGoToRequests, intersections }) {
  const total = balance.main + balance.extra
  return (
    <>
      {/* Balance */}
      <div style={{ background: '#F2F3F7', borderRadius: 20, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#626C77', fontSize: 17, fontFamily: FONT, fontWeight: 400, lineHeight: '20px' }}>
            {t('Баланс отпуска')}
          </span>
          <button
            onClick={onOpenCalculator}
            style={{ padding: 4, border: 'none', borderRadius: 8, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <SmallIcon><CalculatorIcon /></SmallIcon>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ color: '#1D2023', fontSize: 24, fontFamily: FONT, fontWeight: 500, lineHeight: '28px', whiteSpace: 'nowrap' }}>
            {total} {pluralDays(total)}
          </span>
          {balance.extra > 0 && (
            <span style={{ paddingBottom: 2, color: '#626C77', fontSize: 17, fontFamily: FONT, fontWeight: 400, lineHeight: '20px' }}>
              {LOCALE === 'en'
                ? <>incl. {balance.extra} {pluralDays(balance.extra)} of extra leave</>
                : <>из них {balance.extra} {pluralDays(balance.extra)} доп.&nbsp;отпуска</>}
            </span>
          )}
        </div>
      </div>

      {/* Vacation list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingBottom: 16 }}>
          <div style={{ padding: '24px 0 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <h3 style={{ ...SECTION_TITLE, flex: 1 }}>{t('Мои отпуска')}</h3>
            <span onClick={onGoToRequests} style={{ color: '#0070E5', fontSize: 17, fontFamily: FONT, fontWeight: 400, lineHeight: '24px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {t('Все заявки')}
            </span>
          </div>
          <div style={CELL_CAPTION}>
            {t('Для создания заявки выделите период, выбирая даты прямо в календаре')}
          </div>
        </div>

        {yearRequests.length === 0 ? (
          <div style={{ ...CELL_CAPTION, padding: '8px 0' }}>
            {LOCALE === 'en' ? <>No requests for 2026</> : <>Нет&nbsp;заявок за&nbsp;2026 год</>}
          </div>
        ) : (
          yearRequests.map(req => (
            <button
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              style={{
                minHeight: 64, padding: '10px 0',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
                <div style={CELL_TITLE}>{formatDateRange(req.startDate, req.endDate)}</div>
                <div style={CELL_CAPTION}>{req.days} {pluralDays(req.days)} · {t(req.typeLabel)}</div>
              </div>
              <StatusBadge type={req.status} />
            </button>
          ))
        )}
      </div>

      {intersections}
    </>
  )
}

function ColleagueRow({ col, onRemove }) {
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <PersonAvatar src={col.avatar} />
      <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ color: '#1D2023', fontSize: 17, fontFamily: FONT, fontWeight: 400, lineHeight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tName(col.name)}
        </div>
        <div style={CELL_CAPTION}>
          {col.position ?? tTeam(col.team)}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CrossIcon />
      </button>
    </div>
  )
}

// «Пересечения»: legend, colleague search and tracked colleagues
function IntersectionsSection({ trackedColleagues, onAddColleague, onRemoveColleague }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const trackedIds = new Set(trackedColleagues.map(c => c.id))
  const q = query.trim().toLowerCase()
  const results = COLLEAGUES
    .filter(c => !c.me && !trackedIds.has(c.id))
    .filter(c => !q || tName(c.name).toLowerCase().includes(q))
    .slice(0, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 36, paddingBottom: 12 }}>
        <h3 style={SECTION_TITLE}>{t('Пересечения')}</h3>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#FAC031', flexShrink: 0 }} />
        <span style={{ color: '#626C77', fontSize: 17, fontFamily: FONT, fontWeight: 400, lineHeight: '20px' }}>
          {t('отметка пересечений в календаре')}
        </span>
      </div>

      {/* Colleague search */}
      <div style={{ padding: '16px 0', position: 'relative' }}>
        <div style={{
          height: 44, boxSizing: 'border-box',
          background: '#F2F3F7', borderRadius: 16,
          border: '1px solid rgba(188,195,208,0.5)',
          display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px 0 12px',
        }}>
          <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={t('Выберите сотрудников')}
            className="mts-search-input"
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 17, lineHeight: '24px', color: '#1D2023', fontFamily: FONT,
            }}
          />
        </div>
        {focused && results.length > 0 && (
          <div className="modal-scroll" style={{
            position: 'absolute', top: 64, left: 0, right: 0, zIndex: 200,
            maxHeight: 320, overflowY: 'auto',
            background: '#fff', borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            border: '1px solid rgba(188,195,208,0.5)',
          }}>
            {results.map(col => (
              <div
                key={col.id}
                onMouseDown={() => { onAddColleague(col.id); setQuery('') }}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F2F3F7' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                <span style={{ color: '#1D2023', fontSize: 17, fontFamily: FONT, lineHeight: '24px' }}>{tName(col.name)}</span>
                <span style={CELL_CAPTION}>{col.position ?? tTeam(col.team)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colleagues list */}
      {trackedColleagues.map(col => (
        <ColleagueRow
          key={col.id}
          col={col}
          onRemove={() => onRemoveColleague(col.id)}
        />
      ))}
    </div>
  )
}

function SegmentMenu({ onEdit, onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ padding: 0, border: 'none', borderRadius: 8, background: '#F2F3F7', cursor: 'pointer', display: 'flex' }}
      >
        <MoreIcon />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 200,
          padding: 6, background: '#fff', borderRadius: 16,
          boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
        }}>
          {[
            { label: t('Редактировать'), color: '#1D2023', onClick: onEdit },
            { label: t('Удалить'),       color: '#D8400C', onClick: onRemove },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => { setOpen(false); item.onClick() }}
              style={{ padding: '10px 6px', borderRadius: 12, cursor: 'pointer', color: item.color, fontSize: 17, fontFamily: FONT, lineHeight: '24px', whiteSpace: 'nowrap' }}
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

function EditSegmentDrawer({ segment, onClose, onSave }) {
  const [range, setRange] = useState({
    start: new Date(segment.startDate + 'T00:00:00'),
    end:   new Date(segment.endDate + 'T00:00:00'),
  })
  const days = countVacationDays(range.start, range.end)

  return (
    <Drawer
      title={t('Изменить период')}
      subtitle={`${formatSegmentDate(segment.startDate)} – ${formatSegmentDate(segment.endDate)} · ${segment.days} ${pluralDays(segment.days)}`}
      onClose={onClose}
      actions={[
        { label: t('сохранить'), type: 'primary', onClick: () => onSave(range.start, range.end) },
        { label: t('отмена'), type: 'secondary', onClick: onClose },
      ]}
    >
      <DateRangeField
        label={t('Период отпуска')}
        start={range.start}
        end={range.end}
        description={`${t('Выбрано')} ${days} ${pluralDays(days)} ${t('отпуска')}`}
        onChange={(start, end) => setRange({ start, end })}
      />
    </Drawer>
  )
}

function ConditionRow({ done, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
      <SmallIcon>{done ? <DoneIcon /> : <WarningIcon />}</SmallIcon>
      <span style={{ color: '#626C77', fontSize: 12, fontFamily: FONT, fontWeight: 400, lineHeight: '16px' }}>{children}</span>
    </div>
  )
}

// Left panel for 2027: planning view
function Panel2027({ totalDays, segments, onRemoveSegment, onEditSegment, planStatus, onOpenPlanModal, onSegmentClick, intersections }) {
  const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
  const hasLongSegment  = segments.some(s => s.days >= 14)
  const hasMinDays      = distributedDays >= MIN_PLAN_DAYS
  const canSubmit       = hasMinDays && hasLongSegment
  const progress        = Math.min(1, distributedDays / totalDays)

  return (
    <>
      {/* Conditions */}
      <div style={{ background: '#F2F3F7', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ ...CELL_CAPTION, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('Всего доступно:')} {totalDays} {pluralDays(totalDays)}
          </div>
          <div style={{ height: 32, paddingTop: 6, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 4, fontSize: 17, fontFamily: FONT, fontWeight: 500, lineHeight: '24px', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#1D2023' }}>{distributedDays}</span>
            <span style={{ color: '#969FA8' }}>{t('из')} {totalDays} {pluralDays(totalDays)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(188,195,208,0.5)', overflow: 'hidden' }}>
            <div style={{ height: 8, borderRadius: 4, background: '#26CD58', width: `${progress * 100}%`, transition: 'width 0.2s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ConditionRow done={hasMinDays}>{t('Распределите минимум 28 дней')}</ConditionRow>
          <ConditionRow done={hasLongSegment}>{t('Один из периодов должен быть не меньше 14 дней')}</ConditionRow>
        </div>
      </div>

      {/* Plan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ paddingTop: 24 }}>
          <h3 style={SECTION_TITLE}>{t('План отпуска')}</h3>
        </div>

        {segments.length === 0 ? (
          <Banner title={t('Для создания плана отпуска начните выделять периоды, выбирая даты прямо в календаре')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {segments.map(seg => (
              <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={planStatus === 'draft' ? undefined : () => onSegmentClick?.(seg)}
                  style={{ flex: 1, minWidth: 0, padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: planStatus === 'draft' ? 'default' : 'pointer', textAlign: 'left' }}
                >
                  <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={CELL_TITLE}>{formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}</div>
                    <div style={CELL_CAPTION}>{seg.days} {pluralDays(seg.days)}</div>
                  </div>
                  <StatusBadge type={planStatus} />
                </button>
                {planStatus === 'draft' && (
                  <SegmentMenu onEdit={() => onEditSegment(seg)} onRemove={() => onRemoveSegment(seg.id)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button — disabled until conditions are met */}
      {planStatus === 'draft' && segments.length > 0 && (
        <button
          onClick={canSubmit ? onOpenPlanModal : undefined}
          disabled={!canSubmit}
          style={{
            alignSelf: 'stretch', height: 44, padding: 10,
            background: canSubmit ? '#0066FF' : 'rgba(188,195,208,0.5)',
            opacity: canSubmit ? 1 : 0.6,
            overflow: 'hidden', borderRadius: 16, border: 'none',
            cursor: canSubmit ? 'pointer' : 'default',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <span style={{ ...BTN_STYLE, padding: '4px 8px', color: canSubmit ? '#FFFFFF' : '#969FA8' }}>
            {t('отправить на согласование')}
          </span>
        </button>
      )}

      {intersections}
    </>
  )
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const INITIAL_TRACKED_IDS = COLLEAGUES
  .filter(c => !c.me && c.team === CURRENT_USER.team)
  .map(c => c.id)

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR, onGoToRequests, initialYear }) {
  const { requests, balance, segments, setSegments, planStatus, setPlanStatus, campaign } = useApp()
  const [year, setYear] = useState(initialYear ?? 2026)
  useEffect(() => { if (initialYear) setYear(initialYear) }, [initialYear])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [newRequestRange, setNewRequestRange] = useState(null)
  const [calendarKey, setCalendarKey] = useState(0)
  const [editingSegment, setEditingSegment] = useState(null)
  const [resizePreview, setResizePreview] = useState(null) // { id, start, end } while dragging a period edge
  const [toast, setToast] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [trackedColleagueIds, setTrackedColleagueIds] = useState(INITIAL_TRACKED_IDS)
  const [calCols, setCalCols] = useState(() => window.innerWidth < 1400 ? 2 : 3)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1399px)')
    const handler = e => setCalCols(e.matches ? 2 : 3)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const trackedColleagues = useMemo(
    () => trackedColleagueIds.map(id => COLLEAGUES.find(c => c.id === id)).filter(Boolean),
    [trackedColleagueIds],
  )

  const colleagueMap2027 = useMemo(() => {
    const map = new Map()
    for (const col of trackedColleagues) {
      for (const seg of (col.segments ?? [])) {
        if (!seg.startDate.startsWith('2027')) continue
        if (seg.status === 'draft') continue
        const s = new Date(seg.startDate + 'T00:00:00')
        const e = new Date(seg.endDate   + 'T00:00:00')
        const cur = new Date(s)
        while (cur <= e) {
          const iso = toISODate(cur)
          if (!map.has(iso)) map.set(iso, [])
          map.get(iso).push({ name: col.name, startDate: seg.startDate, endDate: seg.endDate })
          cur.setDate(cur.getDate() + 1)
        }
      }
    }
    return map
  }, [trackedColleagues])

  const colleagueMap2026 = useMemo(() => {
    const map = new Map()
    for (const col of trackedColleagues) {
      for (const seg of (col.segments ?? [])) {
        if (!seg.startDate.startsWith('2026')) continue
        if (seg.status === 'draft') continue
        const s = new Date(seg.startDate + 'T00:00:00')
        const e = new Date(seg.endDate   + 'T00:00:00')
        const cur = new Date(s)
        while (cur <= e) {
          const iso = toISODate(cur)
          if (!map.has(iso)) map.set(iso, [])
          map.get(iso).push({ name: col.name, startDate: seg.startDate, endDate: seg.endDate })
          cur.setDate(cur.getDate() + 1)
        }
      }
    }
    return map
  }, [trackedColleagues])

  function closeNewRequest() {
    setNewRequestRange(null)
    setCalendarKey(k => k + 1)
  }

  function handleRemoveSegment(id) {
    setSegments(prev => prev.filter(s => s.id !== id))
    setCalendarKey(k => k + 1)
  }

  const planTotalDays = campaign.totalDays

  function handleAddSegment(start, end) {
    const startStr = toISODate(start)
    const endStr   = toISODate(end)
    const days = countVacationDays(start, end)

    // Classify overlapping segments as encompassed (new fully contains them) or partial
    const encompassed = []
    for (const seg of segments) {
      const ss = new Date(seg.startDate + 'T00:00:00')
      const se = new Date(seg.endDate   + 'T00:00:00')
      if (start <= se && end >= ss) {
        if (start <= ss && end >= se) {
          encompassed.push(seg)
        } else {
          setToast(t('Выбранный период пересекается с существующим'))
          setCalendarKey(k => k + 1)
          return
        }
      }
    }

    const encDays = encompassed.reduce((s, seg) => s + seg.days, 0)
    const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
    if (distributedDays - encDays + days > planTotalDays) {
      setToast(distributedDays >= planTotalDays
        ? t('У вас больше нет доступных дней отпуска')
        : t('Выбранный период превышает остаток дней отпуска'))
      setCalendarKey(k => k + 1)
      return
    }

    const encIds = new Set(encompassed.map(s => s.id))
    setSegments(prev => [...prev.filter(s => !encIds.has(s.id)), { id: Date.now(), startDate: startStr, endDate: endStr, days }]
      .sort((a, b) => a.startDate.localeCompare(b.startDate)))
    setCalendarKey(k => k + 1)
  }

  // Change dates of an existing draft segment (calendar drag or «Редактировать»)
  function handleUpdateSegment(id, start, end) {
    if (start.getFullYear() !== campaign.year || end.getFullYear() !== campaign.year) {
      setToast(t('Период должен быть в пределах планируемого года'))
      return false
    }
    const current = segments.find(s => s.id === id)
    if (!current) return false
    const overlapsOther = segments.some(seg => {
      if (seg.id === id) return false
      const ss = new Date(seg.startDate + 'T00:00:00')
      const se = new Date(seg.endDate   + 'T00:00:00')
      return start <= se && end >= ss
    })
    if (overlapsOther) {
      setToast(t('Выбранный период пересекается с существующим'))
      return false
    }
    const days = countVacationDays(start, end)
    const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
    if (distributedDays - current.days + days > planTotalDays) {
      setToast(t('Выбранный период превышает остаток дней отпуска'))
      return false
    }
    setSegments(prev => prev
      .map(seg => seg.id === id ? { ...seg, startDate: toISODate(start), endDate: toISODate(end), days } : seg)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)))
    return true
  }

  // Segments as shown in the left panel: the dragged period follows the calendar live
  const displaySegments = resizePreview
    ? segments.map(seg => seg.id === resizePreview.id
      ? { ...seg, startDate: toISODate(resizePreview.start), endDate: toISODate(resizePreview.end), days: countVacationDays(resizePreview.start, resizePreview.end) }
      : seg)
    : segments

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  const yearRequests = requests
    .filter(r => {
      const s = new Date(r.startDate)
      const e = new Date(r.endDate)
      return s.getFullYear() === year || e.getFullYear() === year
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  if (year === 2026) {
    const isPast = r => new Date(r.endDate) < today
    yearRequests.sort((a, b) => {
      const pa = isPast(a), pb = isPast(b)
      if (pa !== pb) return pa ? 1 : -1
      return new Date(a.startDate) - new Date(b.startDate)
    })
  }

  const intersections = (
    <IntersectionsSection
      trackedColleagues={trackedColleagues}
      onAddColleague={id => setTrackedColleagueIds(prev => prev.includes(id) ? prev : [...prev, id])}
      onRemoveColleague={id => setTrackedColleagueIds(prev => prev.filter(x => x !== id))}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>

        {/* Left panel */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 32 }}>

          {/* Year chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip active={year === 2026} onClick={() => setYear(2026)}>2026</Chip>
            <Chip active={year === 2027} onClick={() => setYear(2027)}>{t('2027 – планирование')}</Chip>
          </div>

          {year === 2026 ? (
            <Panel2026
              balance={balance}
              yearRequests={yearRequests}
              setSelectedRequest={setSelectedRequest}
              onOpenCalculator={() => setShowCalculator(true)}
              onGoToRequests={onGoToRequests}
              intersections={intersections}
            />
          ) : (
            <Panel2027
              totalDays={planTotalDays}
              segments={displaySegments}
              onRemoveSegment={handleRemoveSegment}
              onEditSegment={setEditingSegment}
              planStatus={planStatus}
              onOpenPlanModal={() => setShowPlanModal(true)}
              intersections={intersections}
              onSegmentClick={seg => setSelectedRequest({
                ...seg,
                id: seg.id,
                startDate: new Date(seg.startDate + 'T00:00:00'),
                endDate: new Date(seg.endDate + 'T00:00:00'),
                status: planStatus,
                type: 'planned',
                typeLabel: 'Ежегодный основной оплачиваемый',
                isPlanned: true,
                approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
              })}
            />
          )}
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: '#E8EDF2', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Right panel */}
        <div style={{ flexShrink: 0, paddingLeft: 32, width: calendarWidth(calCols) + 32 }}>
          <YearCalendar
            key={calendarKey}
            cols={calCols}
            year={year}
            requests={year === 2026 ? yearRequests : segments.map(s => ({
              ...s,
              startDate: new Date(s.startDate + 'T00:00:00'),
              endDate: new Date(s.endDate + 'T00:00:00'),
              status: planStatus,
              type: 'planned',
              typeLabel: 'Ежегодный основной оплачиваемый',
              isPlanned: true,
              approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
            }))}
            onRequestClick={year === 2026
              ? setSelectedRequest
              : planStatus !== 'draft'
                ? (req) => setSelectedRequest({ ...req, type: 'planned', typeLabel: 'Плановый', isPlanned: true })
                : undefined
            }
            onNewRequest={year === 2026
              ? (start, end) => setNewRequestRange({ start, end })
              : (planStatus === 'draft' ? handleAddSegment : undefined)
            }
            colleagueMap={year === 2027 ? colleagueMap2027 : colleagueMap2026}
            onResizeRequest={year === 2027 && planStatus === 'draft'
              ? (req, start, end) => handleUpdateSegment(req.id, start, end)
              : undefined
            }
            onResizePreview={year === 2027 && planStatus === 'draft' ? setResizePreview : undefined}
          />
        </div>
      </div>

      <RequestModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAction={msg => { setSelectedRequest(null); setToast(msg) }}
      />

      {newRequestRange && (
        <NewRequestModal
          initialStart={newRequestRange.start}
          initialEnd={newRequestRange.end}
          onClose={closeNewRequest}
          onSubmitted={() => {
            closeNewRequest()
            setToast(t('Заявка направлена на согласование'))
          }}
        />
      )}

      {showPlanModal && (
        <PlanSubmitModal
          segments={segments}
          onClose={() => setShowPlanModal(false)}
          onSubmit={() => {
            setShowPlanModal(false)
            setPlanStatus('pending')
            setToast(t('Заявка направлена на согласование'))
          }}
        />
      )}

      {editingSegment && (
        <EditSegmentDrawer
          segment={editingSegment}
          onClose={() => setEditingSegment(null)}
          onSave={(start, end) => { if (handleUpdateSegment(editingSegment.id, start, end)) setEditingSegment(null) }}
        />
      )}

      {showCalculator && <VacationCalculatorModal onClose={() => setShowCalculator(false)} />}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
