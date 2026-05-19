import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/TopBar'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import ColleaguesPage from './pages/ColleaguesPage'
import ManagerPage from './pages/ManagerPage'
import HRAdminPage from './pages/HRAdminPage'

function AppInner() {
  const { role } = useApp()
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
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
