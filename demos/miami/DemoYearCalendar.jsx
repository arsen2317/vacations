import { MONTH_NAMES, WEEKDAYS } from '../../src/i18n/translate'
import { HOLIDAYS_2026, HOLIDAYS_2027 } from '../../src/data/mockData'
import { DEMO_TODAY, toKey } from '../../src/utils/dateUtils'

const dateLabel = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'full' })

function CalendarMonth({ year, month, start, end, onSelect, onHover }) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const totalDays = new Date(year, month + 1, 0).getDate()

  return (
    <section className="calendar-month" aria-label={MONTH_NAMES[month]}>
      <h3>{MONTH_NAMES[month]}</h3>
      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days" onMouseLeave={() => onHover(null)}>
        {Array.from({ length: 42 }, (_, index) => {
          const day = index - firstWeekday + 1
          if (day < 1 || day > totalDays) return <span key={index} />

          const date = new Date(year, month, day)
          const iso = toKey(date)
          const inRange = start !== null && date >= start && date <= end
          const isEdge = inRange && (+date === +start || +date === +end)
          const joinsLeft = inRange && date > start && day > 1 && index % 7 !== 0
          const joinsRight = inRange && date < end && day < totalDays && index % 7 !== 6
          const isWeekend = [0, 6].includes(date.getDay()) || HOLIDAYS_2026.has(iso) || HOLIDAYS_2027.has(iso)

          return (
            <button
              type="button"
              key={index}
              className="calendar-day"
              aria-label={dateLabel.format(date)}
              aria-current={+date === +DEMO_TODAY ? 'date' : undefined}
              aria-pressed={inRange}
              data-edge={isEdge || undefined}
              data-join-left={joinsLeft || undefined}
              data-join-right={joinsRight || undefined}
              data-weekend={isWeekend || undefined}
              data-past={date < DEMO_TODAY || undefined}
              onClick={() => onSelect(date)}
              onMouseEnter={() => onHover(date)}
            >
              <span>{day}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function DemoYearCalendar({ year, start, end, onSelect, onHover }) {
  return (
    <div className="demo-year" aria-label={`Календарь на ${year} год`}>
      {MONTH_NAMES.map((month, index) => (
        <CalendarMonth key={month} year={year} month={index} start={start} end={end} onSelect={onSelect} onHover={onHover} />
      ))}
    </div>
  )
}
