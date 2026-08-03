"use client";

import { useRef, useState } from "react";
import { IconPlus, IconClose } from "./icons/UiIcons";

export default function PhotoUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // URLs que este uploader subió en esta sesión (aún no guardadas en ninguna Visit/Place).
  // Si el usuario las quita de acá, es seguro borrar el archivo del disco de una vez.
  // Las URLs que ya venían de una visita existente (props iniciales) NO están acá,
  // porque esas las maneja el diff del backend recién cuando se confirma el guardado.
  const sessionUploadedRef = useRef<Set<string>>(new Set());

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al subir");
        newUrls.push(data.url);
        sessionUploadedRef.current.add(data.url);
      } catch (err: any) {
        setError(err.message || "Error al subir una imagen");
      }
    }

    onChange([...urls, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeAt(i: number) {
    const url = urls[i];
    onChange(urls.filter((_, idx) => idx !== i));

    if (sessionUploadedRef.current.has(url)) {
      sessionUploadedRef.current.delete(url);
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } catch {
        // si falla el borrado del huérfano no es crítico, seguimos
      }
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {urls.map((u, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img src={u} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-line)" }} />
            <button
              onClick={() => removeAt(i)}
              style={{
                position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
                background: "var(--danger)", color: "white", border: "none", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
              }}
            >
              <IconClose size={10} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: 56, height: 56, borderRadius: 6, border: "1px dashed var(--border-line-strong)",
            background: "var(--bg-void)", color: "var(--text-secondary)", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: uploading ? "wait" : "pointer",
          }}
        >
          {uploading ? <span className="mono" style={{ fontSize: 9 }}>...</span> : <IconPlus size={16} />}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <div style={{ fontSize: 11, color: "var(--danger)" }}>{error}</div>}
    </div>
  );
}
