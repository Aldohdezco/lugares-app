"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useTheme } from "@/lib/theme-context";
import { useLang } from "@/lib/i18n";
import { SECRET_THEME_SPACE_ID } from "@/lib/constants";
import { IconSettings, IconSun, IconMoon, IconGlobe, IconCheck, IconEdit, IconTrash } from "./icons/UiIcons";

type CurrentSpace = { id: string; name: string; ownerId: string };

export default function SettingsMenu({
  activeSpaceId,
  currentSpace,
  onSpaceRenamed,
  onSpaceDeleted,
}: {
  activeSpaceId?: string;
  currentSpace?: CurrentSpace;
  onSpaceRenamed?: () => void;
  onSpaceDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme, toggle, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id;
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasSecretTheme = activeSpaceId === SECRET_THEME_SPACE_ID;
  const isOwner = currentSpace && myId && currentSpace.ownerId === myId;

  const [editingSpace, setEditingSpace] = useState(false);
  const [spaceName, setSpaceName] = useState(currentSpace?.name || "");
  const [savingSpace, setSavingSpace] = useState(false);

  useEffect(() => { setSpaceName(currentSpace?.name || ""); }, [currentSpace?.id, currentSpace?.name]);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
        setEditingSpace(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleRenameSpace() {
    if (!currentSpace || !spaceName.trim()) return;
    setSavingSpace(true);
    await fetch(`/api/spaces/${currentSpace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: spaceName.trim() }),
    });
    setSavingSpace(false);
    setEditingSpace(false);
    onSpaceRenamed?.();
  }

  async function handleDeleteSpace() {
    if (!currentSpace) return;
    if (!confirm(t.confirmDeleteSpace)) return;
    await fetch(`/api/spaces/${currentSpace.id}`, { method: "DELETE" });
    setOpen(false);
    onSpaceDeleted?.();
  }

  return (
    <>
      <button ref={btnRef} className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label={t.settings}>
        <IconSettings size={17} />
      </button>

      {open && mounted && createPortal(
        <div
          ref={panelRef}
          className="panel"
          style={{
            position: "fixed", top: coords.top, right: coords.right,
            width: 260, padding: 14, zIndex: 9999,
          }}
        >
          <div className="label-eyebrow" style={{ marginBottom: 10 }}>{t.settings}</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{t.theme}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => theme !== "dark" && toggle()} className="mono" style={segStyle(theme === "dark")}>
                <IconMoon size={13} /> {t.dark}
              </button>
              <button onClick={() => theme !== "light" && toggle()} className="mono" style={segStyle(theme === "light")}>
                <IconSun size={13} /> {t.light}
              </button>
            </div>

            {hasSecretTheme && (
              <button
                onClick={() => setTheme(theme === "secret" ? "dark" : "secret")}
                className="mono"
                style={{
                  ...segStyle(theme === "secret"),
                  width: "100%", marginTop: 6,
                  background: theme === "secret" ? "linear-gradient(90deg, #3b1f5c, #6d2fa8)" : "transparent",
                  borderColor: theme === "secret" ? "#c084fc" : "var(--border-line)",
                  color: theme === "secret" ? "#f1e9ff" : "var(--text-secondary)",
                }}
              >
                ✦ {t.secretTheme} ✦
              </button>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <IconGlobe size={13} /> {t.language}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setLang("es")} className="mono" style={segStyle(lang === "es")}>
                ES {lang === "es" && <IconCheck size={12} />}
              </button>
              <button onClick={() => setLang("en")} className="mono" style={segStyle(lang === "en")}>
                EN {lang === "en" && <IconCheck size={12} />}
              </button>
            </div>
          </div>

          {currentSpace && (
            <div style={{ borderTop: "1px solid var(--border-line)", paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{t.spaceSettings}</div>

              {!isOwner ? (
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{t.onlyOwnerCanManage}</div>
              ) : editingSpace ? (
                <div>
                  <input
                    className="tech-input"
                    style={{ marginBottom: 8, fontSize: 12 }}
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameSpace()}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "6px 8px", fontSize: 11 }} onClick={() => setEditingSpace(false)}>
                      {t.cancel}
                    </button>
                    <button
                      className="btn-accent"
                      style={{ flex: 1, justifyContent: "center", padding: "6px 8px", fontSize: 11 }}
                      disabled={savingSpace || !spaceName.trim()}
                      onClick={handleRenameSpace}
                    >
                      {savingSpace ? t.saving : t.save}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="mono" style={{ ...segStyle(false), flex: 1 }} onClick={() => setEditingSpace(true)}>
                    <IconEdit size={12} /> {t.renameSpace}
                  </button>
                  <button
                    className="mono"
                    style={{ ...segStyle(false), color: "var(--danger)", borderColor: "var(--danger)" }}
                    onClick={handleDeleteSpace}
                    aria-label={t.deleteSpace}
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

function segStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "7px 8px",
    fontSize: 11,
    letterSpacing: "0.03em",
    borderRadius: 6,
    border: `1px solid ${active ? "var(--accent)" : "var(--border-line)"}`,
    background: active ? "var(--accent-dim)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
  };
}
