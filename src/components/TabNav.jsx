import { Tabs } from 'antd'
import { useApp } from '../context/AppContext'

const BASE_TABS = [
  { key: 'home',       label: 'Главная' },
  { key: 'planning',   label: 'Планирование' },
  { key: 'colleagues', label: 'Коллеги' },
]

export default function TabNav({ activeTab, onTabChange }) {
  const { role } = useApp()

  const items = [
    ...BASE_TABS,
    ...(role === 'manager' || role === 'hr_admin' ? [{ key: 'team', label: 'Команда' }] : []),
    ...(role === 'hr_admin' ? [{ key: 'hr', label: 'HR' }] : []),
  ]

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={items}
          style={{ marginBottom: 0 }}
        />
      </div>
    </div>
  )
}
