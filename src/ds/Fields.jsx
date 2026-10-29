import { useState, useRef } from "react";
import { CalendarIcon, MinusIcon, PlusIcon } from "./icons";
import { CalendarRange } from "./CalendarRange";

const FONT = "'MTSCompact', sans-serif";
const STROKE = "rgba(188, 195, 208, 0.50)";
const FIELD_LABEL = { color: "#626C77", fontSize: 14, fontFamily: FONT, fontWeight: 400, lineHeight: "20px" };
const FIELD_DESCRIPTION = { color: "#626C77", fontSize: 12, fontFamily: FONT, fontWeight: 400, lineHeight: "16px" };
const FIELD_ERROR = { ...FIELD_DESCRIPTION, color: "#E30611" };

function fmt(d) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

// 64px field box with the label inside: placeholder-sized when empty, small on top when filled
export function FieldBox({ label, value, placeholder, active, error, onClick, right, children }) {
  const filled = value !== undefined && value !== null && value !== "";
  return (
    <div
      onClick={onClick}
      style={{
        height: 64, padding: "0 8px 0 12px", boxSizing: "border-box",
        background: "#F2F3F7", borderRadius: 16,
        outline: `1px ${error ? "#E30611" : active ? "#0066FF" : STROKE} solid`, outlineOffset: "-1px",
        display: "flex", alignItems: "center", gap: 4,
        cursor: onClick ? "pointer" : "default", overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: 4, display: "flex", flexDirection: "column" }}>
        {children ?? (filled || active ? (
          <>
            <div style={{ ...FIELD_LABEL, color: error ? "#E30611" : FIELD_LABEL.color }}>{label}</div>
            <div style={{ color: filled ? "#1D2023" : "#626C77", fontSize: 17, fontFamily: FONT, lineHeight: "24px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {filled ? value : placeholder}
            </div>
          </>
        ) : (
          <div style={{ color: "#626C77", fontSize: 17, fontFamily: FONT, lineHeight: "24px" }}>{label}</div>
        ))}
      </div>
      {right}
    </div>
  );
}

// Period field with a range calendar popover
export function DateRangeField({ label, start, end, onChange, description, error, initialViewMonth }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const ref = useRef(null);
  const value = start ? `${fmt(start)}${end && end.getTime() !== start.getTime() ? ` – ${fmt(end)}` : ""}` : "";

  function toggle() {
    setRect(ref.current?.getBoundingClientRect() ?? null);
    setOpen(v => !v);
  }

  // The range calendar is wider than a drawer field: align it to the field's right edge
  const CAL_W = 760;
  const left = rect ? Math.max(16, rect.right - CAL_W) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div ref={ref}>
        <FieldBox
          label={label}
          value={value}
          active={open}
          error={!!error}
          onClick={toggle}
          right={
            <span style={{ width: 32, height: 32, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarIcon />
            </span>
          }
        />
      </div>
      {error ? <div style={FIELD_ERROR}>{error}</div> : description && <div style={FIELD_DESCRIPTION}>{description}</div>}

      {open && rect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100 }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: rect.bottom + 4, left }}>
            <CalendarRange
              initialStart={start}
              initialEnd={end}
              initialViewMonth={initialViewMonth}
              onApply={(s, e) => { onChange(s, e); }}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Multiline text field: label above, 104px box
export function TextAreaField({ label, value, onChange, placeholder, maxLength, description, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={FIELD_LABEL}>{label}</div>}
      <textarea
        className="mts-textarea"
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 104, boxSizing: "border-box",
          background: "#F2F3F7", border: "none", borderRadius: 16,
          outline: `1px ${error ? "#E30611" : focused ? "#0066FF" : STROKE} solid`, outlineOffset: "-1px",
          padding: "10px 12px", resize: "none", display: "block",
          fontSize: 17, lineHeight: "24px", color: "#1D2023", fontFamily: FONT,
        }}
      />
      {error ? <div style={FIELD_ERROR}>{error}</div> : description && <div style={FIELD_DESCRIPTION}>{description}</div>}
    </div>
  );
}

// Row with a title/caption and a −/+ counter (e.g. extra vacation days to use)
export function CounterField({ title, caption, value, min = 0, max, onChange }) {
  const canDec = value > min;
  const canInc = max === undefined || value < max;
  const btn = (enabled) => ({
    width: 36, height: 36, padding: 2, border: "none", borderRadius: 12,
    background: enabled ? "transparent" : "rgba(188, 195, 208, 0.50)",
    cursor: enabled ? "pointer" : "default",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: enabled ? 1 : 0.8,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#1D2023", fontSize: 17, fontFamily: FONT, lineHeight: "24px" }}>{title}</div>
        {caption && <div style={{ color: "#626C77", fontSize: 14, fontFamily: FONT, lineHeight: "20px" }}>{caption}</div>}
      </div>
      <div style={{
        height: 44, padding: 4, boxSizing: "border-box", borderRadius: 16,
        background: "#F2F3F7", outline: `1px ${STROKE} solid`, outlineOffset: "-1px",
        display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
      }}>
        <button style={btn(canDec)} disabled={!canDec} onClick={() => canDec && onChange(value - 1)}><MinusIcon /></button>
        <span style={{ minWidth: 32, textAlign: "center", color: "#1D2023", fontSize: 17, fontFamily: FONT, lineHeight: "24px" }}>{value}</span>
        <button style={{ ...btn(true), opacity: canInc ? 1 : 0.3, cursor: canInc ? "pointer" : "default" }} disabled={!canInc} onClick={() => canInc && onChange(value + 1)}><PlusIcon /></button>
      </div>
    </div>
  );
}
