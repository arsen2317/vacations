import { AppProvider, useApp } from './context/AppContext'
import PasswordGate from './components/PasswordGate'
import TopBar from './components/TopBar'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'
import { COLORS } from './ds/index'

function AppInner() {
  const { role, activeTab, setActiveTab } = useApp()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'MTSCompact', sans-serif" }}>
      <TopBar />
      <div style={{ background: '#fff', borderBottom: `1px solid ${COLORS.stroke}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
          <h1 style={{
            margin: 0,
            padding: '20px 0 8px',
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: '36px',
            fontFamily: "'MTSCompact', sans-serif",
          }}>
            Отпуск
          </h1>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
      {activeTab === 'home' && (
        <EmployeeDashboard
          onGoToPlanning={() => setActiveTab('planning')}
          onGoToTeam={() => setActiveTab('team')}
          onGoToHR={() => setActiveTab('hr')}
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
    <PasswordGate>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </PasswordGate>
  )
}
