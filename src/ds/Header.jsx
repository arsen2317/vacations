import { useState } from "react";
import { useIsDocked } from "./useIsDocked";

const BASE = import.meta.env.BASE_URL;
const I = (name) => `${BASE}icons/${name}.png`;

const NavImg = ({ name }) => (
  <img src={I(name)} alt="" width={24} height={24} style={{ flexShrink: 0, objectFit: 'contain' }} onError={e => { e.target.style.opacity = 0 }} />
);

const LogoSVG = ({ width = 208, height = 44 }) => (
  <svg width={width} height={height} viewBox="0 0 208 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M72.1523 18.8618C74.6518 18.657 76.6584 18.8618 78.9435 20.1131V17.1339C77.1535 16.3146 74.3954 15.8948 72.1523 16.0226C68.2274 16.2457 64.1367 18.438 64.1367 21.9991C64.1367 25.5603 68.2274 27.7526 72.1523 27.9757C74.3976 28.1034 77.1535 27.6836 78.9435 26.8643V23.8831C76.6584 25.1364 74.6518 25.3392 72.1523 25.1344C69.9357 24.9539 67.4517 24.1083 67.4517 21.9971C67.4517 19.8859 69.9357 19.0423 72.1523 18.8618Z" fill="#0066FF"/>
    <path d="M61.001 19.7114C60.3778 19.3991 59.6662 19.2227 58.9082 19.2227H52.002V16.3125H48.9766V27.6713H58.8529H58.9082C59.6662 27.6713 60.3778 27.4929 61.001 27.1826C62.4618 26.4748 63.4563 25.0674 63.4563 23.447C63.4563 21.8266 62.4618 20.4192 61.001 19.7114ZM58.8529 24.895H52.002V21.999H58.8529C59.7237 21.999 60.4308 22.648 60.4308 23.447C60.4308 24.2461 59.7259 24.895 58.8529 24.895Z" fill="#0066FF"/>
    <path d="M30.6328 27.718V24.8788C33.2936 24.8788 33.5301 24.1751 33.6428 23.8364C34.213 22.1308 35.1677 17.5151 35.1765 17.4685L35.4152 16.3125H46.7214V27.6774H43.6275V19.1537H37.9699C37.6362 20.693 37.0351 23.3659 36.5975 24.6699C35.687 27.4037 32.6328 27.718 30.6328 27.718Z" fill="#0066FF"/>
    <path d="M14.756 27.6366H11.7283V19.0987H3.02987V27.6366H0V16.3203H14.756V27.6366Z" fill="#0066FF"/>
    <path d="M33.2178 16.3203H29.5514L24.6033 24.2579L19.432 16.3203H15.7656L22.7712 26.9288L20.2033 30.999H23.8696L33.2178 16.3203Z" fill="#0066FF"/>
    <rect width="1" height="18" transform="translate(87.9453 13)" fill="#BCC3D0" fillOpacity="0.5"/>
    <g clipPath="url(#clip0_10120_97401)">
      <path d="M104.361 13C105.696 13 107.284 14.2902 108.605 16.4589C109.963 18.7052 110.777 21.4855 110.777 23.9001C110.777 27.4352 108.792 31 104.361 31C99.9261 31 97.9453 27.4352 97.9453 23.9001C97.9453 21.4854 98.76 18.7052 100.125 16.4589C101.435 14.2901 103.022 13 104.361 13ZM126.655 23.5572L129.22 13.9644H137.723V30.0356H132.911V16.9551L129.413 30.0356H123.896L120.401 16.9631V30.0356H115.589V13.9644H124.09L126.655 23.5572ZM152.801 18.3038H148.31V30.0356H143.498V18.3038H139.007V13.9644H152.801V18.3038ZM170.124 18.3038H163.066C160.065 18.3038 158.091 19.3784 158.091 22C158.091 24.6216 160.065 25.6962 163.066 25.6962H170.124V30.0356H163.066C156.581 30.0354 153.12 26.8053 153.12 22C153.12 17.1947 156.581 13.9645 163.066 13.9644H170.124V18.3038ZM181.397 15.886H177.202V16.9343H179.329C181.107 16.9344 181.967 17.8191 181.967 19.3793C181.967 21.0213 181.107 21.9999 179.329 22H174.935V13.9644H181.397V15.886ZM190.637 22H188.184L187.72 20.4627H184.884L184.43 22H182.315L184.791 13.9644H188.161L190.637 22ZM193.775 16.9103H196.367V13.9644H198.691V22H196.367V18.8903H193.775V22H191.45V13.9644H193.775V16.9103ZM202.409 16.9103H202.817L204.897 13.9644H207.349L204.675 17.7956L207.582 22H204.897L202.746 18.8903H202.409V22H200.085V13.9644H202.409V16.9103ZM177.202 20.1951H178.899C179.329 20.195 179.584 19.9738 179.584 19.5662V19.2746C179.584 18.8555 179.364 18.6227 178.899 18.6226H177.202V20.1951ZM185.406 18.7161H187.197L186.302 15.7462L185.406 18.7161Z" fill="#E30611"/>
    </g>
    <defs>
      <clipPath id="clip0_10120_97401">
        <rect width="109.636" height="18" fill="white" transform="translate(97.9453 13)"/>
      </clipPath>
    </defs>
  </svg>
);

