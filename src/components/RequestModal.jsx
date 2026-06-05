import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { CalendarRange, BTN_STYLE } from '../ds/index'

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

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

function InfoPair({ left, right }) {
  return (
    <div style={{ alignSelf: 'stretch', display: 'flex', gap: 16 }}>
      {[left, right].map((item, i) => (
        <div key={i} style={{ flex: '1 1 0', paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              {item?.label ?? ''}
            </div>
            <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
              {item?.value ?? '—'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ label }) {
  return (
    <div style={{ alignSelf: 'stretch', paddingTop: 20, paddingBottom: 8, paddingRight: 20, display: 'flex' }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTS Text', sans-serif", fontWeight: 500, textTransform: 'uppercase', lineHeight: '20px' }}>
        {label}
      </div>
    </div>
  )
}

function PersonRow({ name, role }) {
  if (!name) return null
  const initials = name.trim().split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div style={{ alignSelf: 'stretch', paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, overflow: 'hidden', background: '#F2F3F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>
          {initials}
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1px rgba(188,195,208,0.50) solid', pointerEvents: 'none' }} />
      </div>
      <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
          {name}
        </div>
        <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
          {role}
        </div>
      </div>
    </div>
  )
}

function NegativeBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0', height: 44, padding: 10,
        background: '#F2F3F7', border: 'none', borderRadius: 16,
        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, display: 'flex' }}>
        <div style={{ textAlign: 'center', color: '#D8400C', fontSize: 12, fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>
          {label}
        </div>
      </div>
    </button>
  )
}

function SecondaryBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0', height: 44, padding: 10,
        background: '#F2F3F7', border: 'none', borderRadius: 16,
        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, display: 'flex' }}>
        <div style={{ textAlign: 'center', color: '#1D2023', fontSize: 12, fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>
          {label}
        </div>
      </div>
    </button>
  )
}

export default function RequestModal({ request, onClose, onReschedule }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false)

  if (!request) return null

  const status = request.status
  const canReschedule =
    request.type === 'planned' &&
    (status === 'approved' || status === 'pending') &&
    (request.rescheduleCount ?? 0) < (request.rescheduleLimit ?? 2)
  const canCancel = status === 'approved' || status === 'pending'

  function handleClose() {
    setShowCancelConfirm(false)
    setShowRescheduleCalendar(false)
    onClose()
  }

  function handleRescheduleApply(start, end) {
    onReschedule?.(start, end)
    onClose()
  }

  const rescheduleLeft = (request.rescheduleLimit ?? 2) - (request.rescheduleCount ?? 0)
  const typeValue = request.planCategory || (request.type === 'planned' ? 'Плановый' : 'Внеплановый')

  // ── Reschedule calendar view ──
  if (showRescheduleCalendar) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowRescheduleCalendar(false)}
      >
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', width: 760, boxShadow: '0px 12px 20px rgba(0,0,0,0.14)' }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px', marginBottom: 4 }}>
              Перенести плановый отпуск
            </div>
            <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
              Количество дней нового периода отпуска должно совпадать с текущим
            </div>
          </div>
          <CalendarRange
            applyLabel="Отправить на согласование"
            initialViewMonth={request.startDate instanceof Date ? new Date(request.startDate.getFullYear(), request.startDate.getMonth(), 1) : undefined}
            onApply={handleRescheduleApply}
            onClose={() => setShowRescheduleCalendar(false)}
          />
        </div>
      </div>
    )
  }

  // ── Cancel confirm view ──
  if (showCancelConfirm) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowCancelConfirm(false)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: 32, padding: 32, width: 440, boxShadow: '0px 8px 16px rgba(0,0,0,0.08), 0px 4px 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTS Wide', sans-serif", lineHeight: '24px' }}>
            Отозвать заявку?
          </div>
          <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
            Заявка будет отозвана. Это действие нельзя отменить.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <SecondaryBtn label="Назад" onClick={() => setShowCancelConfirm(false)} />
            <button
              onClick={handleClose}
              style={{ flex: 2, height: 44, padding: 10, background: '#F95721', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ color: '#fff', fontSize: 12, fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>
                  Подтвердить
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main modal ──
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480,
          background: '#fff',
          boxShadow: '0px 8px 16px rgba(0,0,0,0.08), 0px 4px 24px rgba(0,0,0,0.12)',
          borderRadius: 32,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ alignSelf: 'stretch', padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: '1 1 0', paddingTop: 4, paddingBottom: 4, display: 'flex' }}>
              <div style={{ flex: '1 1 0', color: '#1D2023', fontSize: 20, fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                {request.typeFullName || request.typeLabel}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ padding: 4, background: '#F2F3F7', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
            >
              <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
          </div>
          <div style={{ paddingRight: 40 }}>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              № {request.id}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ alignSelf: 'stretch', paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Status badge */}
          <div>
            <StatusBadge status={status} />
          </div>

          {/* Info pairs */}
          <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
            <InfoPair
              left={{ label: 'Тип отпуска', value: typeValue }}
              right={{ label: 'Период', value: fmtRange(request.startDate, request.endDate) }}
            />
            <InfoPair
              left={{ label: 'Количество дней отпуска', value: pluralDays(request.days) }}
              right={{ label: 'Доступно переносов', value: request.type === 'planned' ? `${rescheduleLeft} из ${request.rescheduleLimit ?? 2}` : '–' }}
            />

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

            {/* Approver */}
            {request.approver && (
              <>
                <SectionHeader label="Согласующий" />
                <PersonRow name={request.approver.name} role={request.approver.role} />
              </>
            )}

            {/* Extra approver */}
            {request.extraApprover && (
              <>
                <SectionHeader label="Дополнительный согласующий" />
                <PersonRow name={request.extraApprover.name} role={request.extraApprover.role} />
              </>
            )}
          </div>

          {/* Bottom buttons */}
          {(canCancel || canReschedule) && (
            <div style={{ paddingTop: 12, paddingBottom: 20, display: 'flex', gap: 10 }}>
              {canReschedule && (
                <SecondaryBtn label="Перенести отпуск" onClick={() => setShowRescheduleCalendar(true)} />
              )}
              {canCancel && (
                <NegativeBtn label="Отозвать заявку" onClick={() => setShowCancelConfirm(true)} />
              )}
            </div>
          )}

          {/* No actions state */}
          {!canCancel && !canReschedule && (
            <div style={{ paddingBottom: 20 }} />
          )}
        </div>
      </div>
    </div>
  )
}
