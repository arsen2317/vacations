import { useEffect, useRef, useState } from 'react'
import { CalendarRange } from '../../src/ds/CalendarRange'
import { BreadChevron, CrossIcon, DoneIcon } from '../../src/ds/icons'
import { BTN_STYLE, COLORS } from '../../src/ds/tokens'
import { DEMO_TODAY } from '../../src/utils/dateUtils'
import vacationImage from '../../public/vacation.png?inline'

const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' })
const oneYearEnd = new Date(DEMO_TODAY.getFullYear() + 1, DEMO_TODAY.getMonth(), DEMO_TODAY.getDate() - 1)

function Button({ children, onClick, secondary = false }) {
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
    >
      {children}
    </button>
  )
}

function TicketsDialog({ onBack, onConfirm }) {
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
        onBack()
      }}
    >
      <button className="icon-button" type="button" aria-label="Закрыть" onClick={onBack}>
        <CrossIcon />
      </button>
      <h2 id="tickets-title" tabIndex={-1} ref={title}>
        Оплатить вам билеты в Майами?
      </h2>
      <p id="tickets-description">Компания оплатит перелёт туда и обратно.</p>
      <div className="dialog-actions">
        <Button onClick={() => onConfirm(true)}>Да, в Майами</Button>
        <Button secondary onClick={() => onConfirm(false)}>Без билетов</Button>
      </div>
    </dialog>
  )
}

export default function VacationDemo() {
  const [screen, setScreen] = useState('home')
  const [range, setRange] = useState(null)
  const [calendarVersion, setCalendarVersion] = useState(0)
  const [includesTickets, setIncludesTickets] = useState(false)
  const heading = useRef(null)

  useEffect(() => {
    if (screen !== 'tickets') heading.current.focus()
  }, [screen])

  function chooseDates() {
    setRange(null)
    setScreen('dates')
  }

  function chooseFullYear() {
    setRange({ start: DEMO_TODAY, end: oneYearEnd })
    setCalendarVersion(version => version + 1)
  }

  function confirmPeriod(start, end) {
    setRange({ start, end })
    setScreen('tickets')
  }

  function showResult(withTickets) {
    setIncludesTickets(withTickets)
    setScreen('result')
  }

  const isPickingDates = screen === 'dates' || screen === 'tickets'

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
        <span aria-current="page">работа и отпуск</span>
      </nav>

      <h1 tabIndex={-1} ref={heading}>
        {isPickingDates ? 'Выберите даты отпуска' : screen === 'result' ? 'Отпуск оформлен' : 'Работа и отпуск'}
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
          <div className="calendar-intro">
            <p>Лимита по дням нет.</p>
            <button type="button" className="text-button" onClick={chooseFullYear}>Выбрать целый год</button>
          </div>
          <div className="demo-calendar">
            <CalendarRange
              key={calendarVersion}
              initialStart={range?.start}
              initialEnd={range?.end}
              applyLabel="Продолжить"
              onApply={confirmPeriod}
            />
          </div>
          <button type="button" className="text-button back-button" onClick={() => setScreen('home')}>Назад</button>
        </section>
      )}

      {screen === 'tickets' && (
        <TicketsDialog onBack={() => setScreen('dates')} onConfirm={showResult} />
      )}

      {screen === 'result' && (
        <section className="result-card" aria-labelledby="result-title">
          <div className="result-icon" aria-hidden="true"><DoneIcon /></div>
          <p className="period">{dateFormat.formatRange(range.start, range.end)}</p>
          <h2 id="result-title">Деньги уже на карте</h2>
          <dl className="payments">
            {includesTickets && (
              <div><dt>На билеты в Майами</dt><dd>100&nbsp;000&nbsp;₽</dd></div>
            )}
            <div><dt>Бонус на карманные расходы</dt><dd>120&nbsp;000&nbsp;₽</dd></div>
          </dl>
          <p className="farewell">
            Приятного отпуска! Рабочие чаты в ручную кладь не берём.
          </p>
          <Button secondary onClick={() => setScreen('home')}>Начать заново</Button>
        </section>
      )}
    </main>
  )
}
