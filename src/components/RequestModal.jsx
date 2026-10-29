import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays } from '../utils/dateUtils'
import StatusBadge from './StatusBadge'
import { Banner, Drawer, DateRangeField, SelectField } from '../ds/index'
import { COLLEAGUES } from '../data/mockData'
import { LOCALE } from '../i18n/locale'
import { t, tName, MONTH_GEN, pluralDays as pluralDaysWord } from '../i18n/translate'

function fmtDateRu(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getDate()} ${MONTH_GEN[d.getMonth()]} ${d.getFullYear()}${LOCALE === 'en' ? '' : ' г.'}`
}

function fmtRange(start, end) {
  if (!start || !end) return '—'
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${MONTH_GEN[s.getMonth()]} – ${e.getDate()} ${MONTH_GEN[e.getMonth()]} ${e.getFullYear()}${LOCALE === 'en' ? '' : ' г.'}`
  }
  return `${fmtDateRu(s)} – ${fmtDateRu(e)}`
}

function pluralDays(n) {
  return `${n} ${pluralDaysWord(n)}`
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
  return `${start.getDate()} ${MONTH_GEN[start.getMonth()]} – ${end.getDate()} ${MONTH_GEN[end.getMonth()]}`
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

function InfoCell({ label, value }) {
  if (value == null) return null
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{label}</div>
      <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>{value}</div>
    </div>
  )
}

// Read-only person: label + grey card (avatar, name, role), «Не указан» when empty
function PersonInfo({ label, name, role }) {
  const colleague = name ? COLLEAGUES.find(c => c.name === name) : null
  const option = name ? { id: 'p', name: tName(name), role: role ?? colleague?.position, avatar: colleague?.avatar } : null
  return (
    <div style={{ padding: '10px 0' }}>
      <SelectField person readOnly label={label} value={option ? 'p' : ''} options={option ? [option] : []} />
    </div>
  )
}

