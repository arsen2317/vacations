export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "14px 2px",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderBottom: active === t.key ? "2px solid #0066FF" : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 500, lineHeight: "24px", color: active === t.key ? "#1D2023" : "#626C77" }}>
            {t.label}
          </span>
          {t.count != null && (
            <span style={{ height: 20, padding: "0 6px", background: "#F2F3F7", borderRadius: 100, fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#1D2023", display: "inline-flex", alignItems: "center", fontFamily: "'MTSCompact', sans-serif" }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
