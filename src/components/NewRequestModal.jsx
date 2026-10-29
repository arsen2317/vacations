import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'
import { SelectField, Banner, Drawer, DateRangeField, TextAreaField } from '../ds/index'
import { t, tName, MONTH_GEN, pluralDays } from '../i18n/translate'

const REQUEST_TYPES = [
  { id: 'annual',       name: 'Ежегодный основной оплачиваемый',     deductsBalance: true  },
  { id: 'unpaid',       name: 'Отпуск без сохранения з.п.',          desc: 'Не списывается из баланса', deductsBalance: false },
  { id: 'study_paid',   name: 'Учебный оплачиваемый',                desc: 'Не списывается из баланса', deductsBalance: false },
  { id: 'study_unpaid', name: 'Учебный без сохранения з.п.',         desc: 'Не списывается из баланса', deductsBalance: false },
]

const TYPE_LABEL_MAP = {
  annual:       'Ежегодный основной оплачиваемый',
  unpaid:       'Отпуск без сохранения з.п.',
  study_paid:   'Учебный оплачиваемый',
  study_unpaid: 'Учебный без сохранения з.п.',
}

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель' }
const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({
  id: String(c.id),
  name: c.name,
  avatar: c.avatar,
  role: c.name === DEFAULT_APPROVER.name ? DEFAULT_APPROVER.role : (c.position ?? c.team),
}))
const DEFAULT_APPROVER_ID = APPROVER_OPTIONS.find(o => o.name === DEFAULT_APPROVER.name)?.id ?? ''

function formatOverlapRange(start, end) {
  return `${start.getDate()} ${MONTH_GEN[start.getMonth()]} – ${end.getDate()} ${MONTH_GEN[end.getMonth()]}`
}

function formatNameShort(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const surname = parts[parts.length - 1]
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ')
  return `${surname} ${initials}`
}

function findColleagueOverlap(start, end) {
  if (!start || !end) return null
  for (const col of COLLEAGUES) {
    if (col.me) continue
    for (const seg of (col.segments ?? [])) {
      if (seg.status === 'draft' || seg.status === 'rejected' || seg.status === 'cancelled') continue
      const segStart = new Date(seg.startDate + 'T00:00:00')
      const segEnd   = new Date(seg.endDate   + 'T00:00:00')
      if (start <= segEnd && end >= segStart) {
        const overlapStart = start > segStart ? start : segStart
        const overlapEnd   = end   < segEnd   ? end   : segEnd
        return { colleague: col, start: overlapStart, end: overlapEnd }
      }
    }
  }
  return null
}

function findAllColleagueOverlaps(start, end) {
  if (!start || !end) return []
  const results = []
  for (const col of COLLEAGUES) {
    if (col.me) continue
    for (const seg of (col.segments ?? [])) {
      if (seg.status === 'draft' || seg.status === 'rejected' || seg.status === 'cancelled') continue
      const segStart = new Date(seg.startDate + 'T00:00:00')
      const segEnd   = new Date(seg.endDate   + 'T00:00:00')
      if (start <= segEnd && end >= segStart) {
        const overlapStart = start > segStart ? start : segStart
        const overlapEnd   = end   < segEnd   ? end   : segEnd
        results.push({ colleague: col, start: overlapStart, end: overlapEnd })
      }
    }
  }
  return results
}


