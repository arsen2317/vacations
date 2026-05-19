import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { countVacationDays, toKey, fmtDate, pluralDays } from '../utils/dateUtils'

// Fixed "today" for prototype demo — matches mock data year
const TODAY = new Date('2026-05-19T00:00:00')

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const PLAN_LABELS = { draft: 'Черновик', pending: 'На согласовании', approved: 'Согласован' }

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

function segStatus(seg) {
  const start = new Date(seg.startDate + 'T00:00:00')
  const end = new Date(seg.endDate + 'T00:00:00')
  if (TODAY > end) return 'past'
  if (TODAY >= start) return 'ongoing'
  return 'upcoming'
}

function daysUntilStart(seg) {
  const start = new Date(seg.startDate + 'T00:00:00')
  return Math.ceil((start - TODAY) / 86400000)
}

const SEG_STATUS_UI = {
  past:     { label: 'Прошёл',    cls: 'bg-gray-100 text-gray-500' },
  ongoing:  { label: 'Идёт',      cls: 'bg-blue-100 text-blue-700' },
  upcoming: { label: 'Предстоит', cls: 'bg-indigo-50 text-indigo-600' },
}

// ── Pending view ──────────────────────────────────────────────────────────────

function PendingView({ segments, year }) {
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])
  return (
    <>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Планирование отпуска на {year} год</h1>
      </div>

      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Ожидает согласования</p>
          <p className="text-xs text-amber-600">План отправлен руководителю. Ожидайте ответа.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Отправленные отрезки</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {segments.length === 0 ? (
              <p className="px-4 py-5 text-sm text-gray-400 text-center">Нет отрезков</p>
            ) : segments.map((seg, i) => (
              <div key={seg.id} className="flex items-center px-4 py-3 gap-3">
                <span className="text-xs text-gray-300 w-4 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{pluralDays(seg.days)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
    </>
  )
}

// ── Approved view ─────────────────────────────────────────────────────────────

function ApprovedView({ segments, year, reschedules, setReschedules }) {
  const [expandedId, setExpandedId] = useState(null)
  const [rStart, setRStart] = useState('')
  const [rEnd, setREnd] = useState('')
  const [rError, setRError] = useState('')
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])

  function openReschedule(id) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      setRStart('')
      setREnd('')
      setRError('')
    }
  }

  function submitReschedule(seg) {
    setRError('')
    if (!rStart || !rEnd) { setRError('Укажите обе даты'); return }
    if (rStart > rEnd) { setRError('Дата начала должна быть раньше даты окончания'); return }
    const start = new Date(rStart + 'T00:00:00')
    const end = new Date(rEnd + 'T00:00:00')
    if (start.getFullYear() !== year || end.getFullYear() !== year) {
      setRError(`Даты должны быть в ${year} году`); return
    }
    for (const s of segments) {
      if (s.id === seg.id) continue
      const sStart = new Date(s.startDate + 'T00:00:00')
      const sEnd = new Date(s.endDate + 'T00:00:00')
      if (start <= sEnd && end >= sStart) {
        setRError('Период пересекается с другим отрезком'); return
      }
    }
    setReschedules(prev => ({
      ...prev,
      [seg.id]: {
        count: prev[seg.id]?.count ?? 0,
        pending: { startDate: rStart, endDate: rEnd },
      },
    }))
    setExpandedId(null)
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Согласованный план на {year} год</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Перенос возможен за 10 и более дней до начала — не более 2 переносов на отрезок
        </p>
      </div>

      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">План согласован</p>
          <p className="text-xs text-green-600">Руководитель одобрил ваш план отпуска на {year} год</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Segments list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Отрезки отпуска</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {segments.map((seg, i) => {
              const status = segStatus(seg)
              const { label: statusLabel, cls: statusCls } = SEG_STATUS_UI[status]
              const rInfo = reschedules[seg.id] ?? { count: 0, pending: null }
              const daysLeft = daysUntilStart(seg)

              const canReschedule =
                status === 'upcoming' && daysLeft >= 10 && rInfo.count < 2 && !rInfo.pending

              let cantReason = null
              if (!canReschedule) {
                if (status === 'past') cantReason = 'Отрезок уже прошёл'
                else if (status === 'ongoing') cantReason = 'Отрезок уже начался'
                else if (daysLeft < 10) cantReason = 'Менее 10 дней до начала'
                else if (rInfo.count >= 2) cantReason = 'Исчерпан лимит переносов (2/2)'
                else if (rInfo.pending) cantReason = 'Перенос уже на согласовании'
              }

              const isExpanded = expandedId === seg.id

              return (
                <div key={seg.id}>
                  <div className="flex items-center px-4 py-3 gap-3">
                    <span className="text-xs text-gray-300 w-4 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-500">{pluralDays(seg.days)}</span>
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${statusCls}`}>
                          {statusLabel}
                        </span>
                        {rInfo.count > 0 && (
                          <span className="text-[11px] text-gray-400">
                            Переносов: {rInfo.count}/2
                          </span>
                        )}
                        {rInfo.pending && (
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Перенос на согласовании
                          </span>
                        )}
                      </div>
                      {rInfo.pending && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Новые даты: {fmtDate(rInfo.pending.startDate)} — {fmtDate(rInfo.pending.endDate)}
                        </p>
                      )}
                    </div>

                    {/* Reschedule button */}
                    <div className="shrink-0">
                      {canReschedule ? (
                        <button
                          onClick={() => openReschedule(seg.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors ${
                            isExpanded
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {isExpanded ? 'Закрыть' : 'Перенести'}
                        </button>
                      ) : (
                        <div className="relative group">
                          <button
                            disabled
                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium border border-gray-200 text-gray-300 cursor-not-allowed"
                          >
                            Перенести
                          </button>
                          {cantReason && (
                            <div className="absolute right-0 bottom-full mb-2 z-10 hidden group-hover:block pointer-events-none">
                              <div className="bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                                {cantReason}
                                <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline reschedule form */}
                  {isExpanded && (
                    <div className="mx-4 mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-700 mb-2">Новые даты для отрезка</p>
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <label className="text-[11px] text-indigo-500 block mb-0.5">Начало</label>
                          <input
                            type="date"
                            value={rStart}
                            min={`${year}-01-01`}
                            max={`${year}-12-31`}
                            onChange={e => { setRStart(e.target.value); setRError('') }}
                            className="w-full px-2 py-1.5 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] text-indigo-500 block mb-0.5">Конец</label>
                          <input
                            type="date"
                            value={rEnd}
                            min={rStart || `${year}-01-01`}
                            max={`${year}-12-31`}
                            onChange={e => { setREnd(e.target.value); setRError('') }}
                            className="w-full px-2 py-1.5 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      </div>
                      {rError && <p className="text-xs text-red-500 mb-2">{rError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitReschedule(seg)}
                          className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                          Отправить на согласование
                        </button>
                        <button
                          onClick={() => { setExpandedId(null); setRError('') }}
                          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar */}
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
    </>
  )
}

// ── Main PlanningPage ─────────────────────────────────────────────────────────

export default function PlanningPage() {
  const {
    campaign, segments, setSegments, draftSaved, setDraftSaved,
    planStatus, setPlanStatus, approvedSegments, reschedules, setReschedules,
  } = useApp()
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [addError, setAddError] = useState('')

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

  // Demo state switcher — shown on all active states
  const demoSwitcher = (
    <div className="flex items-center gap-1 mb-5 p-1 bg-gray-100 rounded-lg w-fit">
      {['draft', 'pending', 'approved'].map(s => (
        <button
          key={s}
          onClick={() => setPlanStatus(s)}
          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            planStatus === s
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {PLAN_LABELS[s]}
        </button>
      ))}
      <span className="text-[10px] text-gray-400 mx-1.5 select-none">демо</span>
    </div>
  )

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

  if (planStatus === 'pending') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {demoSwitcher}
        <PendingView segments={segments} year={year} />
      </div>
    )
  }

  if (planStatus === 'approved') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {demoSwitcher}
        <ApprovedView
          segments={approvedSegments}
          year={year}
          reschedules={reschedules}
          setReschedules={setReschedules}
        />
      </div>
    )
  }

  // ── Draft state ──

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

  const canAdd = newStart && newEnd && newStart <= newEnd

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {demoSwitcher}

      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Планирование отпуска на {year} год</h1>
        <p className="text-sm text-gray-500 mt-0.5">Один из отрезков должен быть не менее 14 дней</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* Left panel */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">

          {/* Header with progress */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Отрезки отпуска</h2>
              <span className={`text-xs font-medium ${
                remainingDays === 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {remainingDays === 0 ? 'Все дни распределены ✓' : `Осталось: ${pluralDays(remainingDays)}`}
              </span>
            </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add form */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-2">
            <p className="text-xs font-medium text-gray-600">Добавить отрезок</p>
            <div className="flex gap-2 items-end">
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
              <button
                onClick={addSegment}
                disabled={!canAdd}
                title="Добавить отрезок"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
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
          </div>

          {/* Footer: draft + submit */}
          <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 bg-white">
            <button
              onClick={() => setDraftSaved(true)}
              className="flex-1 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {draftSaved ? '✓ Черновик сохранён' : 'Сохранить черновик'}
            </button>
            <div className="relative group flex-1">
              <button
                onClick={() => canSubmit && setPlanStatus('pending')}
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

        {/* Right panel: calendar */}
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
