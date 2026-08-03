"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IconUsers, IconPlus, IconLogout, IconLayers } from "@/components/icons/UiIcons";
import SettingsMenu from "@/components/SettingsMenu";
import { useLang } from "@/lib/i18n";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const MembersModal = dynamic(() => import("@/components/MembersModal"), { ssr: false });
const NewSpaceModal = dynamic(() => import("@/components/NewSpaceModal"), { ssr: false });

type Space = { id: string; name: string; ownerId: string; members: { user: { id: string; name: string } }[] };

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLang();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<string>("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function loadSpaces() {
    try {
      const res = await fetch("/api/spaces");
      if (!res.ok) {
        console.error("No se pudieron cargar los espacios:", res.status);
        return;
      }
      const text = await res.text();
      if (!text) return;
      const data: Space[] = JSON.parse(text);
      setSpaces(data);
      setActiveSpace((prev) => {
        const stillExists = data.some((s) => s.id === prev);
        if (stillExists) return prev;
        return data[0]?.id || "";
      });
    } catch (err) {
      console.error("Error cargando espacios:", err);
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadSpaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status !== "authenticated") return null;

  const current = spaces.find((s) => s.id === activeSpace);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 12, gap: 12 }}>
      <header className="panel" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <IconLayers size={15} />
          </span>
          <select
            className="tech-input mono hide-mobile"
            style={{ width: "auto", minWidth: 140 }}
            value={activeSpace}
            onChange={(e) => setActiveSpace(e.target.value)}
          >
            {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="icon-btn hide-mobile" onClick={() => setNewSpaceOpen(true)} aria-label={t.newSpace}>
            <IconPlus size={15} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono hide-mobile" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {t.hello}, {session?.user?.name}
          </span>
          <button className="icon-btn show-mobile-only" onClick={() => setNewSpaceOpen(true)} aria-label={t.newSpace}>
            <IconPlus size={16} />
          </button>
          <button className="icon-btn" onClick={() => setMembersOpen(true)} aria-label={t.members}>
            <IconUsers size={16} />
          </button>
          <SettingsMenu
            activeSpaceId={activeSpace}
            currentSpace={current ? { id: current.id, name: current.name, ownerId: current.ownerId } : undefined}
            onSpaceRenamed={loadSpaces}
            onSpaceDeleted={loadSpaces}
          />
          <button className="icon-btn" onClick={() => signOut({ callbackUrl: "/login" })} aria-label={t.logout}>
            <IconLogout size={16} />
          </button>
        </div>

        {/* Selector de espacio en móvil, debajo del header */}
        <select
          className="tech-input mono show-mobile-only"
          style={{ width: "100%" }}
          value={activeSpace}
          onChange={(e) => setActiveSpace(e.target.value)}
        >
          {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </header>

      <div style={{ flex: 1, minHeight: 0 }}>
        {activeSpace && <MapView spaceId={activeSpace} />}
      </div>

      {newSpaceOpen && (
        <NewSpaceModal
          onClose={() => setNewSpaceOpen(false)}
          onCreated={async (spaceId) => {
            setNewSpaceOpen(false);
            await loadSpaces();
            setActiveSpace(spaceId);
          }}
        />
      )}

      {membersOpen && current && (
        <MembersModal
          spaceId={current.id}
          currentMemberIds={current.members.map((m) => m.user.id)}
          onClose={() => setMembersOpen(false)}
          onUpdated={loadSpaces}
        />
      )}
    </div>
  );
}
