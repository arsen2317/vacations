import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/TopBar'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'

const ROLE_ALLOWED_TABS = {
  employee: ['home', 'planning', 'colleagues'],
  manager:  ['home', 'planning', 'colleagues', 'team'],
  hr_admin: ['home', 'planning', 'colleagues', 'hr'],
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('home')
  const { role } = useApp()

  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[role] || ROLE_ALLOWED_TABS.employee
    if (!allowed.includes(activeTab)) {
      setActiveTab('home')
    }
  }, [role])

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'home'       && <EmployeeDashboard onGoToPlanning={() => setActiveTab('planning')} />}
      {activeTab === 'planning'   && <PlanningPage />}
      {activeTab === 'colleagues' && <ColleaguesPage />}
      {activeTab === 'team'       && <ManagerPage />}
      {activeTab === 'hr'         && <HRAdminPage />}
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
