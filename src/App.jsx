import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import TopBar from './components/TopBar'
import TabNav from './components/TabNav'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PlanningPage from './pages/PlanningPage'
import RequestsPage from './pages/RequestsPage'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'home' && (
          <EmployeeDashboard onGoToPlanning={() => setActiveTab('planning')} />
        )}
        {activeTab === 'planning' && <PlanningPage />}
        {activeTab === 'requests' && <RequestsPage />}
        {activeTab === 'colleagues' && <ColleaguesPlaceholder />}
      </div>
    </AppProvider>
  )
}

function ColleaguesPlaceholder() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">Раздел «Коллеги»</p>
      <p className="text-sm text-gray-400">Будет доступен в следующей итерации</p>
    </div>
  )
}
