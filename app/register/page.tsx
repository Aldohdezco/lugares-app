"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLayers } from "@/components/icons/UiIcons";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al registrar");
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={handleRegister} className="panel" style={{ width: 360, maxWidth: "100%", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconLayers size={17} />
          </span>
          <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>Crear cuenta</div>
        </div>

        {error && (
          <div style={{ background: "rgba(255,93,93,.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 12, padding: "8px 10px", borderRadius: 6, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <label className="filter-label">Nombre</label>
        <input className="tech-input" style={{ marginBottom: 12 }} required value={name} onChange={(e) => setName(e.target.value)} />

        <label className="filter-label">Correo</label>
        <input className="tech-input" style={{ marginBottom: 12 }} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="filter-label">Contraseña</label>
        <input className="tech-input" style={{ marginBottom: 20 }} type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" disabled={loading} className="btn-accent" style={{ width: "100%", justifyContent: "center", padding: "11px 16px" }}>
          {loading ? "Creando..." : "Registrarme"}
        </button>

        <p className="mono" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 18, textAlign: "center" }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: "var(--accent)" }}>Inicia sesión</a>
        </p>
      </form>
    </div>
  );
}
