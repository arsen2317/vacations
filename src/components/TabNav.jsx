import { Tabs } from '../ds/index'
import { useApp } from '../context/AppContext'

const BASE_TABS = [
  { key: 'home',       label: 'Мой отпуск' },
  { key: 'colleagues', label: 'Планы коллег' },
]

export default function TabNav({ activeTab, onTabChange }) {
  const { role, incomingRequests } = useApp()

  const pendingCount = incomingRequests
    ? incomingRequests.filter(r => r.status === 'pending').length
    : 0

  const tabs = [
    ...BASE_TABS,
    ...(role === 'manager' || role === 'hr_admin'
      ? [{ key: 'team', label: 'Входящие заявки', count: pendingCount > 0 ? pendingCount : undefined }]
      : []),
    ...(role === 'hr_admin' ? [{ key: 'hr', label: 'HR – панель' }] : []),
  ]

  return (
    <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />
  )
}
