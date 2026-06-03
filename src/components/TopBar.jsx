import { useApp } from '../context/AppContext'
import { COLORS } from '../ds/index'

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M3 12h18M3 17h18" stroke={COLORS.text} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function BreadArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke={COLORS.hint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill={COLORS.secondary}/>
    </svg>
  )
}

const ROLES = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Руководитель' },
  { value: 'hr_admin', label: 'HR-админ' },
]

export default function TopBar() {
  const { role, setRole, setActiveTab } = useApp()

  return (
    <header style={{
      background: '#fff',
      borderBottom: `1px solid ${COLORS.stroke}`,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 4 }}>
            <HamburgerIcon />
          </button>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>главная</span>
            <BreadArrow />
            <span style={{ color: COLORS.secondary, fontSize: 14, fontFamily: "'MTSCompact', sans-serif" }}>работа и отдых</span>
            <BreadArrow />
            <span style={{ color: COLORS.text, fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500 }}>отпуск</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.bg, padding: '4px 10px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: COLORS.hint, fontFamily: "'MTSCompact', sans-serif" }}>Роль:</span>
            <select
              value={role}
              onChange={e => { setRole(e.target.value); setActiveTab('home') }}
              style={{
                fontSize: 12,
                color: COLORS.text,
                fontFamily: "'MTSCompact', sans-serif",
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                padding: 0,
              }}
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: COLORS.secondary,
            fontSize: 14,
            fontFamily: "'MTSCompact', sans-serif",
            padding: 0,
          }}>
            <BellIcon />
            уведомления раздела
          </button>
        </div>
      </div>
    </header>
  )
}
