import { useState, useRef, useEffect } from "react";
import { LockIcon, SelectChevron, InfoIcon, CloseCircleIcon, SearchIcon } from "./icons";
import { t } from "../i18n/translate";
import { PersonAvatar } from "./Chip";

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function shortName(name) {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  return parts[0] + " " + parts[1][0] + ".";
}

// size "L": 64px field with the label inside (drawer forms); person: 72px field with avatar, label above,
// list with a search box and people rows; readOnly: grey card without chevron, «Не указан» when empty
export function SelectField({ label, value, options, onChange, disabled, showInfo, multi, lockedHint, searchable, placeholder, size, person, description, error, readOnly }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);
  const openValueRef = useRef(null);

  useOutsideClick(ref, () => {
    if (open && multi && openValueRef.current !== null) {
      onChange(openValueRef.current);
      openValueRef.current = null;
    }
    setOpen(false);
    setQuery("");
  });

  useEffect(() => {
    if (open && searchable && inputRef.current) inputRef.current.focus();
  }, [open, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && multi) openValueRef.current = value ?? [];
    setOpen(v => !v);
  };

  const selectedOptions = multi
    ? options.filter(o => (value || []).includes(o.id))
    : options.find(o => o.id === value);

  const filteredOptions = searchable && query
    ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  const hasValue = multi ? (value || []).length > 0 : !!value;
  const large = size === "L" || person;
  const outerLabel = label && (!large || person);

  const toggle = (id) => {
    if (multi) {
      const cur = value || [];
      onChange(cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
      setQuery("");
      if (inputRef.current) inputRef.current.focus();
    } else {
      onChange(id);
      setOpen(false);
      setQuery("");
    }
  };

  const renderTags = () => {
    const tags = selectedOptions;
    const maxVisible = 2;
    const visible = tags.slice(0, maxVisible);
    const extra = tags.length - maxVisible;
    return (
      <>
        {visible.map(o => (
          <span key={o.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 17, lineHeight: "24px", color: "#1A1A1A", whiteSpace: "nowrap", flexShrink: 1, minWidth: 0, maxWidth: 160, overflow: "hidden" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortName(o.name)}</span>
            <span onClick={(e) => { e.stopPropagation(); toggle(o.id); }} style={{ cursor: "pointer", color: "#8C9BAB", lineHeight: 1, fontSize: 15, marginTop: -1, flexShrink: 0 }}>×</span>
          </span>
        ))}
        {extra > 0 && (
          <span style={{ fontSize: 17, lineHeight: "24px", color: "#1D2023", whiteSpace: "nowrap", flexShrink: 0 }}>+{extra}</span>
        )}
      </>
    );
  };

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: readOnly && !hasValue ? 0 : person ? 8 : 4, position: "relative" }}>
      {/* External label */}
      {outerLabel && (
        <div style={{ color: disabled ? "#BCC3D0" : "#626C77", fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: "20px", display: "flex", alignItems: "center", gap: 4 }}>
          {disabled && lockedHint ? lockedHint : label}
          {disabled && <LockIcon />}
          {showInfo && !disabled && <InfoIcon />}
        </div>
      )}

      {/* Trigger */}
      {readOnly && !hasValue ? (
        <div style={{ fontSize: 17, lineHeight: "24px", color: "#1D2023", fontFamily: "'MTSCompact', sans-serif" }}>{t("Не указан")}</div>
      ) : (
      <div
        onClick={readOnly ? undefined : handleToggle}
        style={{
          height: person ? 72 : large ? 64 : 44,
          background: disabled ? "#F8F8FB" : "#F2F3F7",
          outline: readOnly ? "none" : `1px ${error ? "#E30611" : open && !person ? "#0066FF" : "rgba(188,195,208,0.50)"} solid`,
          outlineOffset: "-1px",
          borderRadius: 16,
          cursor: readOnly ? "default" : disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          padding: "0 8px 0 12px",
          boxSizing: "border-box",
        }}
      >
        {person ? (
          <>
            <PersonAvatar src={hasValue ? selectedOptions?.avatar : undefined} />
            <div style={{ flex: 1, minWidth: 0, padding: "0 4px 0 8px", display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "'MTSCompact', sans-serif" }}>
              {hasValue ? (
                <>
                  <span style={{ fontSize: 17, lineHeight: "24px", color: "#1D2023", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOptions?.name}</span>
                  {selectedOptions?.role && <span style={{ fontSize: 14, lineHeight: "20px", color: "#626C77", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOptions.role}</span>}
                </>
              ) : (
                <span style={{ fontSize: 17, lineHeight: "24px", color: "#626C77" }}>{placeholder || t("Выберите из списка")}</span>
              )}
            </div>
          </>
        ) : large ? (
          <div style={{ flex: 1, minWidth: 0, paddingRight: 4, display: "flex", flexDirection: "column", fontFamily: "'MTSCompact', sans-serif" }}>
            {hasValue || open ? (
              <>
                <span style={{ fontSize: 14, lineHeight: "20px", color: "#626C77" }}>{label}</span>
                {open && searchable ? <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key === "Backspace" && query === "" && value) onChange(""); }}
              placeholder={selectedOptions?.name || t("Начните вводить имя…")}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 17, lineHeight: "24px", color: "#1D2023", flex: 1, minWidth: 0, padding: 0, fontFamily: "inherit" }}
            /> : (
                  <span style={{ fontSize: 17, lineHeight: "24px", color: hasValue ? "#1D2023" : "#626C77", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hasValue ? selectedOptions?.name : (placeholder || "")}
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 17, lineHeight: "24px", color: "#626C77" }}>{label}</span>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, fontSize: 17, lineHeight: "24px", color: disabled ? "#BCC3D0" : hasValue ? "#1D2023" : "#8C9BAB", overflow: "hidden", display: "flex", alignItems: "center", minWidth: 0, gap: 6 }}>
            {multi ? (
              <>
                {hasValue && renderTags()}
                {open && searchable && (
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder={hasValue ? "" : t("Начните вводить имя…")}
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: 17, lineHeight: "24px", color: "#1D2023", flex: 1, minWidth: 60, padding: 0, fontFamily: "inherit" }}
                  />
                )}
              </>
            ) : open && searchable ? (
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => { if (e.key === "Backspace" && query === "" && value) onChange(""); }}
                placeholder={selectedOptions?.name || t("Начните вводить имя…")}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 17, lineHeight: "24px", color: "#1D2023", flex: 1, minWidth: 0, padding: 0, fontFamily: "inherit" }}
              />
            ) : (
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: hasValue ? "#1D2023" : "#8C9BAB" }}>
                {hasValue ? selectedOptions?.name : (placeholder || "")}
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", flexShrink: 0 }}>
          {multi && hasValue && !disabled && (
            <CloseCircleIcon onClick={(e) => { e.stopPropagation(); onChange([]); }} />
          )}
          {!readOnly && <SelectChevron up={open} />}
        </div>
      </div>
      )}

      {/* Person dropdown: search box + people rows */}
      {open && !disabled && person && (
        <div style={{
          position: "absolute", top: label ? 108 : 80, left: 0, right: 0, zIndex: 200,
          background: "#fff", borderRadius: 20, overflow: "hidden",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.08), 0px 4px 24px rgba(0, 0, 0, 0.12)",
          display: "flex", flexDirection: "column",
        }}>
          {searchable && (
            <div style={{ padding: 12 }}>
              <div style={{
                height: 44, boxSizing: "border-box", padding: "0 8px 0 12px",
                background: "#F2F3F7", borderRadius: 16, border: "1px solid rgba(188,195,208,0.50)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SearchIcon />
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t("Поиск")}
                  className="mts-search-input"
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: 17, lineHeight: "24px", color: "#1D2023", flex: 1, minWidth: 0, padding: 0, fontFamily: "'MTSCompact', sans-serif" }}
                />
              </div>
            </div>
          )}
          <div className="modal-scroll" style={{ maxHeight: 360, overflowY: "auto", paddingBottom: 8 }}>
            {filteredOptions.filter(o => o.id !== value).length === 0 && (
              <div style={{ padding: "14px 16px", fontSize: 17, color: "#626C77", fontFamily: "'MTSCompact', sans-serif" }}>{query ? t("Ничего не найдено") : t("Нет вариантов")}</div>
            )}
            {filteredOptions.filter(o => o.id !== value).map(opt => (
              <div
                key={opt.id}
                onClick={() => toggle(opt.id)}
                style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "'MTSCompact', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F5F6F8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                <PersonAvatar src={opt.avatar} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 17, lineHeight: "24px", color: "#1D2023", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.name}</span>
                  {opt.role && <span style={{ fontSize: 14, lineHeight: "20px", color: "#626C77", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.role}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown: with label = 72, without label = 52 */}
      {open && !disabled && !person && (
        <div style={{ position: "absolute", top: person ? (label ? 104 : 76) : large ? 68 : label ? 72 : 52, left: 0, right: 0, zIndex: 200, background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", border: "1px solid #E8EDF2", overflow: "hidden" }}>
          {filteredOptions.length === 0 && (
            <div style={{ padding: "14px 16px", fontSize: 17, color: "#8C9BAB" }}>{query ? t("Ничего не найдено") : t("Нет вариантов")}</div>
          )}
          {filteredOptions.map(opt => {
            const sel = multi ? (value || []).includes(opt.id) : value === opt.id;
            return (
              <div key={opt.id} onClick={() => toggle(opt.id)}
                style={{ padding: "14px 16px", fontSize: 17, lineHeight: "24px", cursor: "pointer", color: "#1D2023", background: sel ? "#F5F6F8" : "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#fafafa"; }}
                onMouseLeave={e => { e.currentTarget.style.background = sel ? "#F5F6F8" : "#fff"; }}
              >
                {opt.name}
                {sel && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M3 9l5 5 7-8" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            );
          })}
          {multi && (
            <div style={{ padding: "12px 16px", display: "flex", gap: 12, background: "#fff", borderTop: "1px solid #F2F3F7" }}>
              <button onClick={() => { onChange([]); openValueRef.current = null; setOpen(false); setQuery(""); }} style={{ flex: 1, height: 44, background: "#F2F3F7", color: "#1A1A1A", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, lineHeight: "16px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'MTSWide', sans-serif" }}>{t("СБРОСИТЬ")}</button>
              <button onClick={() => { openValueRef.current = null; setOpen(false); setQuery(""); }} style={{ flex: 2, height: 44, background: "#0066FF", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, lineHeight: "16px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'MTSWide', sans-serif" }}>{t("ПРИМЕНИТЬ")}</button>
            </div>
          )}
        </div>
      )}

      {error
        ? <div style={{ color: "#E30611", fontSize: 12, fontFamily: "'MTSCompact', sans-serif", lineHeight: "16px" }}>{error}</div>
        : description && <div style={{ color: "#626C77", fontSize: 12, fontFamily: "'MTSCompact', sans-serif", lineHeight: "16px" }}>{description}</div>}
    </div>
  );
}
