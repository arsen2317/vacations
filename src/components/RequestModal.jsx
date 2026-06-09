import { useState, useMemo } from 'react'
import StatusBadge from './StatusBadge'
import { CalendarRange, COLORS, BTN_STYLE } from '../ds/index'
import { COLLEAGUES } from '../data/mockData'

const MONTH_SHORT_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
function fmtShortDate(d) {
  const date = d instanceof Date ? d : new Date(String(d) + 'T00:00:00')
  return `${date.getDate()} ${MONTH_SHORT_RU[date.getMonth()]}`
}

function ColleaguesOverlapBanner({ overlaps }) {
  if (!overlaps.length) return null
  return (
    <div style={{ padding: 12, background: '#1D2023', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#FAFAFA', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
        Отпуска коллег
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {overlaps.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 4, height: 20, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ width: 4, height: 4, left: 0, top: 8, position: 'absolute', background: '#FAC031', borderRadius: 12 }} />
            </div>
            <div style={{ color: '#FAFAFA', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              {o.name} ({fmtShortDate(o.startDate)} – {fmtShortDate(o.endDate)})
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function fmtDate(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return `${n} дней`
  const m = n % 10
  if (m === 1) return `${n} день`
  if (m >= 2 && m <= 4) return `${n} дня`
  return `${n} дней`
}

const BTN = (extra) => ({
  ...BTN_STYLE,
  height: 44,
  border: 'none',
  borderRadius: 16,
  cursor: 'pointer',
  ...extra,
})

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: '#1D2023', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

export default function RequestModal({ request, onClose, onReschedule }) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false)

  const colleagueOverlaps = useMemo(() => {
    if (!request) return []
    const start = request.startDate instanceof Date ? request.startDate : new Date(String(request.startDate) + 'T00:00:00')
    const end = request.endDate instanceof Date ? request.endDate : new Date(String(request.endDate) + 'T00:00:00')
    const sd = new Date(start); sd.setHours(0,0,0,0)
    const ed = new Date(end); ed.setHours(0,0,0,0)
    return COLLEAGUES.flatMap(c => {
      if (c.me) return []
      return c.segments
        .filter(seg => {
          const s = new Date(seg.startDate + 'T00:00:00')
          const e = new Date(seg.endDate + 'T00:00:00')
          return sd <= e && ed >= s
        })
        .map(seg => ({ name: c.name, startDate: seg.startDate, endDate: seg.endDate }))
    })
  }, [request])

  if (!request) return null

  const status = request.status
  const canReschedule =
    request.type === 'planned' &&
    (status === 'approved' || status === 'pending') &&
    (request.rescheduleCount ?? 0) < (request.rescheduleLimit ?? 2)
  const canCancel = status === 'approved' || status === 'pending'

  function handleClose() {
    setShowActionsMenu(false)
    setShowCancelConfirm(false)
    setShowRescheduleCalendar(false)
    onClose()
  }

  function handleRescheduleApply(start, end) {
    onReschedule?.(start, end)
    onClose()
  }

  if (showRescheduleCalendar) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowRescheduleCalendar(false)}
      >
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '24px 32px', width: 760,
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14)',
          }}>
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

  if (showCancelConfirm) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowCancelConfirm(false)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 32, padding: 32, width: 440,
            boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
            Отменить заявку?
          </div>
          <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
            Заявка будет отменена. Это действие нельзя отменить.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowCancelConfirm(false)} style={BTN({ flex: 1, background: '#F2F3F7', color: '#1D2023' })}>
              Назад
            </button>
            <button onClick={handleClose} style={BTN({ flex: 2, background: '#F95721', color: '#fff' })}>
              Подтвердить отмену
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 32, padding: 32, width: 480,
          boxShadow: '0px 12px 20px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: 20, position: 'relative',
          fontFamily: "'MTSCompact', sans-serif",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 24, right: 24,
            width: 32, height: 32, background: '#F2F3F7', border: 'none',
            borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={{ paddingRight: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#626C77', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '16px', marginBottom: 4 }}>
            Заявка #{request.id}
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
            {request.typeLabel}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ alignSelf: 'flex-start' }}>
          <StatusBadge status={status} />
        </div>

        <div style={{ height: 1, background: 'rgba(188,195,208,0.50)' }} />

        {/* Info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InfoRow label="Период" value={`${fmtDate(request.startDate)} — ${fmtDate(request.endDate)}`} />
          <InfoRow label="Дней" value={pluralDays(request.days)} />
          {request.approver && (
            <InfoRow label="Согласующий" value={`${request.approver.name} · ${request.approver.role}`} />
          )}
          {request.type === 'planned' && request.rescheduleCount !== undefined && (
            <InfoRow label="Переносов использовано" value={`${request.rescheduleCount} / ${request.rescheduleLimit ?? 2}`} />
          )}
        </div>

        {/* Colleagues overlap banner */}
        <ColleaguesOverlapBanner overlaps={colleagueOverlaps} />

        {/* Rejection comment */}
        {status === 'rejected' && request.rejectionComment && (
          <div style={{ padding: '12px 16px', background: '#FFF3F0', borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#AD3400', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Причина отклонения
            </div>
            <div style={{ fontSize: 14, color: '#1D2023', lineHeight: '20px' }}>
              {request.rejectionComment}
            </div>
          </div>
        )}

        {/* Actions dropdown */}
        {(canReschedule || canCancel) && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowActionsMenu(v => !v)}
              style={BTN({
                background: '#F2F3F7', color: '#1D2023',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%',
              })}
            >
              <span>Действия</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                style={{ transform: showActionsMenu ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s', flexShrink: 0 }}
              >
                <path d="M1 1L5 5L9 1" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showActionsMenu && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                background: '#fff', borderRadius: 16,
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid rgba(188,195,208,0.50)',
                overflow: 'hidden', zIndex: 10,
              }}>
                {canReschedule && (
                  <div
                    onClick={() => { setShowActionsMenu(false); setShowRescheduleCalendar(true) }}
                    style={{ padding: '12px 16px', fontSize: 14, color: '#1D2023', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F2F3F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Перенести отпуск
                  </div>
                )}
                {canCancel && (
                  <div
                    onClick={() => { setShowActionsMenu(false); setShowCancelConfirm(true) }}
                    style={{ padding: '12px 16px', fontSize: 14, color: '#F95721', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F2F3F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Отменить заявку
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
