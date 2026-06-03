import { CloseCircleIcon } from "./icons";

export function Banner({ type, title, subtitle }) {
  const isError = type === "error";
  return (
    <div style={{ width: "100%", padding: 12, background: "#F2F3F7", borderRadius: 16, display: "inline-flex", justifyContent: "flex-start", alignItems: "flex-start", gap: 8, boxSizing: "border-box" }}>
      <div style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        <CloseCircleIcon color={isError ? "#E30611" : "#007CFF"} />
      </div>
      <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ color: "#1D2023", fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "20px", wordWrap: "break-word" }}>{title}</div>
        {subtitle && (
          <div style={{ color: "#626C77", fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "16px", wordWrap: "break-word" }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
