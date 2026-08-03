"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { IconLayers } from "@/components/icons/UiIcons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }
    // Navegación completa (no router.push) para que la cookie de sesión
    // ya esté asentada cuando la home la lea; evita el "rebote" a /login.
    window.location.href = "/";
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={handleLogin} className="panel" style={{ width: 360, maxWidth: "100%", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconLayers size={17} />
          </span>
          <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>Nuestros Lugares</div>
        </div>

        {error && (
          <div style={{ background: "rgba(255,93,93,.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 12, padding: "8px 10px", borderRadius: 6, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <label className="filter-label">Correo</label>
        <input
          className="tech-input" style={{ marginBottom: 12 }} type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />

        <label className="filter-label">Contraseña</label>
        <input
          className="tech-input" style={{ marginBottom: 20 }} type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading} className="btn-accent" style={{ width: "100%", justifyContent: "center", padding: "11px 16px" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mono" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 18, textAlign: "center" }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: "var(--accent)" }}>Regístrate</a>
        </p>
      </form>
    </div>
  );
}
