import { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'
import { BTN_STYLE, PersonAvatar, SelectField, CalendarRange } from '../ds/index'

const MONTH_SHORT_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
function fmtShortDate(d) {
  const date = d instanceof Date ? d : new Date(String(d) + 'T00:00:00')
  return `${date.getDate()} ${MONTH_SHORT_RU[date.getMonth()]}`
}

const COLLEAGUE_SEGMENTS = COLLEAGUES.filter(c => !c.me).flatMap(c =>
  c.segments.map(s => ({ name: c.name, startDate: s.startDate, endDate: s.endDate }))
)

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

const REQUEST_TYPES = [
  { id: 'annual',       name: 'Ежегодный оплачиваемый',              desc: 'Списывается из баланса основного отпуска', deductsBalance: true  },
  { id: 'unpaid',       name: 'Без сохранения зарплаты',             desc: 'Не списывается из баланса',                deductsBalance: false },
  { id: 'study_paid',   name: 'Учебный оплачиваемый',                desc: 'Не списывается из баланса',                deductsBalance: false },
  { id: 'study_unpaid', name: 'Учебный без сохранения зарплаты',     desc: 'Не списывается из баланса',                deductsBalance: false },
]

const TYPE_LABEL_MAP = {
  annual:       'Внеплановый — ежегодный оплачиваемый',
  unpaid:       'Внеплановый — без сохранения зарплаты',
  study_paid:   'Внеплановый — учебный оплачиваемый',
  study_unpaid: 'Внеплановый — учебный без сохранения зарплаты',
}

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель', avatar: '/avatars/egor.webp' }
const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({ id: String(c.id), name: c.name, avatar: c.avatar }))

