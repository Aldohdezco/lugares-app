"use client";

import { useState } from "react";
import { CATEGORIES, CategoryKey } from "@/lib/categories";
import { CategoryIcon } from "./icons/CategoryIcons";
import { IconClose, IconPlus, IconEdit, IconTrash } from "./icons/UiIcons";
import { useLang } from "@/lib/i18n";
import { photoUrl } from "@/lib/photoUrl";
import { cdmxDateToISO, isoToDateInputCDMX, formatDateCDMX } from "@/lib/dates";
import PhotoUploader from "./PhotoUploader";
import Lightbox from "./Lightbox";

type Photo = { id: string; url: string };
type VisitData = {
  id: string;
  description: string;
  visitDate: string;
  photos: Photo[];
  createdBy: { name: string };
};
type PlaceData = {
  id: string;
  name: string;
  category: CategoryKey;
  visits: VisitData[];
};

type Props =
  | { mode: "view"; place: PlaceData; onClose: () => void; onVisitAdded: () => void; onPlaceDeleted: () => void }
  | {
      mode: "create";
      spaceId: string;
      coords: { lat: number; lng: number };
      onClose: () => void;
      onCreated: () => void;
    };

export default function PlaceModal(props: Props) {
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  return (
    <div style={overlayStyle}>
      <div className="panel" style={modalStyle}>
        <button className="icon-btn" onClick={props.onClose} style={{ position: "absolute", top: 14, right: 14 }}>
          <IconClose size={15} />
        </button>

        {props.mode === "view" ? (
          <ViewPlace
            place={props.place}
            onVisitAdded={props.onVisitAdded}
            onOpenLightbox={setLightbox}
            onPlaceDeleted={() => { props.onPlaceDeleted(); props.onClose(); }}
          />
        ) : (
          <CreatePlace {...props} />
        )}
      </div>

      {lightbox && <Lightbox urls={lightbox.urls} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function ViewPlace({
  place,
  onVisitAdded,
  onOpenLightbox,
  onPlaceDeleted,
}: {
  place: PlaceData;
  onVisitAdded: () => void;
  onOpenLightbox: (l: { urls: string[]; index: number }) => void;
  onPlaceDeleted: () => void;
}) {
  const { t, lang } = useLang();
  const [addingVisit, setAddingVisit] = useState(false);
  const [editingPlace, setEditingPlace] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  async function handleDeletePlace() {
    if (!confirm(t.confirmDeletePlace)) return;
    await fetch(`/api/places/${place.id}`, { method: "DELETE" });
    onPlaceDeleted();
  }

  async function handleDeleteVisit(visitId: string) {
    if (!confirm(t.confirmDeleteVisit)) return;
    await fetch(`/api/visits/${visitId}`, { method: "DELETE" });
    onVisitAdded();
  }

  if (editingPlace) {
    return (
      <EditPlaceForm
        place={place}
        onCancel={() => setEditingPlace(false)}
        onSaved={() => { setEditingPlace(false); onVisitAdded(); }}
      />
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingRight: 56 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 8, background: "var(--accent-dim)",
          color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <CategoryIcon category={place.category} size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{place.name}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {place.visits.length} {place.visits.length === 1 ? t.visit : t.visitsPlural}
          </div>
        </div>
        <button className="icon-btn" onClick={() => setEditingPlace(true)} aria-label={t.edit}>
          <IconEdit size={14} />
        </button>
        <button className="icon-btn" onClick={handleDeletePlace} aria-label={t.delete} style={{ color: "var(--danger)" }}>
          <IconTrash size={14} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "45vh", overflowY: "auto", marginBottom: 14 }}>
        {place.visits.map((v) =>
          editingVisitId === v.id ? (
            <EditVisitForm
              key={v.id}
              visit={v}
              onCancel={() => setEditingVisitId(null)}
              onSaved={() => { setEditingVisitId(null); onVisitAdded(); }}
            />
          ) : (
            <div key={v.id} style={{ borderLeft: "2px solid var(--border-line)", paddingLeft: 12, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--accent)", flex: 1 }}>
                  {formatDateCDMX(v.visitDate, lang)}
                  <span style={{ color: "var(--text-dim)" }}> · {t.addedBy} {v.createdBy.name}</span>
                </div>
                <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setEditingVisitId(v.id)} aria-label={t.edit}>
                  <IconEdit size={11} />
                </button>
                <button className="icon-btn" style={{ width: 26, height: 26, color: "var(--danger)" }} onClick={() => handleDeleteVisit(v.id)} aria-label={t.delete}>
                  <IconTrash size={11} />
                </button>
              </div>
              {v.description && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "6px 0" }}>
                  {v.description}
                </p>
              )}
              {v.photos.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {v.photos.map((ph, i) => (
                    <img
                      key={ph.id}
                      src={photoUrl(ph.url, 136)}
                      alt=""
                      onClick={() => onOpenLightbox({ urls: v.photos.map((p) => p.url), index: i })}
                      style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-line)", cursor: "pointer" }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {addingVisit ? (
        <AddVisitForm placeId={place.id} onDone={() => { setAddingVisit(false); onVisitAdded(); }} onCancel={() => setAddingVisit(false)} />
      ) : (
        <button className="btn-ghost" onClick={() => setAddingVisit(true)} style={{ width: "100%", justifyContent: "center" }}>
          <IconPlus size={13} /> {t.addVisit}
        </button>
      )}
    </>
  );
}

function EditPlaceForm({ place, onCancel, onSaved }: { place: PlaceData; onCancel: () => void; onSaved: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState(place.name);
  const [category, setCategory] = useState<CategoryKey>(place.category);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/places/${place.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <>
      <div className="label-eyebrow" style={{ marginBottom: 16 }}>{t.editPlace}</div>

      <label className="filter-label">{t.name}</label>
      <input className="tech-input" style={{ marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} />

      <label className="filter-label">{t.category}</label>
      <select className="tech-input" style={{ marginBottom: 16 }} value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
        {Object.entries(CATEGORIES).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>{t.cancel}</button>
        <button className="btn-accent" disabled={saving || !name} onClick={handleSave} style={{ flex: 1, justifyContent: "center" }}>
          {saving ? t.saving : t.save}
        </button>
      </div>
    </>
  );
}

function EditVisitForm({ visit, onCancel, onSaved }: { visit: VisitData; onCancel: () => void; onSaved: () => void }) {
  const { t } = useLang();
  const [description, setDescription] = useState(visit.description);
  const [visitDate, setVisitDate] = useState(isoToDateInputCDMX(visit.visitDate));
  const [photoUrls, setPhotoUrls] = useState<string[]>(visit.photos.map((p) => p.url));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/visits/${visit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, visitDate: cdmxDateToISO(visitDate), photoUrls }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
      <label className="filter-label">{t.date}</label>
      <input type="date" className="tech-input" style={{ marginBottom: 10 }} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />

      <label className="filter-label">{t.description}</label>
      <textarea className="tech-input" style={{ marginBottom: 10, height: 64, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="filter-label">{t.photos}</label>
      <div style={{ marginBottom: 10 }}>
        <PhotoUploader urls={photoUrls} onChange={setPhotoUrls} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>{t.cancel}</button>
        <button className="btn-accent" disabled={saving || !visitDate} onClick={handleSave} style={{ flex: 1, justifyContent: "center" }}>
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}

function AddVisitForm({ placeId, onDone, onCancel }: { placeId: string; onDone: () => void; onCancel: () => void }) {
  const { t } = useLang();
  const [description, setDescription] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, description, visitDate: cdmxDateToISO(visitDate), photoUrls }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div style={{ borderTop: "1px solid var(--border-line)", paddingTop: 14 }}>
      <label className="filter-label">{t.date}</label>
      <input type="date" className="tech-input" style={{ marginBottom: 10 }} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />

      <label className="filter-label">{t.description}</label>
      <textarea className="tech-input" style={{ marginBottom: 10, height: 64, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="filter-label">{t.photos}</label>
      <div style={{ marginBottom: 10 }}>
        <PhotoUploader urls={photoUrls} onChange={setPhotoUrls} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>{t.cancel}</button>
        <button className="btn-accent" disabled={saving || !visitDate} onClick={handleSave} style={{ flex: 1, justifyContent: "center" }}>
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}

function CreatePlace(props: Extract<Props, { mode: "create" }>) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("OTRO");
  const [visitDate, setVisitDate] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spaceId: props.spaceId, name, category, description, visitDate: cdmxDateToISO(visitDate),
        latitude: props.coords.lat, longitude: props.coords.lng, photoUrls,
      }),
    });
    setSaving(false);
    props.onCreated();
  }

  return (
    <>
      <div className="label-eyebrow" style={{ marginBottom: 16 }}>{t.newPlace}</div>

      <label className="filter-label">{t.name}</label>
      <input className="tech-input" style={{ marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} />

      <label className="filter-label">{t.category}</label>
      <select className="tech-input" style={{ marginBottom: 12 }} value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
        {Object.entries(CATEGORIES).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <label className="filter-label">{t.date}</label>
      <input type="date" className="tech-input" style={{ marginBottom: 12 }} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />

      <label className="filter-label">{t.description}</label>
      <textarea className="tech-input" style={{ marginBottom: 12, height: 76, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="filter-label">{t.photos}</label>
      <div style={{ marginBottom: 14 }}>
        <PhotoUploader urls={photoUrls} onChange={setPhotoUrls} />
      </div>

      <button className="btn-accent" disabled={saving || !name || !visitDate} onClick={handleCreate} style={{ width: "100%", justifyContent: "center" }}>
        <IconPlus size={13} /> {saving ? t.saving : t.save}
      </button>
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16,
};
const modalStyle: React.CSSProperties = {
  width: 400, maxWidth: "100%", padding: 22, maxHeight: "85vh", overflowY: "auto", position: "relative",
};