function fmtCreated(d) {
  const date = d instanceof Date ? d : new Date(d)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${date.getDate()} ${MONTH_GEN[date.getMonth()]} ${date.getFullYear()}, ${hh}:${mm}`
}

export default function RequestModal({ request, onClose, onAction, initialReschedule = false }) {
  const { setRequests } = useApp()
  const [showReschedule, setShowReschedule] = useState(initialReschedule)
  const [rescheduleError, setRescheduleError] = useState(null)
  const [newRange, setNewRange] = useState({ start: null, end: null })

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

  function handleWithdraw() {
    setRequests(prev => prev.filter(r => r.id !== request.id))
    onAction?.(t('Заявка отозвана'))
  }

  function handleCancelVacation() {
    setRequests(prev => prev.filter(r => r.id !== request.id))
    onAction?.(t('Отпуск отменён'))
  }

  function handleWithdrawReschedule() {
    setRequests(prev => {
      const without = prev.filter(r => r.id !== request.id)
      return [...without, request.originalRequest]
    })
    onAction?.(t('Заявка на перенос отозвана'))
  }

  function handleRescheduleApply(start, end) {
    const newDays = countVacationDays(start, end)
    if (newDays !== request.days) {
      setRescheduleError(`${t('Количество дней нового периода должно совпадать с текущим —')} ${pluralDays(request.days)}`)
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
    onAction?.(t('Заявка на перенос направлена'))
  }

  // Reschedule view
  if (showReschedule) {
    const newDays = newRange.start ? countVacationDays(newRange.start, newRange.end || newRange.start) : null
    const closeReschedule = () => { if (initialReschedule) onClose(); else setShowReschedule(false) }
    return (
      <Drawer
        title={t('Перенести плановый отпуск')}
        subtitle={`${t('Количество дней нового периода должно совпадать с текущим —')} ${pluralDays(request.days)}`}
        onClose={closeReschedule}
        actions={[
          { label: t('отправить на согласование'), type: 'primary', disabled: !newRange.start, onClick: () => handleRescheduleApply(newRange.start, newRange.end || newRange.start) },
          { label: t('отмена'), type: 'secondary', onClick: closeReschedule },
        ]}
      >
        <InfoCell label={t('Текущий период')} value={fmtRange(request.startDate, request.endDate)} />
        <DateRangeField
          label={t('Новый период')}
          start={newRange.start}
          end={newRange.end}
          initialViewMonth={request.startDate}
          error={rescheduleError}
          description={newDays !== null ? `${t('Выбрано')} ${pluralDays(newDays)} ${t('отпуска')}` : undefined}
          onChange={(start, end) => { setNewRange({ start, end }); setRescheduleError(null) }}
        />
      </Drawer>
    )
  }

  const approverName = typeof request.approver === 'string' ? request.approver : request.approver?.name
  const approverRole = request.approver?.role ?? 'Руководитель'
  const extraApproverName = typeof request.extraApprover === 'string' ? request.extraApprover : request.extraApprover?.name

  const modalTitle = isReschedule
    ? t('Заявка на перенос планового отпуска')
    : isPlanned ? t('Плановый отпуск') : t('Внеплановый отпуск')

  const actions = [
    ...(canReschedule ? [{ label: t('перенести отпуск'), type: 'secondary', onClick: () => setShowReschedule(true) }] : []),
    ...(canWithdraw ? [{ label: t('отозвать заявку'), type: 'danger', onClick: handleWithdraw }] : []),
    ...(canCancel ? [{ label: t('отменить отпуск'), type: 'danger', onClick: handleCancelVacation }] : []),
    ...(canWithdrawReschedule ? [{ label: t('отозвать заявку'), type: 'danger', onClick: handleWithdrawReschedule }] : []),
  ]

  return (
    <Drawer title={modalTitle} subtitle={`№ ${request.id}`} onClose={onClose} actions={actions}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 12 }}>
          <StatusBadge status={status} />
        </div>

        {isReschedule ? (
          <>
            <InfoCell label={t('Тип отпуска')} value={t('Плановый')} />
            <InfoCell
              label={t('Старый период')}
              value={fmtRange(request.originalRequest.startDate, request.originalRequest.endDate)}
            />
            <InfoCell label={t('Новый период')} value={fmtRange(request.startDate, request.endDate)} />
            {overlaps.length > 0 && (
              <div style={{ paddingBottom: 4 }}>
                <Banner
                  type="warning"
                  title={`${t('Период отпуска пересекается с')} ${formatNameShort(tName(overlaps[0].colleague.name))}: ${formatOverlapRange(overlaps[0].start, overlaps[0].end)}`}
                />
              </div>
            )}
            <InfoCell label={t('Количество дней отпуска')} value={pluralDays(request.days)} />
          </>
        ) : (
          <>
            <InfoCell label={t('Тип отпуска')} value={t(request.typeLabel || 'Ежегодный основной оплачиваемый')} />
            <InfoCell label={pluralDays(request.days)} value={fmtRange(request.startDate, request.endDate)} />
            {overlaps.length > 0 && (
              <div style={{ paddingBottom: 4 }}>
                <Banner
                  type="warning"
                  title={`${t('Период отпуска пересекается с')} ${formatNameShort(tName(overlaps[0].colleague.name))}: ${formatOverlapRange(overlaps[0].start, overlaps[0].end)}`}
                />
              </div>
            )}
            {request.createdAt && <InfoCell label={t('Заявка создана')} value={fmtCreated(request.createdAt)} />}
            {isPlanned && status === 'approved' && (
              <InfoCell label={t('Доступно переносов')} value={`${rescheduleLeft} ${t('из')} ${request.rescheduleLimit ?? 2}`} />
            )}
          </>
        )}

        {/* Rejection comment */}
        {status === 'rejected' && request.rejectionComment && (
          <div style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div style={{ padding: '12px 16px', background: '#FFF3F0', borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#AD3400', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: "'MTSCompact', sans-serif" }}>
                {t('Причина отклонения')}
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
            {t('До начала отпуска осталось менее 10 дней — перенос недоступен')}
          </div>
        )}

        {/* People */}
        {!isPlanned && !isReschedule && (
          <PersonInfo label={t('Заместитель')} name={request.substitute} />
        )}
        <PersonInfo label={t('Согласующий')} name={approverName} role={t(approverRole)} />
        <PersonInfo label={t('Дополнительный согласующий')} name={extraApproverName} />

        {/* Comment */}
        {request.comment && (
          <div style={{ marginTop: 8, padding: '12px 16px', background: '#F2F3F7', borderRadius: 16, fontFamily: "'MTSCompact', sans-serif" }}>
            <div style={{ fontSize: 14, lineHeight: '20px', color: '#626C77' }}>{t('Комментарий')}</div>
            <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023' }}>{request.comment}</div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
