import { useState, useMemo } from 'react'
import { COLLEAGUES } from '../data/mockData'
import { fmtDate } from '../utils/dateUtils'

const YEAR = 2026
const MONTH_NAMES_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
// Cumulative start day of each month (0-indexed from Jan 1)
const MONTH_START_DAY = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

const QUICK_FILTERS = [
  { key: 'year', label: 'Весь год', startDay: 0,   endDay: 364 },
  { key: 'q1',   label: 'I кв.',   startDay: 0,   endDay: 89  },
  { key: 'q2',   label: 'II кв.',  startDay: 90,  endDay: 180 },
  { key: 'q3',   label: 'III кв.', startDay: 181, endDay: 272 },
  { key: 'q4',   label: 'IV кв.',  startDay: 273, endDay: 364 },
]

function dayOfYear2026(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const yearStart = new Date(YEAR, 0, 1)
  return Math.floor((date - yearStart) / 86400000)
}

export default function ColleaguesPage() {
  const [filterKey, setFilterKey] = useState('year')
  const [monthFilter, setMonthFilter] = useState(null)

  const { startDay, endDay } = useMemo(() => {
    if (monthFilter !== null) {
      return {
        startDay: MONTH_START_DAY[monthFilter],
        endDay: MONTH_START_DAY[monthFilter] + DAYS_IN_MONTH[monthFilter] - 1,
      }
    }
    const f = QUICK_FILTERS.find(f => f.key === filterKey)
    return { startDay: f.startDay, endDay: f.endDay }
  }, [filterKey, monthFilter])

  const rangeDays = endDay - startDay + 1

  const visibleMonths = useMemo(() => (
    DAYS_IN_MONTH.map((days, m) => {
      const mStart = MONTH_START_DAY[m]
      const mEnd = mStart + days - 1
      const visStart = Math.max(mStart, startDay)
      const visEnd = Math.min(mEnd, endDay)
      if (visStart > visEnd) return null
      return {
        m,
        leftPct: ((visStart - startDay) / rangeDays) * 100,
        widthPct: ((visEnd - visStart + 1) / rangeDays) * 100,
      }
    }).filter(Boolean)
  ), [startDay, endDay, rangeDays])

  function getBarStyle(segStartStr, segEndStr) {
    const segStart = dayOfYear2026(segStartStr)
    const segEnd = dayOfYear2026(segEndStr)
    const visStart = Math.max(segStart, startDay)
    const visEnd = Math.min(segEnd, endDay)
    if (visStart > visEnd) return null
    return {
      left: `${((visStart - startDay) / rangeDays) * 100}%`,
      width: `${Math.max(((visEnd - visStart + 1) / rangeDays) * 100, 0.5)}%`,
    }
  }

  function getBarTitle(seg) {
    return `${fmtDate(seg.startDate)} — ${fmtDate(seg.endDate)}`
  }

  const isSingleMonth = monthFilter !== null
  const headerLabel = (m, widthPct) => {
    if (isSingleMonth) return MONTH_NAMES[m]
    if (widthPct > 12) return MONTH_NAMES_SHORT[m]
    if (widthPct > 5) return MONTH_NAMES_SHORT[m].slice(0, 1)
    return ''
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Коллеги</h1>
        <p className="text-sm text-gray-500 mt-0.5">График отпусков — Продуктовая разработка, {YEAR} год</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilterKey(f.key); setMonthFilter(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterKey === f.key && monthFilter === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {MONTH_NAMES_SHORT.map((m, i) => (
          <button
            key={i}
            onClick={() => { setMonthFilter(i); setFilterKey('year') }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              monthFilter === i
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Gantt chart */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Month header */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          <div className="w-44 shrink-0 px-4 py-2">
            <span className="text-xs text-gray-400 font-medium">Сотрудник</span>
          </div>
          <div className="flex-1 relative" style={{ height: 32 }}>
            {visibleMonths.map(({ m, leftPct, widthPct }) => (
              <div
                key={m}
                className="absolute flex items-center justify-center overflow-hidden border-l border-gray-200 text-xs text-gray-500 font-medium"
                style={{ left: `${leftPct}%`, width: `${widthPct}%`, top: 0, bottom: 0 }}
              >
                {headerLabel(m, widthPct)}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {COLLEAGUES.map(person => (
          <div
            key={person.id}
            className={`flex items-center border-b border-gray-50 last:border-b-0 ${
              person.isSelf ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'
            }`}
          >
            {/* Name column */}
            <div className="w-44 shrink-0 px-4 py-2 flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full ${person.colorClass} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
              >
                {person.initials}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate leading-tight ${person.isSelf ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {person.name.split(' ').slice(0, 2).join(' ')}
                </p>
                {person.isSelf && (
                  <p className="text-[10px] text-indigo-400 leading-tight">Вы</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative" style={{ height: 44 }}>
              {/* Month gridlines */}
              {visibleMonths.map(({ m, leftPct }) => (
                <div
                  key={m}
                  className="absolute inset-y-0 border-l border-gray-100"
                  style={{ left: `${leftPct}%` }}
                />
              ))}
              {/* Vacation bars */}
              {person.segments.map((seg, i) => {
                const style = getBarStyle(seg.startDate, seg.endDate)
                if (!style) return null
                return (
                  <div
                    key={i}
                    title={getBarTitle(seg)}
                    className={`absolute rounded-md ${person.colorClass} opacity-75 hover:opacity-95 transition-opacity cursor-default`}
                    style={{ ...style, top: 10, height: 24 }}
                  />
                )
              })}
              {/* Empty placeholder when no bars visible in range */}
              {person.segments.every(seg => !getBarStyle(seg.startDate, seg.endDate)) && (
                <div className="absolute inset-0 flex items-center">
                  <span className="text-[10px] text-gray-300 pl-2">нет отпуска в периоде</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-x-4 gap-y-1.5 flex-wrap">
        <span className="text-xs text-gray-400">Легенда:</span>
        {COLLEAGUES.map(person => (
          <div key={person.id} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${person.colorClass} opacity-75`} />
            <span className={`text-xs ${person.isSelf ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              {person.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
