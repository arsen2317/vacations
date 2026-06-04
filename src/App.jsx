import { AppProvider, useApp } from './context/AppContext'
import PasswordGate from './components/PasswordGate'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'
import { COLORS, Header, useIsDocked } from './ds/index'

function AppInner() {
  const { role, setRole, activeTab, setActiveTab } = useApp()
  const isDocked = useIsDocked()

  function handleRoleChange(value) {
    setRole(value)
    setActiveTab('home')
  }

  const contentStyle = isDocked
    ? { marginLeft: 280, padding: '0 88px 88px' }
    : { maxWidth: 1440, margin: '0 auto', padding: '0 88px 88px' }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'MTSCompact', sans-serif" }}>
      <style>{`.modal-scroll::-webkit-scrollbar { width: 4px; } .modal-scroll::-webkit-scrollbar-track { background: transparent; } .modal-scroll::-webkit-scrollbar-thumb { background: #BCC3D0; border-radius: 2px; } .modal-scroll { scrollbar-width: thin; scrollbar-color: #BCC3D0 transparent; } .mts-textarea::placeholder { color: rgb(140, 155, 171); }`}</style>

      <Header role={role} onRoleChange={handleRoleChange} />

      <div style={{ background: '#fff' }}>
        <div style={isDocked
          ? { marginLeft: 280, padding: '0 88px' }
          : { maxWidth: 1440, margin: '0 auto', padding: '0 88px' }
        }>
          <h1 style={{
            margin: '36px 0 0',
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.text,
            lineHeight: '36px',
            fontFamily: "'MTSWide', sans-serif",
          }}>
            Отпуск
          </h1>
          <div style={{ paddingTop: 12 }}>
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff' }}>
        <div style={contentStyle}>
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
      </div>
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
