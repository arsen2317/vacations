import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'

const REQUEST_TYPES = [
  {
    key: 'annual',
    label: 'Ежегодный оплачиваемый',
    desc: 'Списывается из баланса основного отпуска',
    deductsBalance: true,
  },
  {
    key: 'unpaid',
    label: 'Без сохранения зарплаты',
    desc: 'Не списывается из баланса',
    deductsBalance: false,
  },
  {
    key: 'study_paid',
    label: 'Учебный оплачиваемый',
    desc: 'Не списывается из баланса',
    deductsBalance: false,
  },
  {
    key: 'study_unpaid',
    label: 'Учебный без сохранения зарплаты',
    desc: 'Не списывается из баланса',
    deductsBalance: false,
  },
]

const TYPE_LABEL_MAP = {
  annual:      'Внеплановый — ежегодный оплачиваемый',
  unpaid:      'Внеплановый — без сохранения зарплаты',
  study_paid:  'Внеплановый — учебный оплачиваемый',
  study_unpaid:'Внеплановый — учебный без сохранения зарплаты',
}

export default function NewRequestModal({ onClose }) {
  const { requests, setRequests, balance, setBalance } = useApp()
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')
  const [extraApprover, setExtraApprover] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const selectedType = REQUEST_TYPES.find(t => t.key === type)

  const previewDays = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return null
    try {
      return countVacationDays(
        new Date(startDate + 'T00:00:00'),
        new Date(endDate + 'T00:00:00'),
      )
    } catch {
      return null
    }
  }, [startDate, endDate])

  function validate() {
    const errs = {}
    if (!type) errs.type = 'Выберите тип отпуска'
    if (!startDate) errs.startDate = 'Укажите дату начала'
    if (!endDate) errs.endDate = 'Укажите дату окончания'
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'Дата окончания раньше даты начала'
    }
    if (
      selectedType?.deductsBalance &&
      previewDays !== null &&
      previewDays > balance.main
    ) {
      errs.dates = `Недостаточно дней: нужно ${pluralDays(previewDays)}, доступно ${pluralDays(balance.main)}`
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const newReq = {
      id: Date.now(),
      type: 'unplanned',
      typeLabel: TYPE_LABEL_MAP[type],
      startDate: new Date(startDate + 'T00:00:00'),
      endDate: new Date(endDate + 'T00:00:00'),
      days: previewDays,
      status: 'pending',
      comment: comment || undefined,
      extraApprover: extraApprover || undefined,
    }
    setRequests(prev => [newReq, ...prev])
    if (selectedType.deductsBalance) {
      setBalance(prev => ({ ...prev, main: Math.max(0, prev.main - previewDays) }))
    }
    setSubmitted(true)
  }

  const approvers = COLLEAGUES.filter(c => !c.me)

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Заявка отправлена</h2>
          <p className="text-sm text-gray-500 mb-6">
            Заявка передана на согласование руководителю
            {extraApprover ? ' и дополнительному согласующему' : ''}.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Новая заявка</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Тип отпуска</label>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setErrors(errs => ({ ...errs, type: undefined })) }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="">Выберите тип отпуска</option>
              {REQUEST_TYPES.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            {selectedType && (
              <p className="text-xs text-gray-500 mt-1.5">{selectedType.desc}</p>
            )}
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
          </div>

          {/* Dates */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Период</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Начало</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setErrors(errs => ({ ...errs, startDate: undefined, dates: undefined })) }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Окончание</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={e => { setEndDate(e.target.value); setErrors(errs => ({ ...errs, endDate: undefined, dates: undefined })) }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
            {previewDays !== null && !errors.dates && (
              <p className="text-xs text-indigo-600 mt-1.5">
                {pluralDays(previewDays)} отпуска (праздники не считаются)
                {selectedType?.deductsBalance && (
                  <span className="text-gray-400"> · Баланс: {balance.main} дн.</span>
                )}
              </p>
            )}
            {errors.dates && <p className="text-xs text-red-500 mt-1.5">{errors.dates}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Комментарий{' '}
              <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Причина или дополнительная информация"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
            />
          </div>

          {/* Extra approver */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Дополнительный согласующий{' '}
              <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <select
              value={extraApprover}
              onChange={e => setExtraApprover(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="">Не назначать</option>
              {approvers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Отправить на согласование
          </button>
        </div>
      </div>
    </div>
  )
}
