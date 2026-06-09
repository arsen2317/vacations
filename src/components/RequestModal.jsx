import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays } from '../utils/dateUtils'
import StatusBadge from './StatusBadge'
import { CalendarRange, BTN_STYLE, Banner } from '../ds/index'
import { COLLEAGUES } from '../data/mockData'

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const MONTHS_GEN = MONTHS_RU

function fmtDateRu(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()} г.`
}

function fmtRange(start, end) {
  if (!start || !end) return '—'
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth())
      return `${s.getDate()} – ${e.getDate()} ${MONTHS_RU[e.getMonth()]} ${e.getFullYear()} г.`
    return `${s.getDate()} ${MONTHS_RU[s.getMonth()]} – ${e.getDate()} ${MONTHS_RU[e.getMonth()]} ${e.getFullYear()} г.`
  }
  return `${fmtDateRu(s)} – ${fmtDateRu(e)}`
}

function pluralDays(n) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} дней`
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}

// "Дмитрий Соколов" → "Соколов Д."
function formatNameShort(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const surname = parts[parts.length - 1]
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ')
  return `${surname} ${initials}`
}

function formatOverlapRange(start, end) {
  return `${start.getDate()} ${MONTHS_GEN[start.getMonth()]} – ${end.getDate()} ${MONTHS_GEN[end.getMonth()]}`
}

function findAllColleagueOverlaps(start, end) {
  if (!start || !end) return []
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  const results = []
  for (const col of COLLEAGUES) {
    if (col.me) continue
    for (const seg of (col.segments ?? [])) {
      if (seg.status === 'draft' || seg.status === 'rejected' || seg.status === 'cancelled') continue
      const segStart = new Date(seg.startDate + 'T00:00:00')
      const segEnd   = new Date(seg.endDate   + 'T00:00:00')
      if (s <= segEnd && e >= segStart) {
        const overlapStart = s > segStart ? s : segStart
        const overlapEnd   = e < segEnd   ? e : segEnd
        results.push({ colleague: col, start: overlapStart, end: overlapEnd })
      }
    }
  }
  return results
}

