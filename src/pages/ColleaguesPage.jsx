import { useState, useMemo } from 'react'
import { COLLEAGUES } from '../data/mockData'

const YEAR = 2026
const MONTH_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

const PERSON_COLORS = [
  'bg-indigo-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400',
  'bg-rose-400',   'bg-purple-400', 'bg-teal-400', 'bg-orange-400',
]

const LEGEND_COLORS = [
  'bg-indigo-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400',
  'bg-rose-400',   'bg-purple-400', 'bg-teal-400', 'bg-orange-400',
]

function daysInMonth(month) {
  return new Date(YEAR, month + 1, 0).getDate()
}

const QUARTER_RANGES = [
  { months: [0, 1, 2],  label: 'Q1' },
  { months: [3, 4, 5],  label: 'Q2' },
  { months: [6, 7, 8],  label: 'Q3' },
  { months: [9, 10, 11], label: 'Q4' },
]

export default function ColleaguesPage() {
  const [filter, setFilter] = useState('year') // 'year' | 'q0'–'q3' | 'm0'–'m11'

  const { rangeStart, rangeEnd, visibleMonths } = useMemo(() => {
    if (filter === 'year') {
      return {
        rangeStart: new Date(YEAR, 0, 1),
        rangeEnd:   new Date(YEAR, 11, 31),
        visibleMonths: Array.from({ length: 12 }, (_, i) => i),
      }
    }
    if (filter.startsWith('q')) {
      const qi = parseInt(filter[1])
      const startM = qi * 3
      return {
        rangeStart: new Date(YEAR, startM, 1),
        rangeEnd:   new Date(YEAR, startM + 3, 0),
        visibleMonths: [startM, startM + 1, startM + 2],
      }
    }
    const m = parseInt(filter.slice(1))
    return {
      rangeStart: new Date(YEAR, m, 1),
      rangeEnd:   new Date(YEAR, m + 1, 0),
      visibleMonths: [m],
    }
  }, [filter])

  const rangeDays = Math.round((rangeEnd - rangeStart) / 86400000) + 1
  const totalMonthDays = visibleMonths.reduce((s, m) => s + daysInMonth(m), 0)

  function getBar(segStart, segEnd) {
    const s = new Date(segStart + 'T00:00:00')
    const e = new Date(segEnd + 'T00:00:00')
    const clampStart = s < rangeStart ? rangeStart : s
    const clampEnd   = e > rangeEnd   ? rangeEnd   : e
    if (clampStart > rangeEnd || clampEnd < rangeStart) return null
    const offset   = Math.round((clampStart - rangeStart) / 86400000)
    const duration = Math.round((clampEnd - clampStart) / 86400000) + 1
    return {
      left:  `${(offset / rangeDays) * 100}%`,
      width: `${(duration / rangeDays) * 100}%`,
    }
  }

  const hasAnyVacation = COLLEAGUES.some(c =>
    c.segments.some(seg => {
      const s = new Date(seg.startDate + 'T00:00:00')
      const e = new Date(seg.endDate   + 'T00:00:00')
      return s <= rangeEnd && e >= rangeStart
    })
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-5">Отпуска коллег {YEAR}</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setFilter('year')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'year' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Весь год
        </button>
        {QUARTER_RANGES.map((q, qi) => (
          <button
            key={q.label}
            onClick={() => setFilter(`q${qi}`)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === `q${qi}` ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {q.label}
          </button>
        ))}
        {MONTH_SHORT.map((name, mi) => (
          <button
            key={mi}
            onClick={() => setFilter(`m${mi}`)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === `m${mi}` ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Gantt */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Month header row */}
        <div className="flex border-b border-gray-100">
          <div className="w-32 shrink-0 border-r border-gray-100" />
          <div className="flex-1 flex">
            {visibleMonths.map(m => (
              <div
                key={m}
                style={{ width: `${(daysInMonth(m) / totalMonthDays) * 100}%` }}
                className="text-[11px] text-gray-400 font-medium py-2 text-center border-r border-gray-50 last:border-r-0"
              >
                {MONTH_SHORT[m]}
              </div>
            ))}
          </div>
        </div>

        {!hasAnyVacation ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Нет отпусков в этом периоде</p>
            <p className="text-sm text-gray-400">
              {filter === 'year'
                ? 'Никто из коллег ещё не распланировал отпуска на этот год'
                : 'Никто из коллег не запланировал отпуск в выбранном периоде'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {COLLEAGUES.map((person, pi) => {
              const bars = person.segments
                .map(seg => ({ style: getBar(seg.startDate, seg.endDate), seg }))
                .filter(b => b.style !== null)

              return (
                <div key={person.id} className="flex items-center h-11">
                  <div className="w-32 shrink-0 px-3 border-r border-gray-100 h-full flex flex-col justify-center">
                    <span className="text-xs font-medium text-gray-700 leading-tight truncate">
                      {person.name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate">
                      {person.name.split(' ')[1]}
                    </span>
                  </div>
                  <div className="flex-1 relative h-full px-1">
                    {bars.map(({ style, seg }, bi) => (
                      <div
                        key={bi}
                        className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full opacity-80 ${
                          PERSON_COLORS[pi % PERSON_COLORS.length]
                        }`}
                        style={style}
                        title={`${person.name}: ${seg.startDate} — ${seg.endDate}`}
                      />
                    ))}
                    {bars.length === 0 && (
                      <span className="absolute inset-0 flex items-center px-2">
                        <span className="text-[11px] text-gray-300">нет отпуска</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      {hasAnyVacation && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {COLLEAGUES.map((person, pi) => (
            <div key={person.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${LEGEND_COLORS[pi % LEGEND_COLORS.length]}`} />
              <span className="text-xs text-gray-600">
                {person.name}{person.me ? ' (я)' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
