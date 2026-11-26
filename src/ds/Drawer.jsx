import { useEffect, useId, useRef } from "react";
import { CrossIcon } from "./icons";
import { BTN_STYLE } from "./tokens";
import { t } from "../i18n/translate";

const ACTION_STYLES = {
  primary:   { background: "#0066FF", color: "#FFFFFF" },
  secondary: { background: "#F2F3F7", color: "#1D2023" },
  danger:    { background: "#F2F3F7", color: "#D8400C" },
};

// The transparent backdrop prevents other drawers from opening behind this one.
// A calendar that edits the drawer's dates can sit between the backdrop and the drawer.
export function Drawer({ title, subtitle, onClose, actions = [], children, width = 440, zIndex = 1000, closeOnOutsideClick = true, focusOnOpen = false }) {
  const titleId = useId();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!focusOnOpen) return;
    const opener = document.activeElement;
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, [focusOnOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <style>{`@keyframes mts-drawer-in { from { transform: translateX(100%); } to { transform: none; } }`}</style>
      <div aria-hidden="true" onClick={closeOnOutsideClick ? onClose : undefined} style={{ position: "fixed", inset: 0, zIndex: zIndex - 100 }} />
      <div role="dialog" aria-labelledby={titleId} style={{
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex, width, maxWidth: "100vw",
        background: "#FFFFFF",
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.08), 0px 4px 24px rgba(0, 0, 0, 0.12)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "mts-drawer-in 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div id={titleId} style={{ flex: 1, padding: "4px 0", color: "#1D2023", fontSize: 20, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: "24px" }}>
              {title}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={t("закрыть")}
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
                  type="button"
                  key={a.label}
                  onClick={a.disabled ? undefined : a.onClick}
                  disabled={a.disabled || !a.onClick}
                  style={{
                    flex: 1, height: 52, padding: 14, border: "none", borderRadius: 16,
                    background: a.disabled ? "rgba(188,195,208,0.5)" : st.background,
                    opacity: a.disabled ? 0.6 : 1,
                    cursor: a.disabled || !a.onClick ? "default" : "pointer",
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
    </>
  );
}
