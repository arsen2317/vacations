import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'
import { SelectField, Banner, Drawer, DateRangeField, TextAreaField, CounterField } from '../ds/index'
import { t, tName, MONTH_GEN, pluralDays } from '../i18n/translate'

const REQUEST_TYPES = [
  { id: 'annual',       name: 'Ежегодный основной оплачиваемый',     deductsBalance: true  },
  // Only for users with extra (additional) leave days
  { id: 'extra',        name: 'Дополнительный отпуск',               deductsBalance: true, extraOnly: true },
  { id: 'combined',     name: 'Основной и дополнительный отпуск',    deductsBalance: true, extraOnly: true },
  { id: 'unpaid',       name: 'Отпуск без сохранения з.п.',          desc: 'Не списывается из баланса', deductsBalance: false },
  { id: 'study_paid',   name: 'Учебный оплачиваемый',                desc: 'Не списывается из баланса', deductsBalance: false },
  { id: 'study_unpaid', name: 'Учебный без сохранения з.п.',         desc: 'Не списывается из баланса', deductsBalance: false },
]

const TYPE_LABEL_MAP = {
  annual:       'Ежегодный основной оплачиваемый',
  extra:        'Ежегодный дополнительный оплачиваемый',
  combined:     'Ежегодный основной и дополнительный оплачиваемый',
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
  const [extraCount, setExtraCount] = useState(1)
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
    // Days beyond the accrued balance are taken in advance — not an error
    if (!startDate) errs.dates = t('Укажите период')
    else if (extraError) errs.dates = extraError
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
      extraDays: extraDays || undefined,
      status: 'pending',
      approver: { name: approverName, role: approverOption?.role ?? DEFAULT_APPROVER.role },
      comment: comment || undefined,
      createdAt: new Date(),
      substitute: substitute ? APPROVER_OPTIONS.find(o => o.id === substitute)?.name : undefined,
      extraApprover: extraApprover ? APPROVER_OPTIONS.find(o => o.id === extraApprover)?.name : undefined,
    }
    setRequests(prev => [newReq, ...prev])
    if (selectedType.deductsBalance) {
      setBalance(prev => ({ ...prev, main: Math.max(0, prev.main - (previewDays - extraDays)), extra: prev.extra - extraDays }))
    }
    onSubmitted ? onSubmitted() : onClose()
  }

  // Extra leave: «extra» uses only extra days, «combined» takes a chosen number of them
  const comboMax = previewDays !== null ? Math.min(balance.extra, previewDays - 1) : 0
  const comboExtra = Math.max(1, Math.min(extraCount, Math.max(1, comboMax)))
  const extraDays = previewDays === null ? 0 : type === 'extra' ? previewDays : type === 'combined' ? comboExtra : 0
  let extraError = null
  if (previewDays !== null && type === 'extra' && previewDays > balance.extra) {
    extraError = `${t('Выбрано')} ${previewDays} ${pluralDays(previewDays)} ${t('доп. отпуска')}. ${t('Вам доступно только')} ${balance.extra} ${pluralDays(balance.extra)} ${t('доп. отпуска')}`
  } else if (previewDays !== null && type === 'combined' && comboMax < 1) {
    extraError = t('В периоде должен быть хотя бы один день основного отпуска')
  }

  // Paid annual leave beyond the accrued balance is granted in advance
  const advanceDays = previewDays !== null && (!selectedType || selectedType.deductsBalance) && type !== 'extra'
    ? Math.max(0, previewDays - extraDays - balance.main)
    : 0
  const requestTypes = REQUEST_TYPES.filter(rt => !rt.extraOnly || balance.extra > 0)
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
        error={extraError || errors.dates}
        description={previewDays !== null
          ? (type === 'combined'
            ? `${t('Выбрано')} ${previewDays} ${pluralDays(previewDays)} ${t('отпуска')}, ${t('из них')} ${comboExtra} ${pluralDays(comboExtra)} ${t('доп. отпуска')}`
            : `${t('Выбрано')} ${previewDays} ${pluralDays(previewDays)} ${t('отпуска')}`)
            + (advanceDays > 0 ? `, ${type === 'combined' ? '' : t('из них') + ' '}${advanceDays} ${pluralDays(advanceDays)} ${t('авансом')}` : '')
          : undefined}
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
        options={requestTypes.map(rt => ({ ...rt, name: t(rt.name), desc: rt.desc ? t(rt.desc) : rt.desc }))}
        onChange={v => { setType(v); setErrors(e => ({ ...e, type: undefined })) }}
        error={errors.type}
        description={t('Если нужен отпуск на завтра, выбирайте вид отпуска «Без сохранения заработной платы»')}
      />

      {type === 'combined' && comboMax >= 1 && (
        <CounterField
          title={t('Списать дни дополнительного отпуска')}
          caption={`${t('Всего доступно')} ${balance.extra} ${pluralDays(balance.extra)}`}
          value={comboExtra}
          min={1}
          max={comboMax}
          onChange={setExtraCount}
        />
      )}

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