function fmt(d) {
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function PeriodField({ start, end, error, onClick }) {
  const hasValue = !!start
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
        Период
      </div>
      <div
        onClick={onClick}
        style={{
          height: 44,
          paddingLeft: 12,
          paddingRight: 8,
          background: '#F2F3F7',
          borderRadius: 16,
          outline: `1px ${error ? '#E30611' : 'rgba(188, 195, 208, 0.50)'} solid`,
          outlineOffset: '-1px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: '1 1 0', paddingRight: 4, overflow: 'hidden' }}>
          <div style={{ color: hasValue ? '#1D2023' : '#8C9BAB', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
            {hasValue
              ? `${fmt(start)}${end && end.getTime() !== start.getTime() ? ` – ${fmt(end)}` : ''}`
              : 'дд.мм.гггг – дд.мм.гггг'}
          </div>
        </div>
        <div style={{ padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.314 3.68597C15.609 2.98098 14.9055 2.62649 14 2.41921V1C14 0.447715 13.5523 0 13 0C12.4477 0 12 0.447715 12 1V2.15211C11.7111 2.12824 11.4044 2.10541 11.0772 2.08105C10.399 2.03058 9.69952 2 9 2C8.30048 2 7.60086 2.03059 6.92273 2.08106C6.59555 2.10541 6.28883 2.12824 6 2.15211V1C6 0.447715 5.55228 0 5 0C4.44772 0 4 0.447715 4 1V2.41921C3.09454 2.62649 2.39096 2.98098 1.68597 3.68597C0.373095 4.99884 0.275748 6.30684 0.0810531 8.92282C0.0305833 9.60095 0 10.3005 0 11C0 11.6995 0.0305834 12.399 0.0810532 13.0772C0.275748 15.6932 0.373095 17.0012 1.68597 18.314C2.99884 19.6269 4.30684 19.7243 6.92282 19.9189C7.60095 19.9694 8.30048 20 9 20C9.69952 20 10.399 19.9694 11.0772 19.9189C13.6932 19.7243 15.0012 19.6269 16.314 18.314C17.6269 17.0012 17.7243 15.6932 17.9189 13.0772C17.9694 12.399 18 11.6995 18 11C18 10.3005 17.9694 9.60095 17.9189 8.92282C17.7243 6.30684 17.6269 4.99884 16.314 3.68597ZM2.99706 8C2.44477 8 1.99706 8.44771 1.99706 9C1.99706 9.55228 2.44477 10 2.99706 10H14.9971C15.5493 10 15.9971 9.55228 15.9971 9C15.9971 8.44771 15.5493 8 14.9971 8H2.99706ZM11.9971 15.4C12.7703 15.4 13.3971 14.7732 13.3971 14C13.3971 13.2268 12.7703 12.6 11.9971 12.6C11.2239 12.6 10.5971 13.2268 10.5971 14C10.5971 14.7732 11.2239 15.4 11.9971 15.4Z" fill="#8D969F"/>
          </svg>
        </div>
      </div>
      {error && <span style={{ fontSize: 12, color: '#E30611', paddingLeft: 4 }}>{error}</span>}
    </div>
  )
}

function TextAreaField({ label, value, onChange, optional, description }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
        {label}
      </div>
      <textarea
        className="mts-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Введите комментарий"
        style={{
          width: '100%',
          height: 96,
          boxSizing: 'border-box',
          background: '#F2F3F7',
          outline: `1px ${focused ? '#0066FF' : 'rgba(188,195,208,0.50)'} solid`,
          outlineOffset: '-1px',
          border: 'none',
          borderRadius: 16,
          padding: '10px 12px',
          fontSize: 17,
          lineHeight: '24px',
          color: '#1D2023',
          fontFamily: "'MTSCompact', sans-serif",
          resize: 'none',
          display: 'block',
        }}
      />
      {(description || optional) && (
        <div style={{ color: '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '16px' }}>
          {description || 'Необязательно'}
        </div>
      )}
    </div>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: `2px solid ${checked ? '#0066FF' : '#BCC3D0'}`, background: checked ? '#0066FF' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      >
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023' }}>{label}</span>
    </label>
  )
}

export default function NewRequestModal({ onClose }) {
  const { requests, setRequests, balance, setBalance } = useApp()
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarRect, setCalendarRect] = useState(null)
  const periodRef = useRef(null)
  const [comment, setComment] = useState('')
  const [changeApprover, setChangeApprover] = useState(false)
  const [approverOverride, setApproverOverride] = useState('')
  const [substitute, setSubstitute] = useState('')
  const [addExtraApprover, setAddExtraApprover] = useState(false)
  const [extraApprover, setExtraApprover] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const selectedType = REQUEST_TYPES.find(t => t.id === type)

  const colleagueOverlaps = useMemo(() => {
    if (!startDate) return []
    const end = endDate || startDate
    const sd = new Date(startDate); sd.setHours(0,0,0,0)
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
  }, [startDate, endDate])

  const previewDays = useMemo(() => {
    if (!startDate || !endDate) return null
    try {
      if (endDate < startDate) return null
      return countVacationDays(startDate, endDate)
    } catch {
      return null
    }
  }, [startDate, endDate])

  function validate() {
    const errs = {}
    if (!type) errs.type = 'Выберите тип отпуска'
    if (!startDate) {
      errs.dates = 'Укажите период'
    } else if (selectedType?.deductsBalance && previewDays !== null && previewDays > balance.main) {
      errs.dates = `Недостаточно дней: нужно ${pluralDays(previewDays)}, доступно ${pluralDays(balance.main)}`
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
      extraApprover: (addExtraApprover && extraApprover) ? extraApprover : undefined,
    }
    setRequests(prev => [newReq, ...prev])
    if (selectedType.deductsBalance) {
      setBalance(prev => ({ ...prev, main: Math.max(0, prev.main - previewDays) }))
    }
    setSubmitted(true)
  }

  const approverColleague = approverOverride ? COLLEAGUES.find(c => String(c.id) === approverOverride) : null
  const approverName = approverColleague?.name ?? DEFAULT_APPROVER.name
  const approverAvatar = approverColleague?.avatar ?? DEFAULT_APPROVER.avatar

  const Overlay = ({ children, onClick }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClick}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )

  if (submitted) {
    return (
      <Overlay onClick={onClose}>
        <div style={{ width: 480, background: '#fff', borderRadius: 32, padding: '32px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ paddingLeft: 16, paddingRight: 16, display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'stretch' }}>
            <div style={{ textAlign: 'center', color: '#1D2023', fontSize: 20, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '24px' }}>Заявка отправлена</div>
            <div style={{ textAlign: 'center', color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>
              Заявка передана на согласование руководителю{addExtraApprover && extraApprover ? ' и дополнительному согласующему' : ''}.
            </div>
          </div>
          <div style={{ alignSelf: 'stretch', paddingTop: 24 }}>
            <button onClick={onClose} style={{ width: '100%', height: 52, background: '#0066FF', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE }}>ЗАКРЫТЬ</button>
          </div>
        </div>
      </Overlay>
    )
  }

  return (
    <>
      <Overlay onClick={onClose}>
        <div
          className="modal-scroll"
          style={{ width: 560, maxHeight: '90vh', background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'MTSCompact', sans-serif" }}
        >
          {/* Header */}
          <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 500, fontFamily: "'MTSWide', sans-serif", color: '#1D2023', lineHeight: '24px' }}>Заявка на внеплановый отпуск</div>
            <button onClick={onClose} style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C9BAB', fontSize: 18, borderRadius: 8, padding: 0, lineHeight: 1 }}>✕</button>
          </div>

          {/* Body */}
          <div className="modal-scroll" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

            {/* Период */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div ref={periodRef}>
                <PeriodField
                  start={startDate} end={endDate}
                  error={errors.dates}
                  onClick={() => {
                    setCalendarRect(periodRef.current?.getBoundingClientRect())
                    setShowCalendar(true)
                  }}
                />
              </div>
              {!errors.dates && previewDays !== null && (
                <span style={{ fontSize: 12, lineHeight: '16px', color: '#8C9BAB', paddingLeft: 4 }}>
                  {pluralDays(previewDays)} отпуска (праздники не считаются)
                </span>
              )}
              <ColleaguesOverlapBanner overlaps={colleagueOverlaps} />
            </div>

            {/* Тип отпуска */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SelectField
                label="Тип отпуска"
                value={type}
                options={REQUEST_TYPES}
                placeholder="Выберите тип отпуска"
                onChange={v => { setType(v); setErrors(e => ({ ...e, type: undefined })) }}
              />
              {errors.type && <span style={{ fontSize: 12, color: '#E30611', paddingLeft: 4 }}>{errors.type}</span>}
              {selectedType && (
                <span style={{ fontSize: 12, lineHeight: '16px', color: '#8C9BAB', paddingLeft: 4 }}>
                  {selectedType.desc}{selectedType.deductsBalance && ` · Баланс: ${balance.main} дн.`}
                </span>
              )}
            </div>

            {/* Заместитель */}
            <SelectField
              label="Заместитель"
              value={substitute}
              options={APPROVER_OPTIONS}
              placeholder="Добавьте заместителя"
              onChange={setSubstitute}
              searchable
            />

            {/* Комментарий */}
            <TextAreaField label="Комментарий" value={comment} onChange={setComment} description="До 255 символов" />

            {/* Согласующий */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '20px', color: '#626C77', textTransform: 'uppercase' }}>Согласующий</span>
              {changeApprover ? (
                <SelectField
                  value={approverOverride}
                  options={APPROVER_OPTIONS}
                  placeholder="Выберите согласующего"
                  onChange={v => { setApproverOverride(v); setChangeApprover(false) }}
                  searchable
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <PersonAvatar src={approverAvatar} />
                    <div>
                      <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023' }}>{approverName}</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#626C77' }}>{DEFAULT_APPROVER.role}</div>
                    </div>
                  </div>
                  <button onClick={() => setChangeApprover(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M13.4788 0.00746568C12.8251 0.0598684 12.4177 0.412273 11.6029 1.11708C10.2959 2.24773 8.44909 3.88863 6.94648 5.39079C5.44386 6.89294 3.80245 8.73915 2.67146 10.0458C2.36674 10.3978 2.12788 10.6738 1.95063 10.9264C1.62569 11.3329 1.3956 12.0901 1.04235 13.2527L0.514634 14.9895C0.0352647 16.5671 -0.20442 17.356 0.219899 17.7802C0.644215 18.2044 1.43328 17.9647 3.01141 17.4855L4.74876 16.958C5.98041 16.584 6.75726 16.3481 7.14413 15.9914C7.37696 15.8205 7.633 15.599 7.95112 15.3238C9.25816 14.1932 11.1049 12.5523 12.6076 11.0501C14.1102 9.54797 15.7516 7.70176 16.8826 6.39512C17.5876 5.58061 17.9401 5.17335 17.9925 4.5198C18.045 3.86626 17.8198 3.50177 17.3694 2.77279C17.1126 2.35721 16.8011 1.93356 16.4335 1.56604C16.0658 1.19852 15.6421 0.887124 15.2264 0.630439C14.4972 0.180188 14.1326 -0.044937 13.4788 0.00746568ZM3.52706 12.1618C3.52875 12.1586 3.53037 12.1553 3.53037 12.1553L3.55327 12.1267L3.58928 12.0753C3.69511 11.9245 3.85677 11.7342 4.18498 11.3551C5.30704 10.0587 6.91096 8.25596 8.36174 6.80562C8.92296 6.24458 9.53693 5.66063 10.1539 5.09052L12.9079 7.84366C12.3376 8.46047 11.7535 9.07425 11.1923 9.63529C9.7415 11.0856 7.93817 12.6891 6.64145 13.8108C6.30277 14.1038 6.11386 14.2653 5.95974 14.3784L5.86948 14.4447L5.83526 14.4762C5.80512 14.4918 5.7214 14.5337 5.55359 14.5973C5.23461 14.7182 4.80697 14.8491 4.16704 15.0435L2.42973 15.571L2.95744 13.8342C3.14021 13.2327 3.26737 12.8169 3.3848 12.4988C3.46465 12.2825 3.51381 12.1875 3.52706 12.1618ZM14.2529 6.35858C14.6566 5.90447 15.0343 5.47262 15.3691 5.08586C15.5507 4.87603 15.6844 4.72134 15.7954 4.58529C15.8863 4.474 15.9421 4.39913 15.9773 4.34739C15.9645 4.32261 15.9473 4.29098 15.9246 4.2511C15.8623 4.14167 15.7843 4.01494 15.6665 3.82424C15.4664 3.50036 15.2472 3.20983 15.0182 2.98087C14.7892 2.75192 14.4986 2.53283 14.1746 2.33278C13.9838 2.21499 13.8571 2.13703 13.7476 2.07474C13.7077 2.05205 13.6761 2.03491 13.6513 2.02203C13.5995 2.0573 13.5246 2.11309 13.4133 2.2039C13.2772 2.31493 13.1225 2.44857 12.9126 2.63014C12.5257 2.96481 12.0937 3.34236 11.6395 3.74593L14.2529 6.35858Z" fill="#8D969F"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Дополнительный согласующий */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Checkbox checked={addExtraApprover} onChange={v => { setAddExtraApprover(v); if (!v) setExtraApprover('') }} label="Добавить дополнительного согласующего" />
              {addExtraApprover && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '20px', color: '#626C77', textTransform: 'uppercase' }}>Дополнительный согласующий</span>
                  {extraApprover ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <PersonAvatar src={APPROVER_OPTIONS.find(o => o.id === extraApprover)?.avatar} />
                        <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023' }}>
                          {APPROVER_OPTIONS.find(o => o.id === extraApprover)?.name}
                        </div>
                      </div>
                      <button onClick={() => setExtraApprover('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M0.292893 10.2929C-0.0976311 10.6834 -0.0976311 11.3166 0.292893 11.7071C0.683418 12.0976 1.31658 12.0976 1.70711 11.7071L5.99993 7.41429L10.2929 11.7073C10.6834 12.0978 11.3166 12.0978 11.7071 11.7073C12.0976 11.3167 12.0976 10.6836 11.7071 10.293L7.41414 6.00007L11.7071 1.70711C12.0976 1.31658 12.0976 0.683417 11.7071 0.292893C11.3166 -0.0976313 10.6834 -0.0976309 10.2929 0.292894L5.99992 4.58586L1.70711 0.293045C1.31658 -0.0974801 0.683419 -0.0974798 0.292895 0.293044C-0.0976297 0.683569 -0.0976293 1.31673 0.292895 1.70726L4.58571 6.00007L0.292893 10.2929Z" fill="#8D969F"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <SelectField
                      value={extraApprover}
                      options={APPROVER_OPTIONS}
                      placeholder="Выберите согласующего"
                      onChange={setExtraApprover}
                      searchable
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 28px 28px', flexShrink: 0 }}>
            <button onClick={handleSubmit} style={{ width: '100%', height: 52, background: '#0066FF', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE }}>
              ОТПРАВИТЬ НА СОГЛАСОВАНИЕ
            </button>
          </div>
        </div>
      </Overlay>

      {/* Calendar dropdown */}
      {showCalendar && calendarRect && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 600 }}
          onClick={() => setShowCalendar(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: calendarRect.bottom + 4,
              left: calendarRect.left,
            }}
          >
            <CalendarRange
              initialStart={startDate}
              initialEnd={endDate}
              colleagueSegments={COLLEAGUE_SEGMENTS}
              onApply={(s, e) => {
                setStartDate(s)
                setEndDate(e)
                setErrors(prev => ({ ...prev, dates: undefined }))
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
