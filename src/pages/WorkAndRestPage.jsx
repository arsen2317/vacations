import { useApp } from '../context/AppContext'
import { ChevronUp } from '../ds/index'

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatDate(date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

function pluralDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня'
  return 'дней'
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

const InfoIconGray = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M1.68597 1.68597C0.373095 2.99884 0.275748 4.30684 0.0810531 6.92282C0.0305833 7.60095 0 8.30048 0 9C0 9.69952 0.0305834 10.399 0.0810532 11.0772C0.275748 13.6932 0.373095 15.0012 1.68597 16.314C2.99884 17.6269 4.30684 17.7243 6.92282 17.9189C7.60095 17.9694 8.30048 18 9 18C9.69952 18 10.399 17.9694 11.0772 17.9189C13.6932 17.7243 15.0012 17.6269 16.314 16.314C17.6269 15.0012 17.7243 13.6932 17.9189 11.0772C17.9694 10.399 18 9.69952 18 9C18 8.30048 17.9694 7.60095 17.9189 6.92282C17.7243 4.30684 17.6269 2.99884 16.314 1.68597C15.0012 0.373095 13.6932 0.275748 11.0772 0.0810531C10.399 0.0305833 9.69952 0 9 0C8.30048 0 7.60095 0.0305834 6.92282 0.0810532C4.30684 0.275748 2.99884 0.373095 1.68597 1.68597ZM10.0001 4.99887C10.0001 5.68859 9.44092 6.24773 8.75119 6.24773C8.06146 6.24773 7.50233 5.68859 7.50233 4.99887C7.50233 4.30914 8.06146 3.75 8.75119 3.75C9.44092 3.75 10.0001 4.30914 10.0001 4.99887ZM9.70711 8.29289C9.89464 8.48043 10 8.73479 10 9L9.99999 13C9.99999 13.5523 9.55227 14 8.99998 14C8.4477 14 7.99999 13.5523 7.99999 13L8 10H7.5C6.94772 10 6.5 9.55228 6.5 9C6.5 8.44772 6.94772 8 7.5 8H9C9.26522 8 9.51957 8.10536 9.70711 8.29289Z" fill="#8D969F"/>
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.68597 19.314C3.3731 18.0012 3.27575 16.6932 3.08105 14.0772C3.03058 13.399 3 12.6995 3 12C3 11.3005 3.03058 10.601 3.08105 9.92282C3.27575 7.30684 3.3731 5.99884 4.68597 4.68597C5.99884 3.37309 7.30684 3.27575 9.92282 3.08105C10.601 3.03058 11.3005 3 12 3C12.6995 3 13.399 3.03058 14.0772 3.08105C16.6932 3.27575 18.0012 3.37309 19.314 4.68597C20.6269 5.99884 20.7243 7.30684 20.9189 9.92282C20.9694 10.601 21 11.3005 21 12C21 12.6995 20.9694 13.399 20.9189 14.0772C20.7243 16.6932 20.6269 18.0012 19.314 19.314C18.0012 20.6269 16.6932 20.7243 14.0772 20.9189C13.399 20.9694 12.6995 21 12 21C11.3005 21 10.601 20.9694 9.92282 20.9189C7.30684 20.7243 5.99884 20.6269 4.68597 19.314ZM12 13C12.5523 13 13 12.5523 13 12L13 8.00244C13 7.45015 12.5523 7.00244 12 7.00244C11.4477 7.00244 11 7.45016 11 8.00244L11 12C11 12.5523 11.4477 13 12 13ZM13.2477 16.0011C13.2477 15.3114 12.6886 14.7523 11.9989 14.7523C11.3091 14.7523 10.75 15.3114 10.75 16.0011C10.75 16.6909 11.3091 17.25 11.9989 17.25C12.6886 17.25 13.2477 16.6909 13.2477 16.0011Z" fill="#FAC031"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M9 6l6 6-6 6" stroke="#8D969F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const OfficeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.03399 0C10.1432 1.52223e-05 11.1884 0.0519008 12.118 0.126953C13.9281 0.273117 14.8339 0.346937 15.8025 1.31055C16.7708 2.27403 16.839 3.06148 16.9744 4.63574C17.0117 5.06945 17.034 5.52653 17.034 6C17.034 6.432 17.0157 6.85063 16.9842 7.25L16.9373 7.82227C16.8546 8.75477 16.7467 9.39572 16.3514 10.0117C16.4668 10.2328 16.5755 10.5082 16.7508 10.9521C17.7938 13.5936 18.3155 14.9152 17.9686 15.9521C17.7934 16.4753 17.4767 16.9407 17.0545 17.2959C16.2175 17.9997 14.7962 18 11.9559 18H6.12578C3.28063 18 1.85696 17.9997 1.01934 17.2949C0.597078 16.9393 0.281089 16.4729 0.106252 15.9492C-0.24017 14.9107 0.284239 13.5881 1.33379 10.9434C1.50495 10.5121 1.61215 10.2406 1.72442 10.0234C1.32211 9.40014 1.21357 8.74872 1.12969 7.79688L1.08281 7.21582C1.05216 6.82553 1.03302 6.41835 1.03301 6C1.03301 5.54037 1.05521 5.09409 1.0916 4.66895C1.21983 3.17126 1.28829 2.37555 2.09551 1.4873L2.26738 1.30859C3.11588 0.465015 3.92239 0.302925 5.33672 0.177734L5.98223 0.125C6.90369 0.0513485 7.93751 0 9.03399 0ZM6.9959 15C6.58349 15 6.21374 15.2533 6.06426 15.6377L5.72832 16.5H12.3397L12.0047 15.6377C11.8552 15.2533 11.4845 15 11.0721 15H6.9959ZM5.51348 11.5C4.96119 11.5 4.51348 11.9477 4.51348 12.5C4.51359 13.0522 4.96126 13.5 5.51348 13.5H12.5535C13.1055 13.4997 13.5534 13.052 13.5535 12.5C13.5535 11.9479 13.1055 11.5003 12.5535 11.5H5.51348ZM9.03399 2C7.99847 2 7.01827 2.04808 6.14141 2.11816C5.16253 2.19642 4.68603 2.24218 4.32598 2.33984C4.08134 2.40626 3.91566 2.48986 3.67754 2.72656C3.40437 2.9982 3.33337 3.15574 3.28301 3.32422C3.19908 3.60507 3.15881 3.97497 3.08477 4.83984C3.05276 5.21377 3.03399 5.6026 3.03399 6C3.03399 6.36166 3.04905 6.71678 3.07598 7.05957C3.14582 7.94874 3.18587 8.34042 3.27129 8.6377C3.30557 8.75682 3.35106 8.8643 3.45 9H14.6189C14.7195 8.86308 14.7642 8.75694 14.7977 8.6416C14.8817 8.35195 14.9206 7.97023 14.99 7.0918C15.0178 6.74067 15.034 6.37516 15.034 6C15.034 5.58861 15.0151 5.1885 14.9822 4.80664C14.9089 3.95385 14.8681 3.59429 14.7859 3.32129C14.7373 3.15985 14.6681 3.0029 14.3924 2.72852C14.1519 2.48933 13.9861 2.40607 13.7479 2.34082C13.3942 2.24409 12.9258 2.19934 11.9568 2.12109C11.0723 2.04968 10.0815 2.00002 9.03399 2Z" fill="#AD8200"/>
  </svg>
)

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
    <path d="M20 9.99972H19.9951C19.9951 4.47703 15.5191 0 9.99762 0C4.4762 0 0.000147544 4.47705 0.000122039 9.99972L0 12.4992C0 12.685 0.00485726 12.8709 0.0134114 13.0541C0.0666978 14.1955 0.0933409 14.7661 0.71579 15.3699C1.33824 15.9736 1.85314 15.9818 2.88296 15.9981C2.96132 15.9994 3.0401 15.9994 3.11846 15.9981C4.1474 15.9813 4.66188 15.9729 5.28329 15.3701C5.9047 14.7673 5.93144 14.1972 5.98492 13.0571C5.99356 12.8729 5.99847 12.686 5.99847 12.4992C5.99847 12.3123 5.99356 12.1254 5.98492 11.9413C5.93144 10.8011 5.9047 10.231 5.28329 9.62818C4.66188 9.02537 4.1474 9.01699 3.11846 9.00023C3.07879 8.99959 3.03904 8.99926 2.99924 8.99926L2.06154 8.99971C2.55353 5.05353 5.91905 1.99994 9.99762 1.99994C14.0762 1.99994 17.4417 5.05353 17.9337 8.99971C17.5814 8.99954 17.2288 8.9945 16.8766 9.00023C15.8477 9.01699 15.3332 9.02537 14.7118 9.62818C14.0904 10.231 14.0636 10.8011 14.0101 11.9413C14.0015 12.1254 13.9966 12.3123 13.9966 12.4992C13.9966 12.686 14.0015 12.8729 14.0101 13.0571C14.0636 14.1972 14.0904 14.7673 14.7118 15.3701C15.3332 15.9729 15.9711 15.9832 17 16C17.2399 16.0039 17.4036 15.9991 17.5 16C19.2187 16.0153 20 15 20 13V12.5V9.99972Z" fill="#9E66FF"/>
  </svg>
)

const WeekendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.10315 4.13665C1.06204 4.33589 1.02764 4.54485 0.997784 4.7657C0.502929 5.2093 0.157065 5.81528 0.0415364 6.5023C0 6.74931 0 7.04493 0 7.63616V8.24559C0 10.6758 0 11.8908 0.811672 12.7564C1.23932 13.2124 1.75814 13.4485 2.48682 13.5913L2.07179 14.6289C1.86668 15.1417 2.11609 15.7237 2.62888 15.9288C3.14166 16.1339 3.72363 15.8845 3.92874 15.3717L4.55341 13.81C6.36678 13.9305 8.18242 13.9998 10 13.9998C11.8179 13.9998 13.6339 13.9305 15.4476 13.81L16.0723 15.3717C16.2774 15.8845 16.8594 16.1339 17.3721 15.9288C17.8849 15.7237 18.1343 15.1417 17.9292 14.6289L17.5141 13.5911C18.2423 13.4483 18.7609 13.2122 19.1883 12.7564C20 11.8908 20 10.6758 20 8.24559V7.63616C20 7.04498 20 6.7493 19.9585 6.5023C19.8429 5.81528 19.4971 5.2093 19.0022 4.7657C18.9723 4.54464 18.9379 4.33548 18.8967 4.13607C18.6993 3.17952 18.3472 2.44712 17.6026 1.70004C16.2855 0.378707 14.9553 0.281783 12.2951 0.0879337C11.5484 0.0335215 10.7742 0 10 0C9.22581 0 8.45161 0.0335214 7.7049 0.0879337C5.04466 0.281783 3.71454 0.378707 2.39744 1.70004C1.6526 2.44727 1.30057 3.17982 1.10315 4.13665ZM3.1389 4.22336C4.23017 4.67082 5.00087 5.74272 5.00087 6.99876L5.00087 8H15.0009V6.99876C15.0009 5.74332 15.7708 4.67185 16.8613 4.224C16.723 3.73583 16.5218 3.44881 16.1861 3.11198C15.4793 2.40296 14.9522 2.28686 12.1497 2.08264C11.4426 2.03111 10.7176 2 10 2C9.28242 2 8.55743 2.03111 7.85025 2.08264C5.04775 2.28686 4.52067 2.40296 3.81392 3.11198C3.47832 3.44866 3.27719 3.73558 3.1389 4.22336Z" fill="#BBC1C7"/>
  </svg>
)

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.5 1C1.67157 1 1 1.67157 1 2.5V9.5C1 10.3284 1.67157 11 2.5 11H9.5C10.3284 11 11 10.3284 11 9.5V7C11 6.72386 10.7761 6.5 10.5 6.5C10.2239 6.5 10 6.72386 10 7V9.5C10 9.77614 9.77614 10 9.5 10H2.5C2.22386 10 2 9.77614 2 9.5V2.5C2 2.22386 2.22386 2 2.5 2H5C5.27614 2 5.5 1.77614 5.5 1.5C5.5 1.22386 5.27614 1 5 1H2.5ZM7.5 1C7.22386 1 7 1.22386 7 1.5C7 1.77614 7.22386 2 7.5 2H9.29289L5.14645 6.14645C4.95118 6.34171 4.95118 6.65829 5.14645 6.85355C5.34171 7.04882 5.65829 7.04882 5.85355 6.85355L10 2.70711V4.5C10 4.77614 10.2239 5 10.5 5C10.7761 5 11 4.77614 11 4.5V1.5C11 1.22386 10.7761 1 10.5 1H7.5Z" fill="#0070E5"/>
  </svg>
)

