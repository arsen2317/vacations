import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { Banner, CalendarRange, BTN_STYLE } from '../ds/index'

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

function fmtRange(start, end) {
  if (!start || !end) return '—'
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth())
      return `${s.getDate()} – ${e.getDate()} ${MONTHS_RU[e.getMonth()]} ${e.getFullYear()} г.`
    return `${s.getDate()} ${MONTHS_RU[s.getMonth()]} – ${e.getDate()} ${MONTHS_RU[e.getMonth()]} ${e.getFullYear()} г.`
  }
  const fmtD = d => `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()} г.`
  return `${fmtD(s)} – ${fmtD(e)}`
}

function pluralDays(n) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} дней`
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}

function daysUntil(date) {
  if (!date) return Infinity
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = date instanceof Date ? date : new Date(date)
  d.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
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

function GreyCard({ label, value }) {
  return (
    <div style={{ alignSelf: 'stretch', background: '#F2F3F7', borderRadius: 16 }}>
      <div style={{ paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 40, display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            {label}
          </div>
          <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}

function NegativeBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: '1 1 0', height: 44, padding: 10, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
    >
      <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
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
      style={{ flex: '1 1 0', height: 44, padding: 10, background: '#F2F3F7', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
    >
      <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
        <div style={{ textAlign: 'center', color: '#1D2023', fontSize: 12, fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>
          {label}
        </div>
      </div>
    </button>
  )
}

export default function RequestModal({ request, onClose, onReschedule, onAction }) {
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false)

  if (!request) return null

  const status = request.status
  const isPlanned = request.type === 'planned'
  const rescheduleLeft = (request.rescheduleLimit ?? 2) - (request.rescheduleCount ?? 0)
  const startDaysLeft = daysUntil(request.startDate)
  const tooCloseToReschedule = startDaysLeft <= 10

  // Action logic
  const canWithdraw = !isPlanned && status === 'pending'
  const canCancel   = !isPlanned && status === 'approved'
  const canReschedule = isPlanned && status === 'approved' && rescheduleLeft > 0 && !tooCloseToReschedule
  const showRescheduleInfo = isPlanned && status === 'approved' && tooCloseToReschedule

  const title = isPlanned ? 'Заявка на плановый отпуск' : 'Заявка на внеплановый отпуск'
  const typeValue = request.planCategory || (isPlanned ? 'Плановый' : 'Основной оплачиваемый')
  const substituteValue = request.substitute || 'Не указан'
  const extraApproverValue = request.extraApprover
    ? (typeof request.extraApprover === 'string' ? request.extraApprover : request.extraApprover.name)
    : 'Не указан'

  function handleClose() {
    setShowRescheduleCalendar(false)
    onClose()
  }

  function handleWithdraw() {
    onAction?.('Заявка отозвана')
  }

  function handleCancelVacation() {
    onAction?.('Отпуск отменён')
  }

  function handleRescheduleApply(start, end) {
    onReschedule?.(start, end)
    onAction?.('Заявка на перенос направлена на согласование')
  }

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
              Количество дней нового периода должно совпадать с текущим
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
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: '1 1 0', paddingTop: 4, paddingBottom: 4 }}>
              <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                {title}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ padding: 4, background: '#F2F3F7', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
            >
              <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M0.292893 10.2929C-0.0976311 10.6834 -0.0976311 11.3166 0.292893 11.7071C0.683418 12.0976 1.31658 12.0976 1.70711 11.7071L5.99993 7.41429L10.2929 11.7073C10.6834 12.0978 11.3166 12.0978 11.7071 11.7073C12.0976 11.3167 12.0976 10.6836 11.7071 10.293L7.41414 6.00007L11.7071 1.70711C12.0976 1.31658 12.0976 0.683417 11.7071 0.292893C11.3166 -0.0976313 10.6834 -0.0976309 10.2929 0.292894L5.99992 4.58586L1.70711 0.293045C1.31658 -0.0974801 0.683419 -0.0974798 0.292895 0.293044C-0.0976297 0.683569 -0.0976293 1.31673 0.292895 1.70726L4.58571 6.00007L0.292893 10.2929Z" fill="#626C77"/>
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
        <div className="modal-scroll" style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Status badge */}
          <div>
            <StatusBadge status={status} />
          </div>

          {/* Info pairs */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InfoPair
              left={{ label: 'Тип отпуска', value: typeValue }}
              right={{ label: 'Период', value: fmtRange(request.startDate, request.endDate) }}
            />
            <InfoPair
              left={{ label: 'Количество дней отпуска', value: pluralDays(request.days) }}
              right={{ label: 'Заместитель', value: substituteValue }}
            />
            <InfoPair
              left={{ label: 'Согласующий', value: request.approver?.name ?? '—' }}
              right={{ label: 'Дополнительный согласующий', value: extraApproverValue }}
            />
            {isPlanned && status === 'approved' && (
              <InfoPair
                left={{ label: 'Осталось переносов', value: String(rescheduleLeft) }}
                right={null}
              />
            )}
          </div>

          {/* Rejection comment */}
          {status === 'rejected' && request.rejectionComment && (
            <GreyCard label="Причина отклонения" value={request.rejectionComment} />
          )}

          {/* Comment */}
          {request.comment && (
            <GreyCard label="Комментарий" value={request.comment} />
          )}

          {/* Too close to reschedule banner */}
          {showRescheduleInfo && (
            <Banner
              title="Перенос недоступен"
              subtitle={`До начала отпуска осталось ${startDaysLeft} ${startDaysLeft === 1 ? 'день' : startDaysLeft >= 2 && startDaysLeft <= 4 ? 'дня' : 'дней'} — менее 10 дней`}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 32, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, flexShrink: 0, display: 'flex', gap: 10 }}>
          {canWithdraw && (
            <NegativeBtn label="Отозвать заявку" onClick={handleWithdraw} />
          )}
          {canCancel && (
            <NegativeBtn label="Отменить отпуск" onClick={handleCancelVacation} />
          )}
          {canReschedule && (
            <SecondaryBtn label="Перенести отпуск" onClick={() => setShowRescheduleCalendar(true)} />
          )}
          {!canWithdraw && !canCancel && !canReschedule && !showRescheduleInfo && (
            <div style={{ flex: 1 }} />
          )}
        </div>
      </div>
    </div>
  )
}
