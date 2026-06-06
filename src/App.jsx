import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import PasswordGate from './components/PasswordGate'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'
import { COLORS, Header, useIsDocked } from './ds/index'
import WorkAndRestPage from './pages/WorkAndRestPage'

function AppInner() {
  const { role, setRole, activeTab, setActiveTab } = useApp()
  const isDocked = useIsDocked()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isDocked) setSidebarOpen(false)
    else setSidebarOpen(true)
  }, [isDocked])

  function handleRoleChange(value) {
    setRole(value)
    setActiveTab('home')
  }

  const sidebarShown = isDocked && sidebarOpen
  const contentStyle = sidebarShown
    ? { marginLeft: 280, padding: '0 88px 88px' }
    : { maxWidth: 1440, margin: '0 auto', padding: '0 88px 88px' }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'MTSCompact', sans-serif" }}>
      <style>{`.modal-scroll::-webkit-scrollbar { width: 3px; } .modal-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 0; } .modal-scroll::-webkit-scrollbar-thumb { background: #D0D5DC; border-radius: 0; } .mts-textarea::placeholder { color: #8C9BAB !important; } .sidebar-scroll { overflow-y: auto; scrollbar-width: none; } .sidebar-scroll::-webkit-scrollbar { width: 0; } .sidebar-scroll:hover { scrollbar-width: thin; scrollbar-color: #D0D5DC transparent; } .sidebar-scroll:hover::-webkit-scrollbar { width: 3px; } .sidebar-scroll:hover::-webkit-scrollbar-track { background: transparent; } .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: #D0D5DC; border-radius: 0; }`}</style>

      <Header
        role={role}
        onRoleChange={handleRoleChange}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
        onSidebarClose={() => setSidebarOpen(false)}
        onNavigate={setActiveTab}
        activeTab={activeTab}
      />

      {activeTab !== 'work' && (
        <div style={{ background: '#fff' }}>
          <div style={sidebarShown
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
      )}

      <div style={{ background: '#fff' }}>
        <div style={contentStyle}>
        {activeTab === 'work' && (
          <WorkAndRestPage onGoTo={setActiveTab} />
        )}
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
