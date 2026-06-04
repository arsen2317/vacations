import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CAMPAIGN, HOLIDAYS_2026 } from '../data/mockData'
import { Chip } from '../ds/index'

const HOLIDAYS_2027 = new Set([
  '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04', '2027-01-05',
  '2027-01-06', '2027-01-07', '2027-01-08',
  '2027-02-22', '2027-02-23',
  '2027-03-08',
  '2027-05-01', '2027-05-10',
  '2027-06-14',
  '2027-11-04', '2027-11-05',
])

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAY_NAMES = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const STATUS_STYLE = {
  draft:     { bg: '#F2F3F7', color: '#626C77' },
  pending:   { bg: '#C7E1FF', color: '#005CBD' },
  approved:  { bg: '#BEF4BD', color: '#007502' },
  reviewing: { bg: '#E3CCFF', color: '#7936C9' },
}

const LEGEND_ITEMS = [
  { status: 'draft',     label: 'Черновик' },
  { status: 'pending',   label: 'На согласовании' },
  { status: 'approved',  label: 'Согласован' },
  { status: 'reviewing', label: 'На ознакомлении' },
]

function getDow(date) {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function toDateStr(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function MonthCard({ year, month, holidays, vacationDays }) {
  const firstDow = getDow(new Date(year, month, 1))
  const totalDays = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{
      width: 316,
      background: '#fff',
      borderRadius: 32,
      paddingTop: 20,
      paddingBottom: 20,
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: 20,
        fontFamily: "'MTSCompact', sans-serif",
        fontWeight: 500,
        color: '#1D2023',
        marginBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
      }}>
        {MONTH_NAMES[month]}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingLeft: 8, paddingRight: 8 }}>
        {WEEKDAY_NAMES.map(w => (
          <div key={w} style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#626C77',
            fontWeight: 500,
            textTransform: 'uppercase',
            padding: '6px 2px',
          }}>
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} style={{ height: 36 }} />
          }

          const ds = toDateStr(year, month, day)
          const isHoliday = holidays.has(ds)
          const vacStatus = vacationDays.get(ds)
          const st = vacStatus ? STATUS_STYLE[vacStatus] : null

          const textColor = isHoliday
            ? '#FF0032'
            : st ? st.color : '#1D2023'
          const fontWeight = st ? 500 : 400

          return (
            <div key={ds} style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 36,
              padding: '0 2px',
            }}>
              {st && (
                <div style={{
                  position: 'absolute',
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: st.bg,
                }} />
              )}
              <span style={{
                position: 'relative',
                zIndex: 1,
                fontSize: 14,
                fontWeight,
                color: textColor,
                lineHeight: '36px',
                width: 28,
                textAlign: 'center',
                fontFamily: "'MTSCompact', sans-serif",
              }}>
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { segments, planStatus, approvedSegments } = useApp()
  const [year, setYear] = useState(CAMPAIGN.year)

  const holidays = year === 2027 ? HOLIDAYS_2027 : HOLIDAYS_2026

  const vacationDays = useMemo(() => {
    const map = new Map()
    const segs = planStatus === 'approved' ? approvedSegments : segments

    for (const seg of segs) {
      const start = new Date(seg.startDate + 'T00:00:00')
      const end = new Date(seg.endDate + 'T00:00:00')
      const cur = new Date(start)
      while (cur <= end) {
        if (cur.getFullYear() === year) {
          const ds = toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate())
          map.set(ds, planStatus)
        }
        cur.setDate(cur.getDate() + 1)
      }
    }
    return map
  }, [segments, planStatus, approvedSegments, year])

  const yearOptions = [CAMPAIGN.year - 1, CAMPAIGN.year]

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 24,
          fontFamily: "'MTSWide', sans-serif",
          fontWeight: 500,
          color: '#1D2023',
        }}>
          Календарь отпуска
        </h2>

        <div style={{ display: 'flex', gap: 8 }}>
          {yearOptions.map(y => (
            <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 316px)',
        gap: 16,
      }}>
        {Array.from({ length: 12 }, (_, i) => (
          <MonthCard
            key={i}
            year={year}
            month={i}
            holidays={holidays}
            vacationDays={vacationDays}
          />
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {LEGEND_ITEMS.map(({ status, label }) => {
          const s = STATUS_STYLE[status]
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: s.bg,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 14,
                color: '#1D2023',
                fontFamily: "'MTSCompact', sans-serif",
              }}>
                {label}
              </span>
            </div>
          )
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 500,
            color: '#FF0032',
            fontFamily: "'MTSCompact', sans-serif",
          }}>
            1
          </span>
          <span style={{
            fontSize: 14,
            color: '#1D2023',
            fontFamily: "'MTSCompact', sans-serif",
          }}>
            Праздничный день
          </span>
        </div>
      </div>
    </div>
  )
}
