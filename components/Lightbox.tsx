"use client";

import { useEffect, useState } from "react";
import { IconClose, IconChevronDown } from "./icons/UiIcons";

export default function Lightbox({ urls, startIndex, onClose }: { urls: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % urls.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + urls.length) % urls.length);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [urls.length, onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(5,7,10,.92)", zIndex: 5000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <button className="icon-btn" onClick={onClose} style={{ position: "absolute", top: 20, right: 20 }}>
        <IconClose size={16} />
      </button>

      {urls.length > 1 && (
        <>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + urls.length) % urls.length); }}
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%) rotate(90deg)" }}
          >
            <IconChevronDown size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % urls.length); }}
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%) rotate(-90deg)" }}
          >
            <IconChevronDown size={16} />
          </button>
        </>
      )}

      <img
        src={urls[index]}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, border: "1px solid var(--border-line)" }}
      />

      {urls.length > 1 && (
        <div className="mono" style={{ position: "absolute", bottom: 20, color: "var(--text-secondary)", fontSize: 12 }}>
          {index + 1} / {urls.length}
        </div>
      )}
    </div>
  );
}
