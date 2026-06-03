import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'
import { BTN_STYLE, PersonAvatar, SelectField, CalendarRange } from '../ds/index'

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
              : 'ДД.ММ.ГГГГ – ДД.ММ.ГГГГ'}
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

function TextAreaField({ label, value, onChange, optional }) {
  const [focused, setFocused] = useState(false)
  const hasValue = !!value
  const isFloated = hasValue || focused

  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute',
        left: 16,
        top: isFloated ? 10 : 20,
        fontSize: isFloated ? 13 : 17,
        lineHeight: isFloated ? '18px' : '24px',
        color: '#8C9BAB',
        transition: 'all 0.15s ease',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {label}
        {optional && <span style={{ fontSize: 12, marginLeft: 6 }}>(необязательно)</span>}
      </span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#F2F3F7',
          border: `1px solid ${focused ? '#0066FF' : 'rgba(188,195,208,0.25)'}`,
          borderRadius: 16,
          padding: isFloated ? '32px 16px 14px' : '20px 16px',
          fontSize: 17,
          lineHeight: '24px',
          color: '#1D2023',
          fontFamily: "'MTSCompact', sans-serif",
          outline: 'none',
          resize: 'none',
          transition: 'border-color 0.15s, padding 0.15s',
          display: 'block',
        }}
      />
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
  const [comment, setComment] = useState('')
  const [changeApprover, setChangeApprover] = useState(false)
  const [approverOverride, setApproverOverride] = useState('')
  const [addExtraApprover, setAddExtraApprover] = useState(false)
  const [extraApprover, setExtraApprover] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const selectedType = REQUEST_TYPES.find(t => t.id === type)

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
            <div style={{ fontSize: 20, fontWeight: 500, fontFamily: "'MTSWide', sans-serif", color: '#1D2023', lineHeight: '24px' }}>Новая заявка</div>
            <button onClick={onClose} style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C9BAB', fontSize: 18, borderRadius: 8, padding: 0, lineHeight: 1 }}>✕</button>
          </div>

          {/* Body */}
          <div className="modal-scroll" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

            {/* Тип отпуска */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SelectField
                label="Тип отпуска"
                value={type}
                options={REQUEST_TYPES}
                onChange={v => { setType(v); setErrors(e => ({ ...e, type: undefined })) }}
              />
              {errors.type && <span style={{ fontSize: 12, color: '#E30611', paddingLeft: 4 }}>{errors.type}</span>}
              {selectedType && (
                <span style={{ fontSize: 12, lineHeight: '16px', color: '#8C9BAB', paddingLeft: 4 }}>
                  {selectedType.desc}{selectedType.deductsBalance && ` · Баланс: ${balance.main} дн.`}
                </span>
              )}
            </div>

            {/* Период */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <PeriodField
                start={startDate} end={endDate}
                error={errors.dates}
                onClick={() => setShowCalendar(true)}
              />
              {!errors.dates && previewDays !== null && (
                <span style={{ fontSize: 12, lineHeight: '16px', color: '#8C9BAB', paddingLeft: 4 }}>
                  {pluralDays(previewDays)} отпуска (праздники не считаются)
                </span>
              )}
            </div>

            {/* Комментарий */}
            <TextAreaField label="Комментарий" value={comment} onChange={setComment} optional />

            {/* Согласующий */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 14, lineHeight: '20px', color: '#8C9BAB' }}>Согласующий</span>
              {!changeApprover ? (
                <div style={{ background: '#F2F3F7', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <PersonAvatar src={approverAvatar} />
                    <div>
                      <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023' }}>{approverName}</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#626C77' }}>{DEFAULT_APPROVER.role}</div>
                    </div>
                  </div>
                  <button onClick={() => setChangeApprover(true)} style={{ border: 'none', background: 'none', color: '#0066FF', fontSize: 14, lineHeight: '20px', cursor: 'pointer', padding: '4px 0', fontFamily: "'MTSCompact', sans-serif" }}>
                    Изменить
                  </button>
                </div>
              ) : (
                <SelectField label="Согласующий" value={approverOverride} options={APPROVER_OPTIONS} onChange={setApproverOverride} searchable />
              )}
            </div>

            {/* Дополнительный согласующий */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Checkbox checked={addExtraApprover} onChange={setAddExtraApprover} label="Добавить дополнительного согласующего" />
              {addExtraApprover && (
                <SelectField label="Дополнительный согласующий" value={extraApprover} options={APPROVER_OPTIONS} onChange={setExtraApprover} searchable />
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

      {/* Calendar overlay */}
      {showCalendar && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}
          onClick={() => setShowCalendar(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <CalendarRange
              initialStart={startDate}
              initialEnd={endDate}
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