export default function NewRequestModal({ onClose, onSubmitted, initialStart = null, initialEnd = null }) {
  const { requests, setRequests, balance, setBalance } = useApp()
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)
  const [comment, setComment] = useState('')
  const [approver, setApprover] = useState(DEFAULT_APPROVER_ID)
  const [substitute, setSubstitute] = useState('')
  const [extraApprover, setExtraApprover] = useState('')
  const [errors, setErrors] = useState({})
  const selectedType = REQUEST_TYPES.find(rt => rt.id === type)

  const previewDays = useMemo(() => {
    if (!startDate || !endDate) return null
    try {
      if (endDate < startDate) return null
      return countVacationDays(startDate, endDate)
    } catch {
      return null
    }
  }, [startDate, endDate])

  const overlap = useMemo(() => {
    if (!startDate) return null
    return findColleagueOverlap(startDate, endDate || startDate)
  }, [startDate, endDate])

  const overlaps = useMemo(() => {
    if (!startDate) return []
    return findAllColleagueOverlaps(startDate, endDate || startDate)
  }, [startDate, endDate])

  function validate() {
    const errs = {}
    if (!type) errs.type = t('Выберите тип отпуска')
    if (!startDate) {
      errs.dates = t('Укажите период')
    } else if (selectedType?.deductsBalance && previewDays !== null && previewDays > balance.main) {
      errs.dates = `${t('Недостаточно дней: нужно')} ${previewDays} ${pluralDays(previewDays)}${t(', доступно')} ${balance.main} ${pluralDays(balance.main)}`
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const newReq = {
      id: Date.now(),
      type: 'unplanned',
      typeLabel: TYPE_LABEL_MAP[type],
      startDate,
      endDate: endDate || startDate,
      days: previewDays,
      status: 'pending',
      approver: { name: approverName, role: 'Руководитель' },
      comment: comment || undefined,
      extraApprover: extraApprover ? APPROVER_OPTIONS.find(o => o.id === extraApprover)?.name : undefined,
    }
    setRequests(prev => [newReq, ...prev])
    if (selectedType.deductsBalance) {
      setBalance(prev => ({ ...prev, main: Math.max(0, prev.main - previewDays) }))
    }
    onSubmitted ? onSubmitted() : onClose()
  }

  const approverOption = APPROVER_OPTIONS.find(o => o.id === approver)
  const approverName = approverOption?.name ?? DEFAULT_APPROVER.name
  const personOptions = APPROVER_OPTIONS.map(o => ({ ...o, name: tName(o.name), role: o.role ? t(o.role) : undefined }))

  return (
    <Drawer
      title={t('Заявка на внеплановый отпуск')}
      subtitle={`${t('Накоплено')} ${balance.main} ${pluralDays(balance.main)} ${t('основного оплачиваемого отпуска')}`}
      onClose={onClose}
      actions={[
        { label: t('создать заявку'), type: 'primary', onClick: handleSubmit },
        { label: t('отмена'), type: 'secondary', onClick: onClose },
      ]}
    >
      {/* Период */}
      <DateRangeField
        label={t('Период отпуска')}
        start={startDate}
        end={endDate}
        error={errors.dates}
        description={previewDays !== null ? `${t('Выбрано')} ${previewDays} ${pluralDays(previewDays)} ${t('отпуска')}` : undefined}
        onChange={(s, e) => { setStartDate(s); setEndDate(e); setErrors(prev => ({ ...prev, dates: undefined })) }}
      />
      {overlap && (
        <div style={{ paddingBottom: 12 }}>
          <Banner
            type="warning"
            title={`${t('Период отпуска пересекается с')} ${formatNameShort(tName(overlap.colleague.name))}: ${formatOverlapRange(overlap.start, overlap.end)}`}
          />
        </div>
      )}

      {/* Вид отпуска */}
      <SelectField
        size="L"
        label={t('Вид отпуска')}
        value={type}
        options={REQUEST_TYPES.map(rt => ({ ...rt, name: t(rt.name), desc: rt.desc ? t(rt.desc) : rt.desc }))}
        onChange={v => { setType(v); setErrors(e => ({ ...e, type: undefined })) }}
        error={errors.type}
        description={selectedType
          ? (selectedType.id === 'annual'
            ? `${t('За счёт накопленного ежегодного основного оплачиваемого отпуска:')} ${balance.main} ${pluralDays(balance.main)}`
            : t(selectedType.desc))
          : t('Если нужен отпуск на завтра, выбирайте вид отпуска «Без сохранения заработной платы»')}
      />

      <SelectField
        person
        label={t('Заместитель (необязательно)')}
        value={substitute}
        options={personOptions}
        onChange={setSubstitute}
        searchable
      />

      <SelectField
        person
        label={t('Согласующий')}
        value={approver}
        options={personOptions}
        onChange={v => setApprover(v || DEFAULT_APPROVER_ID)}
        searchable
      />

      <SelectField
        person
        label={t('Дополнительный согласующий (необязательно)')}
        value={extraApprover}
        options={personOptions.filter(o => o.id !== approver)}
        onChange={setExtraApprover}
        searchable
      />

      <TextAreaField
        label={t('Комментарий (необязательно)')}
        value={comment}
        onChange={setComment}
        placeholder={t('До 60 символов')}
        maxLength={60}
      />
    </Drawer>
  )
}
