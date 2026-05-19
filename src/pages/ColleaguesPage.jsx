import { useState, useMemo, useRef, useEffect } from 'react'
import { COLLEAGUES, ALL_EMPLOYEES, CURRENT_USER } from '../data/mockData'

const MONTH_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const SEG_COLORS = {
  approved:  { bar: '#4ade80', label: 'Согласован' },
  pending:   { bar: '#fbbf24', label: 'На согласовании' },
  reviewing: { bar: '#fb923c', label: 'На ознакомлении' },
  draft:     { bar: '#dbeafe', label: 'Черновик', border: '#bfdbfe' },
}

const AVATAR_COLORS = [
  '#6366f1','#0ea5e9','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#14b8a6','#f97316',
]

const COLLEAGUES_MAP = Object.fromEntries(COLLEAGUES.map(c => [c.id, c]))
const INITIAL_IDS = COLLEAGUES
  .filter(c => c.team === CURRENT_USER.team)
  .map(c => c.id)

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getRange(year, halfYear) {
  if (halfYear === 'h1') {
    return { start: new Date(year, 0, 1), end: new Date(year, 5, 30), months: [0,1,2,3,4,5] }
  }
  return { start: new Date(year, 6, 1), end: new Date(year, 11, 31), months: [6,7,8,9,10,11] }
}

function getBarStyle(segStart, segEnd, rangeStart, rangeEnd, totalDays) {
  const s = new Date(segStart + 'T00:00:00')
  const e = new Date(segEnd + 'T00:00:00')
  const cs = s < rangeStart ? rangeStart : s
  const ce = e > rangeEnd ? rangeEnd : e
  if (cs > rangeEnd || ce < rangeStart) return null
  const offset = Math.round((cs - rangeStart) / 86400000)
  const duration = Math.round((ce - cs) / 86400000) + 1
  return {
    left: `${(offset / totalDays) * 100}%`,
    width: `${(duration / totalDays) * 100}%`,
  }
}

export default function ColleaguesPage() {
  const [year, setYear] = useState(2026)
  const [halfYear, setHalfYear] = useState('h1')
  const [showDrafts, setShowDrafts] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [comparisonIds, setComparisonIds] = useState(INITIAL_IDS)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' })

  const tooltipTimer = useRef(null)
  const searchRef = useRef(null)

  const { start: rangeStart, end: rangeEnd, months: visibleMonths } = useMemo(
    () => getRange(year, halfYear),
    [year, halfYear],
  )

  const totalMonthDays = useMemo(
    () => visibleMonths.reduce((s, m) => s + daysInMonth(year, m), 0),
    [year, visibleMonths],
  )

  const rangeDays = Math.round((rangeEnd - rangeStart) / 86400000) + 1

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return ALL_EMPLOYEES
      .filter(e => !comparisonIds.includes(e.id) && e.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [searchQuery, comparisonIds])

  const comparisonPeople = useMemo(() => {
    return comparisonIds.map((id, idx) => {
      const col = COLLEAGUES_MAP[id]
      const emp = ALL_EMPLOYEES.find(e => e.id === id)
      const name = col?.name ?? emp?.name ?? `Сотрудник ${id}`
      const team = col?.team ?? emp?.team ?? ''
      const me = col?.me ?? false
      const allSegs = col?.segments ?? []
      const segments = showDrafts ? allSegs : allSegs.filter(s => s.status !== 'draft')
      return { id, idx, name, team, segments, me }
    })
  }, [comparisonIds, showDrafts])

  const presentStatuses = useMemo(() => {
    const set = new Set()
    for (const person of comparisonPeople) {
      for (const seg of person.segments) {
        const bar = getBarStyle(seg.startDate, seg.endDate, rangeStart, rangeEnd, rangeDays)
        if (bar) set.add(seg.status ?? 'approved')
      }
    }
    return ['approved', 'reviewing', 'pending', 'draft'].filter(s => set.has(s))
  }, [comparisonPeople, rangeStart, rangeEnd, rangeDays])

  function addPerson(emp) {
    setComparisonIds(prev => [...prev, emp.id])
    setSearchQuery('')
    setShowDropdown(false)
  }

  function removePerson(id) {
    setComparisonIds(prev => prev.filter(x => x !== id))
  }

  function handleMouseEnter(e, text) {
    const x = e.clientX
    const y = e.clientY
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ visible: true, x, y, text })
    }, 300)
  }

  function handleMouseLeave() {
    clearTimeout(tooltipTimer.current)
    setTooltip(t => ({ ...t, visible: false }))
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Отпуска коллег</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48" ref={searchRef}>
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Добавить сотрудника..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {searchResults.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => addPerson(emp)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.team}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year */}
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>

        {/* Half year */}
        <select
          value={halfYear}
          onChange={e => setHalfYear(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="h1">I полугодие</option>
          <option value="h2">II полугодие</option>
        </select>

        {/* Show drafts */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDrafts}
            onChange={e => setShowDrafts(e.target.checked)}
            className="rounded"
          />
          Показывать черновики
        </label>
      </div>

      {/* Gantt table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Month header */}
        <div className="flex border-b border-gray-100">
          <div className="w-52 shrink-0 border-r border-gray-100 px-3 py-2">
            <span className="text-xs font-semibold text-gray-500">ФИО</span>
          </div>
          <div className="flex-1 flex">
            {visibleMonths.map(m => (
              <div
                key={m}
                style={{ width: `${(daysInMonth(year, m) / totalMonthDays) * 100}%` }}
                className="text-[11px] text-gray-400 font-medium py-2 text-center border-r border-gray-50 last:border-r-0"
              >
                {MONTH_FULL[m]}
              </div>
            ))}
          </div>
        </div>

        {comparisonPeople.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Нет сотрудников для сравнения
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {comparisonPeople.map(person => {
              const avatarColor = AVATAR_COLORS[person.idx % AVATAR_COLORS.length]
              const initials = person.name.split(' ').slice(0, 2).map(w => w[0]).join('')

              return (
                <div key={person.id} className="flex items-center h-12">
                  <div className="w-52 shrink-0 px-3 border-r border-gray-100 h-full flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">
                      {person.name}{person.me ? ' (я)' : ''}
                    </span>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 relative h-full px-1">
                    {person.segments.map((seg, bi) => {
                      const barStyle = getBarStyle(seg.startDate, seg.endDate, rangeStart, rangeEnd, rangeDays)
                      if (!barStyle) return null
                      const segStatus = seg.status ?? 'approved'
                      const color = SEG_COLORS[segStatus] ?? SEG_COLORS.approved
                      const isDraft = segStatus === 'draft'
                      const tooltipText = `${person.name}: ${seg.startDate} — ${seg.endDate} (${color.label})`
                      return (
                        <div
                          key={bi}
                          className="absolute top-1/2 -translate-y-1/2 h-5 rounded-full"
                          style={{
                            ...barStyle,
                            backgroundColor: color.bar,
                            border: isDraft ? `1.5px dashed ${color.border}` : 'none',
                            opacity: 0.9,
                          }}
                          onMouseEnter={e => handleMouseEnter(e, tooltipText)}
                          onMouseLeave={handleMouseLeave}
                          onMouseMove={e => {
                            clearTimeout(tooltipTimer.current)
                            setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      {presentStatuses.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {presentStatuses.map(s => {
            const color = SEG_COLORS[s]
            const isDraft = s === 'draft'
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color.bar,
                    border: isDraft ? `1.5px dashed ${color.border}` : 'none',
                  }}
                />
                <span className="text-xs text-gray-600">{color.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x - 10, top: tooltip.y - 40 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
