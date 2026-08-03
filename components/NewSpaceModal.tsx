"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { IconClose, IconLayers } from "./icons/UiIcons";

export default function NewSpaceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (spaceId: string) => void;
}) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, memberIds: [] }),
    });
    const data = await res.json();
    setSaving(false);
    onCreated(data.id);
  }

  return (
    <div style={overlayStyle}>
      <div className="panel" style={modalStyle}>
        <button className="icon-btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14 }}>
          <IconClose size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <IconLayers size={16} />
          <span className="label-eyebrow" style={{ fontSize: 12 }}>{t.newSpace}</span>
        </div>

        <label className="filter-label">{t.spaceName}</label>
        <input
          className="tech-input"
          style={{ marginBottom: 16 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />

        <button className="btn-accent" disabled={saving || !name.trim()} onClick={handleCreate} style={{ width: "100%", justifyContent: "center" }}>
          {saving ? t.saving : t.create}
        </button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 16,
};
const modalStyle: React.CSSProperties = {
  width: 340, maxWidth: "100%", padding: 22, position: "relative",
};