function CardHeader({ title, linkText }) {
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>{linkText}</span>
        <ExternalLinkIcon />
      </div>
    </div>
  )
}

function InfoBlock({ label, value, secondary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>{label}</span>
        <InfoIconGray />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={valueStyle}>{value}</span>
        {secondary && <span style={secondaryValueStyle}>{secondary}</span>}
      </div>
    </div>
  )
}

function Illustration({ src }) {
  return (
    <div style={{ width: 277, height: 156, flexShrink: 0, overflow: 'hidden' }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function WarningBanner({ title, subtitle }) {
  return (
    <div style={{ background: '#F2F3F7', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <InfoIcon />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#1D2023', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>{title}</div>
        {subtitle && <div style={{ color: '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '16px' }}>{subtitle}</div>}
      </div>
      <ChevronRight />
    </div>
  )
}

function CardButtons({ primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  const btnBase = { height: 44, borderRadius: 16, cursor: 'pointer', border: 'none', fontFamily: "'MTSWide', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', flex: '1 1 0' }
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20, paddingBottom: 12, display: 'flex', gap: 10, width: '100%', boxSizing: 'border-box' }}>
      <button onClick={onPrimary} style={{ ...btnBase, background: '#0066FF', color: '#fff' }}>{primaryLabel}</button>
      <button onClick={onSecondary} style={{ ...btnBase, background: '#F2F3F7', color: '#1D2023' }}>{secondaryLabel}</button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={labelStyle}>Ближайший отпуск</span>
                <InfoIconGray />
              </div>
              {nextVacation ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={valueStyle}>{formatDate(nextVacation.startDate)} – {formatDate(nextVacation.endDate)}</span>
                  <span style={grayValueStyle}>{nextVacation.days} {pluralDays(nextVacation.days)}</span>
                </div>
              ) : (
                <span style={grayValueStyle}>Нет запланированных отпусков</span>
              )}
            </div>
          </div>
          <Illustration src="/vacation.png" />
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
          <Illustration src="/schedule.png" />
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
  office:  { bg: '#FFECCC', text: '#AD8200', label: 'офис' },
  home:    { bg: '#F1EBFF', text: '#8B33FF', label: 'удалённо' },
  weekend: { bg: '#F2F3F7', text: '#969FA8', label: 'выходной' },
}

const PILL_ICONS = {
  office:  <OfficeIcon />,
  home:    <HomeIcon />,
  weekend: <WeekendIcon />,
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
          <Illustration src="/remote-work.png" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '20px', textTransform: 'uppercase', letterSpacing: 0.5 }}>МОЙ ФОРМАТ РАБОТЫ ДО 30 СЕНТЯБРЯ 2026</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>Графики коллег</span>
              <ExternalLinkIcon />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_PILLS.map(({ day, type }) => {
              const s = PILL_STYLES[type]
              return (
                <div key={day} style={{ flex: 1, height: 104, borderRadius: 12, background: s.bg, paddingTop: 8, paddingBottom: 8, paddingLeft: 4, paddingRight: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <span style={{ color: s.text, fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>{day}</span>
                  {PILL_ICONS[type]}
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
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={secondaryValueStyle}>По России, зарубежные, со сложным маршрутом</span>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Если до начала командировки осталось менее 5 рабочих дней, потребуется дополнительное согласование с председателем правления
            </span>
          </div>
          <Illustration src="/business-trip.png" />
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
      <div style={{ display: 'flex', gap: 32, paddingTop: 32, alignItems: 'flex-start' }}>
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
