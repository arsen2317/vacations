const STATUS_CONFIG = {
  draft:     { bg: '#F2F3F7', color: '#626C77',  label: 'Черновик' },
  pending:   { bg: '#C7E1FF', color: '#005CBD',  label: 'На согласовании' },
  reviewing: { bg: '#E3CCFF', color: '#7936C9',  label: 'Ознакомление' },
  approved:  { bg: '#BEF4BD', color: '#007502',  label: 'Согласован' },
  rejected:  { bg: '#FCD4C9', color: '#AD3400',  label: 'Отклонена' },
  cancelled: { bg: '#F2F3F7', color: '#626C77',  label: 'Отменена' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: '#F2F3F7', color: '#626C77', label: status }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 6px',
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
