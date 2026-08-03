"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLang } from "@/lib/i18n";
import { IconClose, IconUsers, IconPlus, IconCheck } from "./icons/UiIcons";

type Friend = { id: string; name: string; email: string };
type PendingRequest = { friendshipId: string; from: Friend };

export default function MembersModal({
  spaceId,
  currentMemberIds,
  onClose,
  onUpdated,
}: {
  spaceId: string;
  currentMemberIds: string[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useLang();
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadFriends() {
    const res = await fetch("/api/friends");
    const data = await res.json();

    // Amistades ya aceptadas -> aplanamos a "el otro usuario"
    const accepted: Friend[] = data
      .filter((f: any) => f.status === "ACEPTADA")
      .map((f: any) => (f.requesterId === myId ? f.addressee : f.requester));
    setFriends(accepted);

    // Solicitudes que ME mandaron a mí y siguen pendientes
    const incoming: PendingRequest[] = data
      .filter((f: any) => f.status === "PENDIENTE" && f.addresseeId === myId)
      .map((f: any) => ({ friendshipId: f.id, from: f.requester }));
    setPending(incoming);
  }

  useEffect(() => { if (myId) loadFriends(); }, [myId]);

  async function sendFriendRequest() {
    setSending(true);
    setError("");
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: friendEmail }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al enviar la solicitud");
    } else {
      setFriendEmail("");
      loadFriends();
    }
    setSending(false);
  }

  async function respondRequest(friendshipId: string, status: "ACEPTADA" | "RECHAZADA") {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, status }),
    });
    loadFriends();
  }

  async function addToSpace(userId: string) {
    await fetch("/api/spaces/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId, userId }),
    });
    onUpdated();
  }

  return (
    <div style={overlayStyle}>
      <div className="panel" style={modalStyle}>
        <button className="icon-btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14 }}>
          <IconClose size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <IconUsers size={17} />
          <span className="label-eyebrow" style={{ fontSize: 12 }}>{t.spaceMembers}</span>
        </div>

        {pending.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{t.pendingRequests}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pending.map((p) => (
                <div key={p.friendshipId} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", border: "1px solid var(--accent)", borderRadius: 8, background: "var(--accent-dim)",
                }}>
                  <div>
                    <div style={{ fontSize: 13 }}>{p.from.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }} className="mono">{p.from.email}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="icon-btn"
                      style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
                      onClick={() => respondRequest(p.friendshipId, "ACEPTADA")}
                      aria-label={t.accept}
                    >
                      <IconCheck size={14} />
                    </button>
                    <button
                      className="icon-btn"
                      style={{ color: "var(--danger)" }}
                      onClick={() => respondRequest(p.friendshipId, "RECHAZADA")}
                      aria-label={t.reject}
                    >
                      <IconClose size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{t.addFriend}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="tech-input"
              placeholder={t.friendEmail}
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
            />
            <button className="btn-accent" disabled={sending || !friendEmail} onClick={sendFriendRequest}>
              <IconPlus size={13} />
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}>{error}</div>}
        </div>

        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{t.addToSpace}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
          {friends.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.noFriendsYet}</div>
          )}
          {friends.map((f) => {
            const already = currentMemberIds.includes(f.id);
            return (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", border: "1px solid var(--border-line)", borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontSize: 13 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }} className="mono">{f.email}</div>
                </div>
                {already ? (
                  <span style={{ color: "var(--accent)" }}><IconCheck size={16} /></span>
                ) : (
                  <button className="icon-btn" onClick={() => addToSpace(f.id)}>
                    <IconPlus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 16,
};
const modalStyle: React.CSSProperties = {
  width: 380, maxWidth: "100%", padding: 22, position: "relative", maxHeight: "85vh", overflowY: "auto",
};
