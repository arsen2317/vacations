const TABS = [
  { key: 'home',       label: 'Главная' },
  { key: 'planning',   label: 'Планирование' },
  { key: 'requests',   label: 'Мои заявки' },
  { key: 'colleagues', label: 'Коллеги' },
]

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex">
          {TABS.map(tab => (
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
