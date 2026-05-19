import { AppProvider } from './context/AppContext'
import TopBar from './components/TopBar'
import EmployeeDashboard from './pages/EmployeeDashboard'

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <EmployeeDashboard />
      </div>
    </AppProvider>
  )
}
