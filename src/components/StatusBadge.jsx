import { STATUS_CONFIG } from '../data/mockData'

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
