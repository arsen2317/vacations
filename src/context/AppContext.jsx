import { createContext, useContext, useState } from 'react'
import { CURRENT_USER, CAMPAIGN, INITIAL_SEGMENTS, APPROVED_SEGMENTS } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState(CURRENT_USER.role)
  const [campaign, setCampaign] = useState(CAMPAIGN)
  const [segments, setSegments] = useState(INITIAL_SEGMENTS)
  const [draftSaved, setDraftSaved] = useState(false)
  const [planStatus, setPlanStatus] = useState('draft') // 'draft' | 'pending' | 'approved'
  const [approvedSegments] = useState(APPROVED_SEGMENTS)
  // reschedules: { [segId]: { count: number, pending: null | { startDate, endDate } } }
  const [reschedules, setReschedules] = useState({})

  return (
    <AppContext.Provider value={{
      role, setRole,
      campaign, setCampaign,
      segments, setSegments,
      draftSaved, setDraftSaved,
      planStatus, setPlanStatus,
      approvedSegments,
      reschedules, setReschedules,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
