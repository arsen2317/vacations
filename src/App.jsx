import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/TopBar'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'
import { COLORS } from './ds/index'

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#626C77"/>
    </svg>
  )
}

function AppInner() {
  const { role, activeTab, setActiveTab } = useApp()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <TopBar />
      <div style={{ background: '#fff', borderBottom: `1px solid ${COLORS.stroke}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 0 8px',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: '36px',
              fontFamily: "'MTSCompact', sans-serif",
            }}>
              Отпуск
            </h1>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.secondary,
              fontSize: 14,
              fontFamily: 'inherit',
              padding: 0,
            }}>
              <BellIcon />
              уведомления раздела
            </button>
          </div>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
      {activeTab === 'home' && (
        <EmployeeDashboard
          onGoToPlanning={() => setActiveTab('planning')}
          onGoToTeam={() => setActiveTab('team')}
          onGoToHR={() => setActiveTab('hr')}
          onGoToRequests={() => setActiveTab('home')}
        />
      )}
      {activeTab === 'planning' && (
        <PlanningPage onGoToRequests={() => setActiveTab('home')} />
      )}
      {activeTab === 'colleagues' && <ColleaguesPage />}
      {activeTab === 'team' && (role === 'manager' || role === 'hr_admin') && <ManagerPage />}
      {activeTab === 'hr' && role === 'hr_admin' && <HRAdminPage />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
