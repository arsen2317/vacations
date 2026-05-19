import { createContext, useContext, useState } from 'react'
import { CURRENT_USER, CAMPAIGN, INITIAL_SEGMENTS } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState(CURRENT_USER.role)
  const [campaign, setCampaign] = useState(CAMPAIGN)
  const [segments, setSegments] = useState(INITIAL_SEGMENTS)
  const [draftSaved, setDraftSaved] = useState(false)

  return (
    <AppContext.Provider value={{
      role, setRole,
      campaign, setCampaign,
      segments, setSegments,
      draftSaved, setDraftSaved,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