const BurgerLines = ({ color = '#292929' }) => (
  <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
    <div style={{ width: 16, height: 1.5, left: 4, top: 6, position: 'absolute', background: color }} />
    <div style={{ width: 16, height: 1.5, left: 4, top: 11, position: 'absolute', background: color }} />
    <div style={{ width: 16, height: 1.5, left: 4, top: 16, position: 'absolute', background: color }} />
  </div>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6 4l4 4-4 4" stroke="#626C77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M10.949 8.606C11.383 10.127 11.651 10.939 12.757 11.375C13.573 11.699 14.09 12.439 13.987 13.18C13.956 13.443 13.76 14.315 12.447 14.538L2.062 16.333C1.897 16.363 1.742 16.373 1.597 16.373C0.636999 16.373 0.253999 15.765 0.149999 15.563C-0.180001 14.903 0.0469992 14.031 0.707999 13.453C1.587 12.673 1.566 11.821 1.442 10.249C1.39115 9.66567 1.3638 9.08053 1.36 8.495C1.38 6.122 2.858 4.621 4.439 4.053L4.046 1.893C4.02885 1.79366 4.03158 1.69189 4.05403 1.59361C4.07649 1.49533 4.11823 1.40248 4.17682 1.32045C4.23542 1.23841 4.30971 1.16882 4.3954 1.1157C4.48109 1.06258 4.57646 1.02699 4.676 1.011C4.87738 0.97418 5.08515 1.01864 5.25382 1.13465C5.4225 1.25066 5.53834 1.42877 5.576 1.63L5.968 3.79C7.652 3.79 9.564 4.702 10.412 6.923C10.639 7.521 10.804 8.099 10.949 8.606ZM1.814 14.832L12.2 13.038C12.314 13.018 12.386 12.998 12.417 12.987C12.3526 12.898 12.2626 12.8307 12.159 12.794C10.304 12.056 9.888 10.592 9.445 9.036L9.441 9.022L9.42 8.947C9.282 8.464 9.142 7.971 8.945 7.46C8.284 5.716 6.672 5.148 5.452 5.351C4.243 5.554 2.921 6.639 2.911 8.505C2.911 9.083 2.951 9.62 2.993 10.137C3.127 11.75 3.241 13.271 1.753 14.589C1.67093 14.6589 1.60999 14.7504 1.577 14.853C1.629 14.853 1.712 14.853 1.815 14.833L1.814 14.832ZM8.861 16.617C8.831 17.753 7.962 18.747 6.753 18.96C5.534 19.173 4.377 18.524 3.953 17.469L8.862 16.617H8.861Z" fill="#292929"/>
    <path d="M14 6C15.6569 6 17 4.65685 17 3C17 1.34315 15.6569 0 14 0C12.3431 0 11 1.34315 11 3C11 4.65685 12.3431 6 14 6Z" fill="#3385FF"/>
  </svg>
);

const FAVORITES = [
  { label: 'работа и отдых', icon: <NavImg name="rabota-i-otdyh" /> },
  { label: 'делегирование',  icon: <NavImg name="delegirovanie" /> },
];

