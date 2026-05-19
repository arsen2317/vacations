import { useApp } from '../context/AppContext'

const BASE_TABS = [
  { key: 'home',       label: 'Главная'      },
  { key: 'planning',   label: 'Планирование' },
  { key: 'colleagues', label: 'Коллеги'      },
]

const ROLE_EXTRA_TABS = {
  manager:  [{ key: 'team', label: 'Команда' }],
  hr_admin: [{ key: 'hr',   label: 'HR'      }],
}

export default function TabNav({ activeTab, onTabChange }) {
  const { role } = useApp()
  const tabs = [...BASE_TABS, ...(ROLE_EXTRA_TABS[role] || [])]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
