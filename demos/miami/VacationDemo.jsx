import { useEffect, useRef, useState } from 'react'
import DemoYearCalendar from './DemoYearCalendar'
import { BreadChevron, CrossIcon, DoneIcon } from '../../src/ds/icons'
import { BTN_STYLE, COLORS } from '../../src/ds/tokens'
import { DEMO_TODAY } from '../../src/utils/dateUtils'
import vacationImage from '../../public/vacation.png?inline'

const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' })

function Button({ children, onClick, secondary = false, disabled = false }) {
  return (
    <button
      type="button"
      className="action"
      style={{
        ...BTN_STYLE,
        background: secondary ? COLORS.bg : COLORS.blue,
        color: secondary ? COLORS.text : COLORS.white,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function TicketsDialog({ onClose, onConfirm }) {
  const dialog = useRef(null)
  const title = useRef(null)

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    title.current.focus()
    return () => element.close()
  }, [])

  return (
    <dialog
      className="tickets-dialog"
      ref={dialog}
      aria-labelledby="tickets-title"
      aria-describedby="tickets-description"
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="dialog-header">
        <h2 id="tickets-title" tabIndex={-1} ref={title}>
          Оплатить вам билеты в&nbsp;Майами?
        </h2>
        <button className="icon-button" type="button" aria-label="Закрыть" onClick={onClose}>
          <CrossIcon />
        </button>
      </div>
      <p id="tickets-description">Компания оплатит перелёт туда и&nbsp;обратно.</p>
      <div className="dialog-actions">
        <Button onClick={() => onConfirm(true)}>Да, в&nbsp;Майами</Button>
        <Button secondary onClick={() => onConfirm(false)}>Без&nbsp;билетов</Button>
      </div>
    </dialog>
  )
}

export default function VacationDemo() {
  const [screen, setScreen] = useState('home')
  const [range, setRange] = useState(null)
  const [year, setYear] = useState(DEMO_TODAY.getFullYear())
  const [hover, setHover] = useState(null)
  const [includesTickets, setIncludesTickets] = useState(false)
  const heading = useRef(null)

  useEffect(() => {
    if (screen !== 'tickets') heading.current.focus()
  }, [screen])

  function chooseDates() {
    clearSelection()
    setYear(DEMO_TODAY.getFullYear())
    setScreen('dates')
  }

  function clearSelection() {
    setRange(null)
    setHover(null)
  }

  function chooseFullYear() {
    setRange({ start: new Date(year, 0, 1), end: new Date(year, 11, 31) })
    setHover(null)
  }

  function changeYear(offset) {
    setHover(null)
    setYear(current => current + offset)
  }

  function selectDay(date) {
    setHover(null)
    if (!range || range.end) {
      setRange({ start: date, end: null })
    } else {
      const start = range.start
      setRange(date < start ? { start: date, end: start } : { start, end: date })
    }
  }

  function confirmPeriod() {
    if (!range) return
    setRange({ start: range.start, end: range.end ?? range.start })
    setHover(null)
    setScreen('tickets')
  }

  function showResult(withTickets) {
    setIncludesTickets(withTickets)
    setScreen('result')
  }

  const isPickingDates = screen === 'dates' || screen === 'tickets'
  const start = range?.start ?? null
  const end = range?.end ?? start
  const previewDate = range && !range.end ? hover : null
  const previewStart = previewDate && previewDate < start ? previewDate : start
  const previewEnd = previewDate && previewDate > end ? previewDate : end

  return (
    <main className="layout" style={{
      '--text': COLORS.text,
      '--secondary': COLORS.secondary,
      '--blue': COLORS.blue,
      '--surface': COLORS.bg,
      '--stroke': COLORS.stroke,
    }}>
      <nav className="breadcrumbs" aria-label="Путь к разделу">
        <span>главная</span>
        <BreadChevron />
        <span aria-current="page">работа и&nbsp;отпуск</span>
      </nav>

      <h1 tabIndex={-1} ref={heading}>
        {isPickingDates ? 'Выберите даты отпуска' : screen === 'result' ? 'Отпуск оформлен' : 'Работа и\u00a0отпуск'}
      </h1>

      {screen === 'home' && (
        <section className="vacation-card" aria-labelledby="vacation-title">
          <div>
            <h2 id="vacation-title">Отпуск</h2>
            <Button onClick={chooseDates}>Взять отпуск</Button>
          </div>
          <img className="vacation-art" src={vacationImage} alt="" width="277" height="156" />
        </section>
      )}

      {isPickingDates && (
        <section className="calendar-section" aria-label="Период отпуска">
          <div className="year-controls" aria-label="Год календаря">
            <button type="button" className="year-arrow previous-year" aria-label="Предыдущий год" onClick={() => changeYear(-1)}>
              <BreadChevron />
            </button>
            <strong aria-live="polite">{year}</strong>
            <button type="button" className="year-arrow" aria-label="Следующий год" onClick={() => changeYear(1)}>
              <BreadChevron />
            </button>
          </div>
          <div className="calendar-layout">
            <DemoYearCalendar
              year={year}
              start={previewStart}
              end={previewEnd}
              onSelect={selectDay}
              onHover={setHover}
            />
            <aside className="selection-panel" aria-labelledby="selection-title">
              <h2 id="selection-title">Период отпуска</h2>
              <p aria-live="polite">{start ? dateFormat.formatRange(start, end) : 'Выберите даты начала и\u00a0окончания. Лимита по\u00a0дням нет.'}</p>
              <button type="button" className="text-button" onClick={chooseFullYear}>Выбрать целый год</button>
              <div className="calendar-actions">
                <Button disabled={!range} onClick={confirmPeriod}>Продолжить</Button>
                {range && <button type="button" className="text-button" onClick={clearSelection}>Сбросить</button>}
              </div>
            </aside>
          </div>
        </section>
      )}

      {screen === 'tickets' && (
        <TicketsDialog onClose={() => setScreen('dates')} onConfirm={showResult} />
      )}

      {screen === 'result' && (
        <section className="result-card" aria-labelledby="result-title">
          <div className="result-icon" aria-hidden="true"><DoneIcon /></div>
          <p className="period">{dateFormat.formatRange(range.start, range.end)}</p>
          <h2 id="result-title">Деньги уже на&nbsp;карте</h2>
          <dl className="payments">
            {includesTickets && (
              <div><dt>На&nbsp;билеты в&nbsp;Майами</dt><dd>100&nbsp;000&nbsp;₽</dd></div>
            )}
            <div><dt>Бонус на&nbsp;карманные расходы</dt><dd>120&nbsp;000&nbsp;₽</dd></div>
          </dl>
          <p className="farewell">
            Приятного отпуска! Рабочие чаты в&nbsp;ручную кладь не&nbsp;берём.
          </p>
          <Button secondary onClick={() => setScreen('home')}>Спасибки</Button>
        </section>
      )}
    </main>
  )
}