const FREQUENT = [
  { label: 'пункт управления',          icon: <NavImg name="punkt-upravleniya" /> },
  { label: 'развитие',                  icon: <NavImg name="razvitie" /> },
  { label: 'полка',                     icon: <NavImg name="polka" /> },
  { label: 'сервисы',                   icon: <NavImg name="servisy" /> },
  { label: 'корпоративная жизнь',       icon: <NavImg name="korp-zhizn" /> },
  { label: 'обращения и справки',       icon: <NavImg name="obrashcheniya" /> },
  { label: 'талант-ревью',              icon: <NavImg name="talant-revyu" /> },
  { label: 'моя карьера',               icon: <NavImg name="moya-kariera" /> },
  { label: 'мой доход',                 icon: <NavImg name="moy-dohod" /> },
  { label: 'цели',                      icon: <NavImg name="tseli" /> },
  { label: 'задачи',                    icon: <NavImg name="zadachi" /> },
  { label: 'обратная связь',            icon: <NavImg name="obratnaya-svyaz" /> },
  { label: 'так принято в МТС\nФинтех', icon: <NavImg name="tak-prinyato" /> },
  { label: 'кибербезопасность',         icon: <NavImg name="kiberbezopasnost" /> },
  { label: 'ритм',                      icon: <NavImg name="ritm" /> },
  { label: 'оценка',                    icon: <NavImg name="otsenka" /> },
  { label: 'структура',                 icon: <NavImg name="struktura" /> },
  { label: 'тесты, опросы, 360',        icon: <NavImg name="testy" /> },
];

const SECTION_LABEL = { color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '18px' };
const NAV_ITEM_TEXT = { color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' };

const ROLES = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager',  label: 'Руководитель' },
  { value: 'hr_admin', label: 'HR-админ' },
];

