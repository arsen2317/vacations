import { Tabs } from '../ds/index'
import { useApp } from '../context/AppContext'

const BASE_TABS = [
  { key: 'home',       label: 'Заявки на отпуск' },
  { key: 'planning',   label: 'Планирование' },
  { key: 'colleagues', label: 'Календарь отпуска' },
]

export default function TabNav({ activeTab, onTabChange }) {
  const { role } = useApp()

  const tabs = [
    ...BASE_TABS,
    ...(role === 'manager' || role === 'hr_admin' ? [{ key: 'team', label: 'Команда' }] : []),
    ...(role === 'hr_admin' ? [{ key: 'hr', label: 'HR-панель' }] : []),
  ]

  return (
    <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />
  )
}
