import { CloseCircleIcon, DoneIcon, InfoIcon, WarningIcon } from "./icons";

export function Banner({ type, title, subtitle, subtitleLink }) {
  const isError = type === "error";
  const isWarning = type === "warning";
  const isDanger = type === "danger";
  const isDone = type === "done";
  return (
    <div style={{ width: "100%", padding: 12, background: "#F2F3F7", borderRadius: 16, display: "inline-flex", justifyContent: "flex-start", alignItems: "flex-start", gap: 8, boxSizing: "border-box" }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        {isError || isDanger
          ? <CloseCircleIcon color={isDanger ? "#F95721" : "#E30611"} />
          : isWarning
            ? <WarningIcon />
            : isDone
              ? <DoneIcon />
              : <InfoIcon color="#007CFF" />
        }
      </div>
      <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ color: "#1D2023", fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "20px", wordWrap: "break-word" }}>{title}</div>
        {(subtitle || subtitleLink) && (
          <div style={{ color: "#626C77", fontSize: 12, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "16px", wordWrap: "break-word" }}>
            {subtitle}
            {subtitleLink && (
              <a href={subtitleLink.href || '#'} style={{ color: "#0070E5", textDecoration: "none" }}>{subtitleLink.label}</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
