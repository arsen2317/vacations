import { useEffect } from "react";
import { CrossIcon } from "./icons";
import { BTN_STYLE } from "./tokens";

const ACTION_STYLES = {
  primary:   { background: "#0066FF", color: "#FFFFFF" },
  secondary: { background: "#F2F3F7", color: "#1D2023" },
  danger:    { background: "#F2F3F7", color: "#D8400C" },
};

// Right-side drawer (replaces centered modals): overlay, header with title/subtitle/close,
// scrollable body and a footer with 52px action buttons.
export function Drawer({ title, subtitle, onClose, actions = [], children, width = 600, zIndex = 1000 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex, display: "flex", justifyContent: "flex-end" }}>
      <style>{`@keyframes mts-drawer-in { from { transform: translateX(100%); } to { transform: none; } } @keyframes mts-overlay-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(29, 32, 35, 0.40)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "mts-overlay-in 0.2s ease" }}
      />
      <div style={{
        position: "relative", width, maxWidth: "100vw", height: "100%",
        background: "#FFFFFF",
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.08), 0px 4px 24px rgba(0, 0, 0, 0.12)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "mts-drawer-in 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, padding: "4px 0", color: "#1D2023", fontSize: 20, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: "24px" }}>
              {title}
            </div>
            <button
              onClick={onClose}
              style={{ padding: 4, background: "#F2F3F7", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <CrossIcon />
            </button>
          </div>
          {subtitle && (
            <div style={{ paddingRight: 40, color: "#626C77", fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "20px" }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="modal-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </div>

        {/* Footer */}
        {actions.length > 0 && (
          <div style={{ padding: "8px 20px 20px", display: "flex", gap: 12, flexShrink: 0 }}>
            {actions.map(a => {
              const st = ACTION_STYLES[a.type] || ACTION_STYLES.secondary;
              return (
                <button
                  key={a.label}
                  onClick={a.disabled ? undefined : a.onClick}
                  disabled={a.disabled}
                  style={{
                    flex: 1, height: 52, padding: 14, border: "none", borderRadius: 16,
                    background: a.disabled ? "rgba(188,195,208,0.5)" : st.background,
                    opacity: a.disabled ? 0.6 : 1,
                    cursor: a.disabled ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ ...BTN_STYLE, letterSpacing: 0.6, padding: "4px 8px", color: a.disabled ? "#969FA8" : st.color }}>
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
