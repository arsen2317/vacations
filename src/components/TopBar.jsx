import { useApp } from '../context/AppContext'
import { CURRENT_USER } from '../data/mockData'

const ROLES = [
  { key: 'employee',  label: 'Сотрудник' },
  { key: 'manager',   label: 'Руководитель' },
  { key: 'hr_admin',  label: 'HR-админ' },
]

export default function TopBar() {
  const { role, setRole } = useApp()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
            {CURRENT_USER.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 leading-tight">{CURRENT_USER.name}</p>
            <p className="text-xs text-gray-400">{CURRENT_USER.team}</p>
          </div>
        </div>

        {/* Role switcher — prototype helper */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">Роль:</span>
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                role === r.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
