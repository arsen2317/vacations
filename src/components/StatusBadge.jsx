import { Tag } from 'antd'

const STATUS_TAG = {
  draft:     { label: 'Черновик',        color: 'default' },
  pending:   { label: 'На согласовании', color: 'gold' },
  reviewing: { label: 'На ознакомлении', color: 'orange' },
  approved:  { label: 'Согласована',     color: 'success' },
  rejected:  { label: 'Отклонена',       color: 'error' },
  cancelled: { label: 'Отменена',        color: 'default' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_TAG[status] ?? { label: status, color: 'default' }
  return <Tag color={cfg.color} style={{ marginInlineEnd: 0 }}>{cfg.label}</Tag>
}
