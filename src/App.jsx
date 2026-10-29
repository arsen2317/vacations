import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'
import { Header, useIsDocked } from './ds/index'
import WorkAndRestPage from './pages/WorkAndRestPage'
import RequestsPage from './pages/RequestsPage'
import { LOCALE } from './i18n/locale'

function AppInner() {
  const { role, setRole, activeTab, setActiveTab, hasExtraLeave, setHasExtraLeave } = useApp()
  const isDocked = useIsDocked()
  const [sidebarOpen, setSidebarOpen] = useState(LOCALE !== 'en')
  const [dashYear, setDashYear] = useState(2026)

  useEffect(() => {
    if (LOCALE === 'en') { setSidebarOpen(false); return }
    if (!isDocked) setSidebarOpen(false)
    else setSidebarOpen(true)
  }, [isDocked])

  function handleRoleChange(value) {
    setRole(value)
    const tabsAlwaysAccessible = ['work', 'home', 'planning', 'colleagues', 'requests']
    if (!tabsAlwaysAccessible.includes(activeTab)) {
      setActiveTab('home')
    }
  }

  const sidebarShown = isDocked && sidebarOpen
  // Зона контента фиксирована: 1440 с полями 88. При росте экрана растут боковые поля.
  const shellStyle = sidebarShown ? { marginLeft: 280 } : undefined
  const contentStyle = { maxWidth: 1440, margin: '0 auto', padding: '0 88px 88px' }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'MTSCompact', sans-serif" }}>
      <style>{`.modal-scroll::-webkit-scrollbar { width: 3px; } .modal-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 0; } .modal-scroll::-webkit-scrollbar-thumb { background: #D0D5DC; border-radius: 0; } .mts-textarea::placeholder { color: #626C77 !important; } .mts-search-input::placeholder { color: #626C77; } .sidebar-scroll { overflow-y: auto; scrollbar-width: none; } .sidebar-scroll::-webkit-scrollbar { width: 0; } .sidebar-scroll:hover { scrollbar-width: thin; scrollbar-color: #D0D5DC transparent; } .sidebar-scroll:hover::-webkit-scrollbar { width: 3px; } .sidebar-scroll:hover::-webkit-scrollbar-track { background: transparent; } .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: #D0D5DC; border-radius: 0; }`}</style>

      <Header
        role={role}
        onRoleChange={handleRoleChange}
        extraLeave={hasExtraLeave}
        onExtraLeaveChange={setHasExtraLeave}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={LOCALE === 'en' ? undefined : () => setSidebarOpen(v => !v)}
        onSidebarClose={isDocked ? undefined : () => setSidebarOpen(false)}
        onNavigate={setActiveTab}
        activeTab={activeTab}
      />

      {activeTab !== 'work' && activeTab !== 'requests' && (
        <div style={{ background: '#fff', ...shellStyle }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 88px' }}>
            <div>
              <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', ...shellStyle }}>
        <div style={contentStyle}>
        {activeTab === 'work' && (
          <WorkAndRestPage onGoTo={(tab, year) => { if (year) setDashYear(year); setActiveTab(tab) }} />
        )}
        {activeTab === 'home' && (
          <EmployeeDashboard
            onGoToPlanning={() => setActiveTab('planning')}
            onGoToTeam={() => setActiveTab('team')}
            onGoToHR={() => setActiveTab('hr')}
            onGoToRequests={() => setActiveTab('requests')}
            initialYear={dashYear}
          />
        )}
        {activeTab === 'planning' && (
          <PlanningPage onGoToRequests={() => setActiveTab('home')} />
        )}
        {activeTab === 'colleagues' && <ColleaguesPage />}
        {activeTab === 'requests' && <RequestsPage />}
        {activeTab === 'team' && (role === 'manager' || role === 'hr_admin') && <ManagerPage />}
        {activeTab === 'hr' && role === 'hr_admin' && <HRAdminPage />}
        </div>
      </div>
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
