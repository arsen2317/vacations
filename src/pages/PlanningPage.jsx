import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, toKey, fmtDate, pluralDays } from '../utils/dateUtils'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getHighlightedSet(segments) {
  const set = new Set()
  for (const s of segments) {
    const cur = new Date(s.startDate + 'T00:00:00')
    const end = new Date(s.endDate + 'T00:00:00')
    while (cur <= end) {
      set.add(toKey(cur))
      cur.setDate(cur.getDate() + 1)
    }
  }
  return set
}

function MonthMini({ year, month, highlighted }) {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  let startDow = first.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const cells = Array(startDow).fill(null)
  for (let d = 1; d <= lastDay; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-600 mb-1">{MONTH_NAMES[month]}</p>
      <div className="grid grid-cols-7">
        {DAY_SHORT.map(d => (
          <span key={d} className="text-[9px] text-gray-400 text-center leading-4">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`n${i}`} className="leading-5" />
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isHl = highlighted.has(key)
          const isWeekend = (i % 7) >= 5
          return (
            <span
              key={i}
              className={`text-[10px] text-center leading-5 rounded-[2px] ${
                isHl
                  ? 'bg-indigo-500 text-white font-medium'
                  : isWeekend
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}
            >
              {day}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function PlanningPage() {
  const { campaign, segments, setSegments, draftSaved, setDraftSaved } = useApp()
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [addError, setAddError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const year = campaign.year
  const distributedDays = useMemo(
    () => segments.reduce((acc, s) => acc + s.days, 0),
    [segments],
  )
  const remainingDays = campaign.totalDays - distributedDays
  const hasLongSegment = segments.some(s => s.days >= 14)
  const canSubmit = remainingDays === 0 && hasLongSegment
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])
  const progressPct = Math.round((distributedDays / campaign.totalDays) * 100)

  const previewDays = useMemo(() => {
    if (!newStart || !newEnd || newStart > newEnd) return null
    try {
      return countVacationDays(
        new Date(newStart + 'T00:00:00'),
        new Date(newEnd + 'T00:00:00'),
      )
    } catch {
      return null
    }
  }, [newStart, newEnd])

  if (!campaign.active) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">Кампания по планированию не активна</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Распределение дней отпуска доступно только в период активной кампании.
          Следите за уведомлениями — HR-админ сообщит о её начале.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">План отправлен на согласование</h2>
        <p className="text-sm text-gray-500">Ожидайте ответа руководителя</p>
      </div>
    )
  }

  function addSegment() {
    setAddError('')
    if (!newStart || !newEnd) { setAddError('Укажите обе даты'); return }
    if (newStart > newEnd) { setAddError('Дата начала должна быть раньше даты окончания'); return }
    const start = new Date(newStart + 'T00:00:00')
    const end = new Date(newEnd + 'T00:00:00')
    if (start.getFullYear() !== year || end.getFullYear() !== year) {
      setAddError(`Даты должны быть в ${year} году`); return
    }
    for (const s of segments) {
      const sStart = new Date(s.startDate + 'T00:00:00')
      const sEnd = new Date(s.endDate + 'T00:00:00')
      if (start <= sEnd && end >= sStart) {
        setAddError('Период пересекается с существующим отрезком'); return
      }
    }
    const days = countVacationDays(start, end)
    if (days > remainingDays) {
      setAddError(`Отрезок займёт ${pluralDays(days)}, осталось только ${pluralDays(remainingDays)}`); return
    }
    const seg = { id: Date.now(), startDate: newStart, endDate: newEnd, days }
    setSegments(prev => [...prev, seg].sort((a, b) => a.startDate.localeCompare(b.startDate)))
    setNewStart('')
    setNewEnd('')
    setDraftSaved(false)
  }

  function removeSegment(id) {
    setSegments(prev => prev.filter(s => s.id !== id))
    setDraftSaved(false)
  }

  const submitBlockers = []
  if (remainingDays > 0) submitBlockers.push(`нераспределено ${pluralDays(remainingDays)}`)
  if (!hasLongSegment) submitBlockers.push('нет отрезка ≥ 14 дней')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">
          Планирование отпуска на {year} год
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Один из отрезков должен быть не менее 14 дней
        </p>
      </div>

      {/* Dual view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ── Left panel: segments + actions ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">

          {/* Panel header with progress */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Отрезки отпуска</h2>
              <span className={`text-xs font-medium ${
                remainingDays === 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {remainingDays === 0
                  ? 'Все дни распределены ✓'
                  : `Осталось: ${pluralDays(remainingDays)}`
                }
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  remainingDays === 0 ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-gray-400">{distributedDays} из {campaign.totalDays} дней</span>
              <span className="text-[11px] text-gray-400">{progressPct}%</span>
            </div>
          </div>

          {/* Segments list */}
          <div className="divide-y divide-gray-50">
            {segments.length === 0 ? (
              <p className="px-4 py-5 text-sm text-gray-400 text-center">Нет добавленных отрезков</p>
            ) : (
              segments.map((seg, i) => (
                <div key={seg.id} className="flex items-center px-4 py-3 gap-3">
                  <span className="text-xs text-gray-300 w-4 shrink-0 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pluralDays(seg.days)}
                      {seg.days >= 14 && (
                        <span className="ml-2 text-green-600 font-medium">✓ ≥ 14 дней</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSegment(seg.id)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add form */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
            <p className="text-xs font-medium text-gray-600">Добавить отрезок</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block mb-0.5">Начало</label>
                <input
                  type="date"
                  value={newStart}
                  min={`${year}-01-01`}
                  max={`${year}-12-31`}
                  onChange={e => { setNewStart(e.target.value); setAddError('') }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block mb-0.5">Конец</label>
                <input
                  type="date"
                  value={newEnd}
                  min={newStart || `${year}-01-01`}
                  max={`${year}-12-31`}
                  onChange={e => { setNewEnd(e.target.value); setAddError('') }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            {previewDays !== null && !addError && (
              <p className="text-xs text-indigo-600">
                {pluralDays(previewDays)} отпуска (праздники не считаются)
                {previewDays > remainingDays && (
                  <span className="text-amber-600"> — превышает остаток</span>
                )}
              </p>
            )}
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <button
              onClick={addSegment}
              disabled={!newStart || !newEnd}
              className="w-full py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Добавить
            </button>
          </div>

          {/* Panel footer: draft + submit */}
          <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 bg-white">
            <button
              onClick={() => setDraftSaved(true)}
              className="flex-1 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {draftSaved ? '✓ Черновик сохранён' : 'Сохранить черновик'}
            </button>

            <div className="relative group flex-1">
              <button
                onClick={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
                className="w-full py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Отправить на согласование
              </button>
              {!canSubmit && (
                <div className="absolute bottom-full left-0 right-0 mb-2 z-10 hidden group-hover:block pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 text-center shadow-lg">
                    {submitBlockers.join(' · ')}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel: calendar ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Календарь {year}</h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 480 }}>
            <div className="grid grid-cols-3 gap-x-4 gap-y-5">
              {Array.from({ length: 12 }, (_, m) => (
                <MonthMini key={m} year={year} month={m} highlighted={highlighted} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
