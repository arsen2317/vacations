import { t } from "../i18n/translate";

const STATUS_STYLES = {
  draft:        { bg: '#F2F3F7', color: '#1D2023', label: 'Черновик' },
  pending:      { bg: '#D6E4FF', color: '#0964A5', label: 'На согласовании' },
  rescheduling: { bg: '#D6E4FF', color: '#0964A5', label: 'Согласование переноса' },
  reviewing:    { bg: '#E3CCFF', color: '#7936C9', label: 'Ознакомление' },
  approved:     { bg: '#D0FBD5', color: '#236E31', label: 'Согласован' },
  rejected:     { bg: '#FFD6D6', color: '#A71B35', label: 'Отклонена' },
  cancelled:    { bg: '#F2F3F7', color: '#626C77', label: 'Отменена' },
  planned:      { bg: '#D6E4FF', color: '#0964A5', label: 'Запланировано' },
  active:       { bg: '#D0FBD5', color: '#236E31', label: 'Активно' },
  done:         { bg: '#F2F3F7', color: '#626C77', label: 'Завершено' },
};

export function StatusBadge({ type }) {
  const s = STATUS_STYLES[type] || STATUS_STYLES.done;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", background: s.bg, color: s.color, borderRadius: 8, fontSize: 14, fontWeight: 500, lineHeight: "20px", whiteSpace: "nowrap", fontFamily: "'MTSCompact', sans-serif" }}>
      {t(s.label)}
    </span>
  );
}

export function Tag({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", background: "#F2F3F7", color: "#1D2023", borderRadius: 8, fontSize: 14, fontWeight: 500, lineHeight: "20px", whiteSpace: "nowrap", fontFamily: "'MTSCompact', sans-serif", alignSelf: "flex-start" }}>
      {label}
    </span>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 12,
        border: "none",
        borderRadius: 16,
        cursor: "pointer",
        background: active ? "#1D2023" : "#F2F3F7",
        color: active ? "#FAFAFA" : "#1D2023",
        fontSize: 14,
        lineHeight: "20px",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

export function PersonAvatar({ src }) {
  return (
    <div style={{ width: 52, height: 52, borderRadius: 16, background: src ? "#E8EDF2" : "#BBC1C7", flexShrink: 0, overflow: "hidden" }}>
      {src
        ? <img src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <svg aria-hidden="true" width="52" height="52" viewBox="0 0 52 52" fill="#fff">
            <circle cx="26" cy="18" r="10"/>
            <path d="M5 51v-3c0-8.837 7.163-16 16-16h10c8.837 0 16 7.163 16 16v3H5Z"/>
          </svg>
      }
    </div>
  );
}