function Sidebar({ open, isDocked, onClose, role, onRoleChange }) {
  return (
    <>
      {!isDocked && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
          }}
        />
      )}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 280, height: '100vh',
        background: '#F8F8F8',
        zIndex: isDocked ? 101 : 201,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: isDocked ? 'none' : 'transform 0.25s ease',
        boxShadow: (!isDocked && open) ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
      }}>
        <div style={{ paddingTop: 24, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div onClick={onClose} style={{ cursor: 'pointer', height: 24, display: 'flex', alignItems: 'center', paddingRight: 16, flexShrink: 0 }}>
            <BurgerLines color="#1D2023" />
          </div>
          <LogoSVG width={142} height={30} />
        </div>

        <div style={{ paddingBottom: 24, paddingLeft: 24, paddingRight: 24, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ paddingBottom: 7 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: '#EDEDED', position: 'relative', overflow: 'hidden', outline: '1px solid #E3E3E3', outlineOffset: -1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#A9AAAC', fontSize: 13.6, fontFamily: 'Helvetica', fontWeight: 700, lineHeight: '16px' }}>АМ</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '20px' }}>Алексей Морозов</div>
          <div style={{ textAlign: 'center', color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>Продуктовая разработка</div>
        </div>

        <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 40, display: 'flex', alignItems: 'center', paddingLeft: 24, gap: 8, flexShrink: 0, cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6.65102 6.00002H9.52402C9.88402 6.00002 10.174 6.29002 10.174 6.65102V9.52402C10.174 9.88402 9.88402 10.174 9.52402 10.174H6.65002C6.56471 10.1742 6.48021 10.1575 6.40135 10.1249C6.3225 10.0924 6.25084 10.0446 6.19046 9.98429C6.13009 9.92401 6.0822 9.85242 6.04952 9.77362C6.01684 9.69481 6.00002 9.61033 6.00002 9.52502V6.65002C6.00002 6.29002 6.29002 6.00002 6.65102 6.00002ZM9.52402 5.00002H6.65002C5.73702 5.00002 5.00002 5.73702 5.00002 6.65102V9.52402C5.00002 10.437 5.73702 11.174 6.65102 11.174H9.52402C10.437 11.174 11.174 10.437 11.174 9.52402V6.65002C11.174 5.73602 10.437 5.00002 9.52402 5.00002ZM6.65002 13.825H9.52302C9.88302 13.825 10.173 14.115 10.173 14.477V17.349C10.173 17.71 9.88302 18 9.52302 18H6.65002C6.56463 18.0002 6.48004 17.9834 6.40112 17.9508C6.3222 17.9182 6.25049 17.8703 6.19011 17.8099C6.12973 17.7496 6.08185 17.6778 6.04923 17.5989C6.01661 17.52 5.99989 17.4354 6.00002 17.35V14.476C6.00002 14.116 6.29002 13.826 6.65102 13.826L6.65002 13.825ZM9.52302 12.825H6.65002C5.73602 12.825 4.99902 13.563 4.99902 14.477V17.349C5.00002 18.263 5.73702 19 6.65102 19H9.52402C10.437 19 11.174 18.263 11.174 17.35V14.476C11.174 13.563 10.437 12.826 9.52402 12.826L9.52302 12.825ZM17.349 6.00002H14.476C14.3905 5.99989 14.3059 6.01665 14.2269 6.04933C14.1479 6.08201 14.0762 6.12997 14.0158 6.19046C13.9554 6.25095 13.9075 6.32278 13.8749 6.40182C13.8424 6.48085 13.8258 6.56554 13.826 6.65102V9.52402C13.826 9.88402 14.116 10.174 14.476 10.174H17.349C17.71 10.174 18 9.88402 18 9.52402V6.65002C18.0002 6.56454 17.9834 6.47988 17.9507 6.40089C17.918 6.32191 17.8701 6.25015 17.8096 6.18976C17.7491 6.12936 16.6773 6.08151 17.5982 6.04895C17.5192 6.01639 17.4345 5.99976 17.349 6.00002ZM14.476 5.00002H17.349C18.263 5.00002 19 5.73702 19 6.65102V9.52402C19 10.437 18.263 11.174 17.349 11.174H14.476C14.2593 11.1742 14.0447 11.1316 13.8444 11.0487C13.6442 10.9658 13.4622 10.8443 13.309 10.691C13.1558 10.5378 13.0342 10.3559 12.9514 10.1556C12.8685 9.95536 12.8259 9.74074 12.826 9.52402V6.65002C12.826 5.73602 13.563 5.00002 14.476 5.00002ZM14.476 13.825H17.349C17.71 13.825 18 14.115 18 14.477V17.349C18 17.71 17.71 18 17.349 18H14.476C14.3906 18.0002 14.306 17.9834 14.2271 17.9508C14.1482 17.9182 14.0765 17.8703 14.0161 17.8099C13.9557 17.7496 13.9079 17.6778 13.8752 17.5989C13.8426 17.52 13.8259 17.4354 13.826 17.35V14.476C13.826 14.116 14.116 13.825 14.476 13.825ZM17.349 12.825H14.476C13.563 12.825 12.826 13.563 12.826 14.477V17.349C12.826 18.263 13.563 19 14.476 19H17.349C18.263 19 19 18.263 19 17.35V14.476C19 13.563 18.263 12.826 17.349 12.826V12.825Z" fill="#8D969F"/>
            </svg>
            <span style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>все приложения</span>
          </div>

          <div style={{ paddingLeft: 24, paddingRight: 24, ...SECTION_LABEL }}>избранные</div>
          <div style={{ paddingTop: 8, paddingLeft: 24, paddingRight: 16, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAVORITES.map(({ label, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                {icon}
                <span style={NAV_ITEM_TEXT}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ paddingLeft: 24, paddingRight: 24, ...SECTION_LABEL }}>часто используемые</div>
          <div style={{ paddingTop: 8, paddingBottom: 24, paddingLeft: 24, paddingRight: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FREQUENT.map(({ label, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                {icon}
                <span style={{ ...NAV_ITEM_TEXT, whiteSpace: 'pre-line' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prototype role switcher */}
        <div style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, borderTop: '1px solid #CECECE', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#8C9BAB', fontFamily: "'MTSCompact', sans-serif", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Прототип — просмотр как</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => onRoleChange(r.value)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: "'MTSCompact', sans-serif",
                  background: role === r.value ? '#1D2023' : '#ECECEC',
                  color: role === r.value ? '#fff' : '#626C77',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 17, paddingBottom: 16, paddingLeft: 24, paddingRight: 24, borderTop: '1px solid #CECECE', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 20.474C16.632 20.474 20.467 16.639 20.467 12.007C20.467 7.38304 16.624 3.54004 11.992 3.54004C7.36796 3.54004 3.53296 7.38304 3.53296 12.007C3.53296 16.639 7.37596 20.474 12 20.474ZM12 19.062C11.0729 19.0654 10.1544 18.8851 9.29743 18.5316C8.44043 18.1781 7.6619 17.6585 7.00676 17.0026C6.35162 16.3467 5.83284 15.5676 5.48034 14.7102C5.12784 13.8528 4.9486 12.9341 4.95296 12.007C4.9482 11.0805 5.1269 10.1623 5.47875 9.30514C5.8306 8.44803 6.34864 7.66905 7.00299 7.01311C7.65735 6.35718 8.43508 5.83726 9.29134 5.48335C10.1476 5.12943 11.0654 4.94852 11.992 4.95104C12.9196 4.94867 13.8386 5.1295 14.6962 5.48316C15.5538 5.83682 16.3331 6.35634 16.9894 7.01192C17.6457 7.6675 18.1661 8.44622 18.5208 9.30341C18.8754 10.1606 19.0573 11.0794 19.056 12.007C19.0603 12.9349 18.8808 13.8544 18.5278 14.7124C18.1747 15.5705 17.6551 16.35 16.999 17.0061C16.343 17.6622 15.5634 18.1818 14.7053 18.5348C13.8473 18.8879 12.9278 19.0664 12 19.062ZM11.826 13.725C12.249 13.725 12.498 13.468 12.498 13.135V13.036C12.498 12.571 12.772 12.281 13.345 11.899C14.15 11.368 14.723 10.878 14.723 9.89004C14.723 8.50404 13.494 7.76504 12.091 7.76504C10.664 7.76504 9.72596 8.43804 9.49296 9.20104C9.45085 9.33542 9.42862 9.47523 9.42696 9.61604C9.42696 9.98104 9.71696 10.189 9.99096 10.189C10.464 10.189 10.539 9.93204 10.805 9.62504C11.079 9.16804 11.477 8.89404 12.033 8.89404C12.789 8.89404 13.287 9.31704 13.287 9.95704C13.287 10.521 12.93 10.795 12.207 11.293C11.61 11.708 11.17 12.148 11.17 12.961V13.069C11.17 13.509 11.402 13.725 11.826 13.725ZM11.809 16.207C12.291 16.207 12.706 15.825 12.706 15.344C12.706 14.854 12.299 14.48 11.809 14.48C11.319 14.48 10.913 14.862 10.913 15.344C10.913 15.817 11.328 16.207 11.809 16.207Z" fill="#8D969F"/>
          </svg>
          <span style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>поддержка</span>
        </div>
      </div>
    </>
  );
}

export function Header({ role, onRoleChange, sidebarOpen = true, onSidebarToggle, onSidebarClose }) {
  const isDocked = useIsDocked();

  const sidebarShown = isDocked ? sidebarOpen : sidebarOpen;

  return (
    <>
      <Sidebar open={sidebarShown} isDocked={isDocked} onClose={onSidebarClose} role={role} onRoleChange={onRoleChange} />

      <div style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
        <div style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
          <div style={{
            ...(isDocked && sidebarOpen
              ? { marginLeft: 280, width: 'calc(100% - 280px)' }
              : { maxWidth: 1440, margin: '0 auto', width: '100%' }
            ),
            height: 72, paddingLeft: 88, paddingRight: 88,
            display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box',
          }}>
            <div
              onClick={onSidebarToggle}
              style={{ height: 24, paddingRight: 16, display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <BurgerLines />
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>главная</span>
                <div style={{ display: 'flex', alignItems: 'center', height: 20 }}><ChevronRightIcon /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>работа и отдых</span>
                <div style={{ display: 'flex', alignItems: 'center', height: 20 }}><ChevronRightIcon /></div>
              </div>
              <span style={{ color: '#1D2023', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>отпуск</span>
            </div>

            <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ paddingLeft: 4, paddingRight: 8, display: 'flex', alignItems: 'center' }}>
                <BellIcon />
              </div>
              <span style={{ color: '#1D2023', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px', whiteSpace: 'nowrap' }}>уведомления раздела</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
