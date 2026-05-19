import { createContext, useContext, useState } from 'react'
import { CURRENT_USER, CAMPAIGN } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState(CURRENT_USER.role)
  const [campaign, setCampaign] = useState(CAMPAIGN)

  return (
    <AppContext.Provider value={{ role, setRole, campaign, setCampaign }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
