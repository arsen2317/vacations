const STATUS_STYLES = {
  planned:   { bg: "#E1F3FE", color: "#1D2023", label: "Запланировано" },
  active:    { bg: "#26CD58", color: "#fff",     label: "Активно" },
  done:      { bg: "#F2F3F7", color: "#1D2023",  label: "Завершено" },
  rejected:  { bg: "#F95721", color: "#fff",     label: "Отклонено" },
  assigned:  { bg: "#E1F3FE", color: "#1D2023",  label: "Назначена" },
  conducted: { bg: "#26CD58", color: "#fff",     label: "Проведена" },
  cancelled: { bg: "#F95721", color: "#fff",     label: "Отменена" },
};

export function StatusBadge({ type }) {
  const s = STATUS_STYLES[type] || STATUS_STYLES.done;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", background: s.bg, color: s.color, borderRadius: 8, fontSize: 14, fontWeight: 500, lineHeight: "20px", whiteSpace: "nowrap", fontFamily: "'MTSCompact', sans-serif" }}>
      {s.label}
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
    <div style={{ width: 52, height: 52, borderRadius: 16, background: "#E8EDF2", flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
      {src
        ? <img src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="17" r="8" fill="#BCC3D0"/>
            <path d="M5 40c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#BCC3D0"/>
          </svg>
      }
    </div>
  );
}