function ColleaguesTooltip({ overlaps }) {
  if (!overlaps.length) return null
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50, display: 'inline-flex', alignItems: 'flex-start' }}>
      <div style={{ width: 8, height: 36, position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 9, height: 20, left: 0, top: 8, position: 'absolute', background: '#1D2023' }} />
      </div>
      <div style={{ flex: '1 1 0', padding: 12, background: '#1D2023', borderRadius: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ alignSelf: 'stretch', flexDirection: 'column', gap: 12, display: 'flex' }}>
          <div style={{ color: '#FAFAFA', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>Отпуска коллег</div>
          <div style={{ alignSelf: 'stretch', flexDirection: 'column', gap: 2, display: 'flex' }}>
            {overlaps.map((o, i) => (
              <div key={i} style={{ display: 'inline-flex', gap: 8, alignSelf: 'stretch', alignItems: 'flex-start' }}>
                <div style={{ width: 4, height: 20, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: 4, height: 4, left: 0, top: 8, position: 'absolute', background: '#FAC031', borderRadius: 12 }} />
                </div>
                <div style={{ flex: '1 1 0', color: '#FAFAFA', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                  {formatNameShort(o.colleague.name)} ({formatOverlapRange(o.start, o.end)})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value }) {
  if (value == null) return null
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{label}</div>
      <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{value}</div>
    </div>
  )
}

function SectionHeader({ label }) {
  return (
    <div style={{ paddingTop: 20, paddingBottom: 8 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, textTransform: 'uppercase', lineHeight: '20px' }}>
        {label}
      </div>
    </div>
  )
}

function PersonRow({ name, role, avatar }) {
  if (!name) return null
  const initials = name.trim().split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {avatar
          ? <img src={avatar} alt="" style={{ width: 52, height: 52, borderRadius: 16, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: 52, height: 52, borderRadius: 16, background: '#F2F3F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>
              {initials}
            </div>
        }
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1px rgba(188,195,208,0.50) solid', pointerEvents: 'none' }} />
      </div>
      <div style={{ flex: '1 1 0', overflow: 'hidden' }}>
        <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{formatNameShort(name)}</div>
        {role && <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{role}</div>}
      </div>
    </div>
  )
}

export default function RequestModal({ request, onClose, onAction }) {
  const { setRequests } = useApp()
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleError, setRescheduleError] = useState(null)
  const [hoveringPeriod, setHoveringPeriod] = useState(false)

  const overlaps = useMemo(() => {
    if (!request) return []
    return findAllColleagueOverlaps(request.startDate, request.endDate)
  }, [request])

  if (!request) return null

  const isReschedule = request.type === 'reschedule'
  const status = request.status
  const isPlanned = request.type === 'planned' || request.isPlanned

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const startDate = request.startDate instanceof Date ? request.startDate : new Date(request.startDate)
  const startDaysLeft = Math.ceil((startDate - today) / 86400000)
  const isPast = startDaysLeft < 0
  const tooCloseToReschedule = !isPast && startDaysLeft <= 10
  const rescheduleLeft = (request.rescheduleLimit ?? 2) - (request.rescheduleCount ?? 0)

  const canWithdraw   = !isPlanned && !isReschedule && status === 'pending'
  const canCancel     = !isPlanned && !isReschedule && status === 'approved'
  const canReschedule = isPlanned && status === 'approved' && rescheduleLeft > 0 && !tooCloseToReschedule && !isPast
  const canWithdrawReschedule = isReschedule && status === 'rescheduling'
  const showRescheduleInfo = isPlanned && status === 'approved' && tooCloseToReschedule && !isPast
  const hasActions = canWithdraw || canCancel || canReschedule || canWithdrawReschedule

  function handleWithdraw() {
    setRequests(prev => prev.filter(r => r.id !== request.id))
    onAction?.('Заявка отозвана')
  }

  function handleCancelVacation() {
    setRequests(prev => prev.filter(r => r.id !== request.id))
    onAction?.('Отпуск отменён')
  }

  function handleWithdrawReschedule() {
    setRequests(prev => {
      const without = prev.filter(r => r.id !== request.id)
      return [...without, request.originalRequest]
    })
    onAction?.('Заявка на перенос отозвана')
  }

  function handleRescheduleApply(start, end) {
    const newDays = countVacationDays(start, end)
    if (newDays !== request.days) {
      setRescheduleError(`Количество дней нового периода должно совпадать с текущим — ${pluralDays(request.days)}`)
      return
    }
    setRescheduleError(null)
    setShowReschedule(false)

    const rescheduleRequest = {
      id: Date.now(),
      type: 'reschedule',
      typeLabel: 'Перенос планового отпуска',
      status: 'rescheduling',
      startDate: start,
      endDate: end,
      days: newDays,
      originalRequest: { ...request },
      approver: request.approver,
      rescheduleCount: (request.rescheduleCount ?? 0) + 1,
      rescheduleLimit: request.rescheduleLimit ?? 2,
    }

    setRequests(prev => [...prev.filter(r => r.id !== request.id), rescheduleRequest])
    onAction?.('Заявка на перенос направлена')
  }

  // Reschedule calendar view
  if (showReschedule) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowReschedule(false)}
      >
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', width: 760 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", marginBottom: 4 }}>
              Перенести плановый отпуск
            </div>
            <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
              Количество дней нового периода должно совпадать с текущим — {pluralDays(request.days)}
            </div>
            {rescheduleError && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#E30611', fontFamily: "'MTSCompact', sans-serif" }}>
                {rescheduleError}
              </div>
            )}
          </div>
          <CalendarRange
            applyLabel="Отправить на согласование"
            onApply={handleRescheduleApply}
            onClose={() => setShowReschedule(false)}
          />
        </div>
      </div>
    )
  }

  const approverName = typeof request.approver === 'string' ? request.approver : request.approver?.name
  const approverRole = request.approver?.role ?? 'Руководитель'
  const extraApproverName = typeof request.extraApprover === 'string' ? request.extraApprover : request.extraApprover?.name

  const modalTitle = isReschedule
    ? 'Заявка на перенос планового отпуска'
    : isPlanned ? 'Плановый отпуск' : 'Внеплановый отпуск'

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
              {modalTitle}
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
            № {request.id}
          </div>
        </div>

        {/* Body */}
        <div className="modal-scroll" style={{ paddingLeft: 20, paddingRight: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          <div style={{ marginBottom: 12 }}>
            <StatusBadge status={status} />
          </div>

          {isReschedule ? (
            <>
              <InfoCell label="Тип отпуска" value="Плановый" />
              <InfoCell
                label="Старый период"
                value={fmtRange(request.originalRequest.startDate, request.originalRequest.endDate)}
              />
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveringPeriod(true)}
                onMouseLeave={() => setHoveringPeriod(false)}
              >
                <InfoCell label="Новый период" value={fmtRange(request.startDate, request.endDate)} />
                {hoveringPeriod && overlaps.length > 0 && <ColleaguesTooltip overlaps={overlaps} />}
              </div>
              {overlaps.length > 0 && (
                <div style={{ paddingBottom: 4 }}>
                  <Banner
                    type="warning"
                    title={`Период отпуска пересекается с ${formatNameShort(overlaps[0].colleague.name)}: ${formatOverlapRange(overlaps[0].start, overlaps[0].end)}`}
                  />
                </div>
              )}
              <InfoCell label="Количество дней отпуска" value={pluralDays(request.days)} />
            </>
          ) : (
            <>
              <InfoCell label="Тип отпуска" value={request.typeLabel || 'Ежегодный основной оплачиваемый'} />
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveringPeriod(true)}
                onMouseLeave={() => setHoveringPeriod(false)}
              >
                <InfoCell label="Период" value={fmtRange(request.startDate, request.endDate)} />
                {hoveringPeriod && overlaps.length > 0 && <ColleaguesTooltip overlaps={overlaps} />}
              </div>
              {overlaps.length > 0 && (
                <div style={{ paddingBottom: 4 }}>
                  <Banner
                    type="warning"
                    title={`Период отпуска пересекается с ${formatNameShort(overlaps[0].colleague.name)}: ${formatOverlapRange(overlaps[0].start, overlaps[0].end)}`}
                  />
                </div>
              )}
              <InfoCell label="Количество дней отпуска" value={pluralDays(request.days)} />
              {isPlanned && status === 'approved' && (
                <InfoCell label="Доступно переносов" value={`${rescheduleLeft} из ${request.rescheduleLimit ?? 2}`} />
              )}
            </>
          )}

          {/* Rejection comment */}
          {status === 'rejected' && request.rejectionComment && (
            <div style={{ paddingTop: 8, paddingBottom: 8 }}>
              <div style={{ padding: '12px 16px', background: '#FFF3F0', borderRadius: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#AD3400', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: "'MTSCompact', sans-serif" }}>
                  Причина отклонения
                </div>
                <div style={{ fontSize: 14, color: '#1D2023', lineHeight: '20px', fontFamily: "'MTSCompact', sans-serif" }}>
                  {request.rejectionComment}
                </div>
              </div>
            </div>
          )}

          {/* Reschedule info banner (≤10 days) */}
          {showRescheduleInfo && (
            <div style={{ padding: '12px 16px', background: '#F2F3F7', borderRadius: 16, marginTop: 8, fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
              До начала отпуска осталось менее 10 дней — перенос недоступен
            </div>
          )}

          {/* Approver */}
          {approverName && (
            <>
              <SectionHeader label="Согласующий" />
              <PersonRow name={approverName} role={approverRole} />
            </>
          )}

          {/* Extra approver */}
          {extraApproverName && (
            <>
              <SectionHeader label="Дополнительный согласующий" />
              <PersonRow name={extraApproverName} />
            </>
          )}

          {/* Actions */}
          {hasActions && (
            <div style={{ paddingTop: 12, paddingBottom: 20, display: 'flex', gap: 10 }}>
              {canReschedule && (
                <button
                  onClick={() => setShowReschedule(true)}
                  style={{ flex: 1, height: 44, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#1D2023' }}
                >
                  ПЕРЕНЕСТИ ОТПУСК
                </button>
              )}
              {canWithdraw && (
                <button
                  onClick={handleWithdraw}
                  style={{ flex: 1, height: 44, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#D8400C' }}
                >
                  ОТОЗВАТЬ ЗАЯВКУ
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancelVacation}
                  style={{ flex: 1, height: 44, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#D8400C' }}
                >
                  ОТМЕНИТЬ ОТПУСК
                </button>
              )}
              {canWithdrawReschedule && (
                <button
                  onClick={handleWithdrawReschedule}
                  style={{ flex: 1, height: 44, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE, color: '#D8400C' }}
                >
                  ОТОЗВАТЬ ЗАЯВКУ
                </button>
              )}
            </div>
          )}
          {!hasActions && <div style={{ paddingBottom: 20 }} />}
        </div>
      </div>
    </div>
  )
}
