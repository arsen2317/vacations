import { useApp } from '../context/AppContext'

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatDate(date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

function findNextVacation(requests) {
  const today = new Date(2026, 5, 6)
  return requests
    .filter(r => (r.status === 'approved' || r.status === 'pending') && r.startDate >= today)
    .sort((a, b) => a.startDate - b.startDate)[0] || null
}

const labelStyle = { color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }
const valueStyle = { color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }
const secondaryValueStyle = { color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }
const grayValueStyle = { color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }

const cardStyle = {
  background: '#fff',
  borderRadius: 32,
  outline: '1px solid rgba(188,195,208,0.5)',
  paddingTop: 20,
  paddingBottom: 20,
  display: 'flex',
  flexDirection: 'column',
}

function CardHeader({ title, linkText }) {
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>{title}</span>
      <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px', cursor: 'pointer' }}>{linkText}</span>
    </div>
  )
}

function InfoBlock({ label, value, secondary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
      {secondary && <span style={secondaryValueStyle}>{secondary}</span>}
    </div>
  )
}

function WarningBanner({ title, subtitle }) {
  return (
    <div style={{ background: '#F2F3F7', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 18, height: 18, background: '#FAC031', borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#1D2023', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>{title}</div>
        {subtitle && <div style={{ color: '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '16px' }}>{subtitle}</div>}
      </div>
      <div style={{ width: 8, height: 16, background: '#BCC3D0', borderRadius: 2, flexShrink: 0 }} />
    </div>
  )
}

function CardButtons({ primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  const btnBase = { height: 44, borderRadius: 16, cursor: 'pointer', border: 'none', fontFamily: "'MTSWide', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20, paddingBottom: 12, display: 'flex', gap: 10 }}>
      <button onClick={onPrimary} style={{ ...btnBase, background: '#0066FF', color: '#fff', paddingLeft: 20, paddingRight: 20 }}>{primaryLabel}</button>
      <button onClick={onSecondary} style={{ ...btnBase, background: '#F2F3F7', color: '#1D2023', paddingLeft: 20, paddingRight: 20 }}>{secondaryLabel}</button>
    </div>
  )
}

function VacationCard({ onGoTo }) {
  const { balance, requests } = useApp()
  const nextVacation = findNextVacation(requests)

  return (
    <div style={cardStyle}>
      <CardHeader title="Отпуск" linkText="Всё об отпуске" />
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <InfoBlock
              label="Доступно дней"
              value={`${balance.main + balance.extra} дней`}
              secondary={balance.extra > 0 ? `из них ${balance.extra} дня доп. отпуска` : null}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={labelStyle}>Ближайший отпуск</span>
              {nextVacation ? (
                <>
                  <span style={valueStyle}>{formatDate(nextVacation.startDate)} – {formatDate(nextVacation.endDate)}</span>
                  <span style={secondaryValueStyle}>{nextVacation.days} {nextVacation.days === 1 ? 'день' : nextVacation.days < 5 ? 'дня' : 'дней'}</span>
                </>
              ) : (
                <span style={grayValueStyle}>Нет запланированных отпусков</span>
              )}
            </div>
          </div>
          <img src="/vacation.png" alt="" style={{ width: 200, height: 'auto', flexShrink: 0 }} />
        </div>
        <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
          Чтобы оформить отпуск вне графика, создайте заявку на внеплановый отпуск. Перенести запланированный отпуск можно в разделе Планы на отпуск
        </span>
        <WarningBanner
          title="Подтвердите свои планы на отпуск на следующий год"
          subtitle="Это нужно сделать до 25 декабря 2026"
        />
      </div>
      <CardButtons
        primaryLabel="ЗАЯВКИ НА ОТПУСК"
        secondaryLabel="ПЛАНЫ НА ОТПУСК"
        onPrimary={() => onGoTo('home')}
        onSecondary={() => onGoTo('planning')}
      />
    </div>
  )
}

function WorkScheduleCard() {
  return (
    <div style={cardStyle}>
      <CardHeader title="График работы" linkText="Подробнее" />
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <InfoBlock label="Текущий график" value="08:30 – 17:30" />
            <InfoBlock label="Действует до" value="30 мая 2026" />
          </div>
          <img src="/schedule.png" alt="" style={{ width: 200, height: 'auto', flexShrink: 0 }} />
        </div>
        <WarningBanner
          title="Текущий график скоро закончится и сменится на стандартный"
          subtitle="Создайте новую заявку, если хотите выбрать удобный график работы"
        />
      </div>
      <CardButtons
        primaryLabel="СОЗДАТЬ ЗАЯВКУ"
        secondaryLabel="МОИ ЗАЯВКИ"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </div>
  )
}

const DAY_PILLS = [
  { day: 'ПН', type: 'office' },
  { day: 'ВТ', type: 'home' },
  { day: 'СР', type: 'office' },
  { day: 'ЧТ', type: 'home' },
  { day: 'ПТ', type: 'office' },
  { day: 'СБ', type: 'weekend' },
  { day: 'ВС', type: 'weekend' },
]

const PILL_STYLES = {
  office:  { bg: '#FFECCC', text: '#AD8200', iconBg: '#FAC031', label: 'офис' },
  home:    { bg: '#F1EBFF', text: '#8B33FF', iconBg: '#C4A3FF', label: 'дом' },
  weekend: { bg: '#F2F3F7', text: '#969FA8', iconBg: '#BCC3D0', label: 'вых' },
}

function WorkFormatCard() {
  return (
    <div style={cardStyle}>
      <CardHeader title="Формат работы" linkText="Подробнее" />
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <InfoBlock label="Формат работы" value="гибрид" />
            <InfoBlock label="Время работы в офисе" value="не менее 30%" />
          </div>
          <img src="/remote-work.png" alt="" style={{ width: 200, height: 'auto', flexShrink: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSText', sans-serif", fontWeight: 500, lineHeight: '20px', textTransform: 'uppercase', letterSpacing: 0.5 }}>МОЙ ФОРМАТ РАБОТЫ ДО 30 СЕНТЯБРЯ 2026</span>
            <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px', cursor: 'pointer' }}>Графики коллег</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_PILLS.map(({ day, type }) => {
              const s = PILL_STYLES[type]
              return (
                <div key={day} style={{ width: 72, height: 104, borderRadius: 12, background: s.bg, paddingTop: 8, paddingBottom: 8, paddingLeft: 4, paddingRight: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <span style={{ color: s.text, fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>{day}</span>
                  <div style={{ width: 18, height: 18, background: s.iconBg, borderRadius: 4 }} />
                  <span style={{ color: s.text, fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '16px' }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
        <WarningBanner
          title="Текущий формат истекает 30 сентября 2026"
          subtitle="Создайте новую заявку, чтобы выбрать удобный формат работы"
        />
      </div>
      <CardButtons
        primaryLabel="СОЗДАТЬ ЗАЯВКУ"
        secondaryLabel="МОИ ЗАЯВКИ"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </div>
  )
}

function BusinessTripsCard() {
  return (
    <div style={cardStyle}>
      <CardHeader title="Командировки" linkText="Подробнее" />
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={secondaryValueStyle}>По России, зарубежные, со сложным маршрутом</span>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Если до начала командировки осталось менее 5 рабочих дней, потребуется дополнительное согласование с председателем правления
            </span>
          </div>
          <img src="/business-trip.png" alt="" style={{ width: 200, height: 'auto', flexShrink: 0 }} />
        </div>
        <WarningBanner
          title="Заполните отчёт до 21 июня 2026"
          subtitle="По командировке №12345 «Участие в конференции»"
        />
      </div>
      <CardButtons
        primaryLabel="СОЗДАТЬ ЗАЯВКУ"
        secondaryLabel="МОИ КОМАНДИРОВКИ"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </div>
  )
}

export default function WorkAndRestPage({ onGoTo }) {
  return (
    <div>
      <div style={{ paddingTop: 20, paddingRight: 20 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 500, color: '#1D2023', lineHeight: '36px', fontFamily: "'MTSWide', sans-serif" }}>
          Работа и отдых
        </h1>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#626C77', lineHeight: '24px', fontFamily: "'MTSCompact', sans-serif" }}>
          Управляйте своим отпуском, графиком и форматом работы
        </p>
      </div>
      <div style={{ display: 'flex', gap: 32, paddingLeft: 0, paddingRight: 0, paddingTop: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <VacationCard onGoTo={onGoTo} />
          <WorkScheduleCard />
        </div>
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <WorkFormatCard />
          <BusinessTripsCard />
        </div>
      </div>
    </div>
  )
}
