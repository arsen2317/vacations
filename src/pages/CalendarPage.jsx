import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CAMPAIGN, HOLIDAYS_2026, HOLIDAYS_2027 } from '../data/mockData'
import { Chip } from '../ds/index'

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
  const totalRows = Math.ceil((firstDow + totalDays) / 7)

  // Build 7 columns (one per weekday). Each column is an array of day numbers or null.
  const columns = Array.from({ length: 7 }, (_, col) =>
    Array.from({ length: totalRows }, (_, row) => {
      const day = row * 7 + col - firstDow + 1
      return day >= 1 && day <= totalDays ? day : null
    })
  )

  return (
    <div style={{
      background: '#fff',
      borderRadius: 32,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 20,
      paddingBottom: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: 20,
        fontFamily: "'MTSCompact', sans-serif",
        fontWeight: 500,
        color: '#1D2023',
      }}>
        {MONTH_NAMES[month]}
      </div>

      {/* 7 weekday columns */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {WEEKDAY_NAMES.map((w, col) => (
          <div key={col} style={{
            flex: '1 1 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            {/* Weekday header */}
            <div style={{
              alignSelf: 'stretch',
              textAlign: 'center',
              fontSize: 12,
              fontFamily: "'MTSCompact', sans-serif",
              fontWeight: 500,
              color: '#626C77',
              textTransform: 'uppercase',
              lineHeight: '16px',
            }}>
              {w}
            </div>

            {/* Day cells */}
            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {columns[col].map((day, row) => {
                if (day === null) {
                  return <div key={row} style={{ alignSelf: 'stretch', height: 36, position: 'relative' }} />
                }

                const ds = toDateStr(year, month, day)
                const isHoliday = holidays.has(ds)
                const vacStatus = vacationDays.get(ds)
                const st = vacStatus ? STATUS_STYLE[vacStatus] : null

                return (
                  <div key={row} style={{
                    alignSelf: 'stretch',
                    padding: 4,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {st && (
                      <div style={{
                        width: 36, height: 36,
                        left: 2, top: 0,
                        position: 'absolute',
                        background: st.bg,
                        borderRadius: 12,
                      }} />
                    )}
                    <div style={{
                      alignSelf: 'stretch',
                      height: 28,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                      color: isHoliday ? '#FF0032' : st ? st.color : '#1D2023',
                      fontSize: 14,
                      fontFamily: "'MTSCompact', sans-serif",
                      fontWeight: st ? 500 : 400,
                      lineHeight: st ? '20px' : '18px',
                    }}>
                      {day}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
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
