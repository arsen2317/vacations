import { useState, useMemo } from 'react'
import { Typography, AutoComplete, Select, Switch, Card, Tooltip, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
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

const LEGEND_ITEMS = ['approved', 'pending', 'reviewing', 'draft']

const AVATAR_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#14b8a6', '#f97316',
]

const COLLEAGUES_MAP = Object.fromEntries(COLLEAGUES.map(c => [c.id, c]))
const INITIAL_IDS = COLLEAGUES
  .filter(c => c.team === CURRENT_USER.team)
  .map(c => c.id)

const YEAR_OPTIONS = [
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
]

const HALF_YEAR_OPTIONS = [
  { value: 'h1', label: 'I полугодие' },
  { value: 'h2', label: 'II полугодие' },
]

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getRange(year, halfYear) {
  if (halfYear === 'h1') {
    return { start: new Date(year, 0, 1), end: new Date(year, 5, 30), months: [0, 1, 2, 3, 4, 5] }
  }
  return { start: new Date(year, 6, 1), end: new Date(year, 11, 31), months: [6, 7, 8, 9, 10, 11] }
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
  const [comparisonIds, setComparisonIds] = useState(INITIAL_IDS)

  const { start: rangeStart, end: rangeEnd, months: visibleMonths } = useMemo(
    () => getRange(year, halfYear),
    [year, halfYear],
  )

  const totalMonthDays = useMemo(
    () => visibleMonths.reduce((s, m) => s + daysInMonth(year, m), 0),
    [year, visibleMonths],
  )

  const rangeDays = Math.round((rangeEnd - rangeStart) / 86400000) + 1

  const searchOptions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return ALL_EMPLOYEES
      .filter(e => !comparisonIds.includes(e.id) && e.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map(emp => ({
        value: emp.name,
        label: (
          <div>
            <div style={{ fontSize: 14 }}>{emp.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{emp.team}</div>
          </div>
        ),
        emp,
      }))
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

  function addPerson(value, option) {
    if (option?.emp) {
      setComparisonIds(prev => [...prev, option.emp.id])
      setSearchQuery('')
    }
  }

  function removePerson(id) {
    setComparisonIds(prev => prev.filter(x => x !== id))
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>

        <Typography.Title level={4} style={{ margin: 0 }}>Отпуска коллег</Typography.Title>

        <Space wrap>
          <AutoComplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={addPerson}
            options={searchOptions}
            placeholder="Добавить сотрудника..."
            style={{ width: 240 }}
          />
          <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 90 }} />
          <Select value={halfYear} onChange={setHalfYear} options={HALF_YEAR_OPTIONS} style={{ width: 148 }} />
          <Space size={8}>
            <Switch size="small" checked={showDrafts} onChange={setShowDrafts} />
            <Typography.Text style={{ fontSize: 14 }}>Показывать черновики</Typography.Text>
          </Space>
        </Space>

        <Card styles={{ body: { padding: 0 } }}>
          {/* Month header */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 208, flexShrink: 0, borderRight: '1px solid #f0f0f0', padding: '8px 12px' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>ФИО</Typography.Text>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              {visibleMonths.map(m => (
                <div
                  key={m}
                  style={{
                    width: `${(daysInMonth(year, m) / totalMonthDays) * 100}%`,
                    fontSize: 11,
                    color: '#8c8c8c',
                    fontWeight: 500,
                    padding: '8px 0',
                    textAlign: 'center',
                    borderRight: '1px solid #fafafa',
                  }}
                >
                  {MONTH_FULL[m]}
                </div>
              ))}
            </div>
          </div>

          {comparisonPeople.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <Typography.Text type="secondary">Нет сотрудников для сравнения</Typography.Text>
            </div>
          ) : (
            <div>
              {comparisonPeople.map(person => {
                const avatarColor = AVATAR_COLORS[person.idx % AVATAR_COLORS.length]
                const initials = person.name.split(' ').slice(0, 2).map(w => w[0]).join('')
                return (
                  <div
                    key={person.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 48,
                      borderBottom: '1px solid #fafafa',
                    }}
                  >
                    <div style={{
                      width: 208,
                      flexShrink: 0,
                      padding: '0 12px',
                      borderRight: '1px solid #f0f0f0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#fff',
                        flexShrink: 0,
                        background: avatarColor,
                      }}>
                        {initials}
                      </div>
                      <Typography.Text style={{
                        fontSize: 12,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {person.name}{person.me ? ' (я)' : ''}
                      </Typography.Text>
                      <CloseOutlined
                        style={{ fontSize: 11, color: '#bfbfbf', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => removePerson(person.id)}
                      />
                    </div>

                    <div style={{ flex: 1, position: 'relative', height: '100%', padding: '0 4px' }}>
                      {person.segments.map((seg, bi) => {
                        const barStyle = getBarStyle(seg.startDate, seg.endDate, rangeStart, rangeEnd, rangeDays)
                        if (!barStyle) return null
                        const segStatus = seg.status ?? 'approved'
                        const color = SEG_COLORS[segStatus] ?? SEG_COLORS.approved
                        const isDraft = segStatus === 'draft'
                        return (
                          <Tooltip
                            key={bi}
                            title={`${person.name}: ${seg.startDate} — ${seg.endDate} (${color.label})`}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: color.bar,
                              border: isDraft ? `1.5px dashed ${color.border}` : 'none',
                              opacity: 0.9,
                              cursor: 'default',
                              ...barStyle,
                            }} />
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Legend — always shows all statuses */}
        <Space wrap size={[16, 8]}>
          {LEGEND_ITEMS.map(s => {
            const color = SEG_COLORS[s]
            const isDraft = s === 'draft'
            return (
              <Space key={s} size={6}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color.bar,
                  border: isDraft ? `1.5px dashed ${color.border}` : 'none',
                  flexShrink: 0,
                }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{color.label}</Typography.Text>
              </Space>
            )
          })}
        </Space>

      </Space>
    </div>
  )
}
