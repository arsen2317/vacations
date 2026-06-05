import { createContext, useContext, useState } from 'react'
import {
  CURRENT_USER, CAMPAIGN, INITIAL_SEGMENTS, APPROVED_SEGMENTS,
  MY_REQUESTS, SUBORDINATES,
} from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState(CURRENT_USER.role)
  const [activeTab, setActiveTab] = useState('home')
  const [campaign, setCampaign] = useState(CAMPAIGN)
  const [segments, setSegments] = useState(INITIAL_SEGMENTS)
  const [draftSaved, setDraftSaved] = useState(false)
  const [planStatus, setPlanStatus] = useState('draft') // 'draft' | 'pending' | 'approved'
  const [approvedSegments] = useState(APPROVED_SEGMENTS)
  const [reschedules, setReschedules] = useState({})
  const [requests, setRequests] = useState(MY_REQUESTS)
  const [subordinates, setSubordinates] = useState(SUBORDINATES)
  const [balance, setBalance] = useState({
    main: CURRENT_USER.balanceDays,
    extra: CURRENT_USER.balanceExtra,
    accumulated: CURRENT_USER.balanceAccumulated,
  })

  return (
    <AppContext.Provider value={{
      role, setRole,
      activeTab, setActiveTab,
      campaign, setCampaign,
      segments, setSegments,
      draftSaved, setDraftSaved,
      planStatus, setPlanStatus,
      approvedSegments,
      reschedules, setReschedules,
      requests, setRequests,
      subordinates, setSubordinates,
      balance, setBalance,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
