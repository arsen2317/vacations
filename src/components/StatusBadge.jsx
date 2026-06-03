const STATUS_CONFIG = {
  draft:     { bg: '#F2F3F7', color: '#626C77', label: 'Черновик' },
  pending:   { bg: '#E1F3FE', color: '#0066FF', label: 'На согласовании' },
  reviewing: { bg: '#FFF3E0', color: '#E65100', label: 'Ознакомление' },
  approved:  { bg: '#D5F5E3', color: '#1D7A45', label: 'Согласован' },
  rejected:  { bg: '#FDE8E8', color: '#CC2E05', label: 'Отклонена' },
  cancelled: { bg: '#F2F3F7', color: '#626C77', label: 'Отменена' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: '#F2F3F7', color: '#626C77', label: status }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      whiteSpace: 'nowrap',
      fontFamily: "'MTSCompact', sans-serif",
    }}>
      {cfg.label}
    </span>
  )
}
