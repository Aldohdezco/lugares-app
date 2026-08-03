"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { CATEGORIES, CategoryKey } from "@/lib/categories";
import { CategoryIcon } from "./icons/CategoryIcons";
import { IconFilter, IconChevronDown, IconTarget } from "./icons/UiIcons";
import { useLang } from "@/lib/i18n";
import PlaceModal from "./PlaceModal";

type Photo = { id: string; url: string };
type Visit = { id: string; description: string; visitDate: string; photos: Photo[]; createdBy: { name: string } };
type Place = {
  id: string;
  name: string;
  category: CategoryKey;
  latitude: number;
  longitude: number;
  visits: Visit[];
};

function makeIcon(category: CategoryKey, active = false) {
  const svg = renderToStaticMarkup(<CategoryIcon category={category} size={15} strokeWidth={2} />);
  const ring = active ? `<div class="marker-pulse"></div>` : "";
  return L.divIcon({
    html: `
      <div class="tech-marker ${active ? "tech-marker-active" : ""}">
        ${ring}
        <div class="tech-marker-dot">${svg}</div>
      </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function ClickCapture({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const liveIcon = L.divIcon({
  html: `<div class="live-dot"><div class="live-dot-pulse"></div><div class="live-dot-core"></div></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function LiveLocationMarker({ enabled, onError }: { enabled: boolean; onError: (msg: string) => void }) {
  const map = useMap();
  const [pos, setPos] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const centeredOnceRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      centeredOnceRef.current = false;
      setPos(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      onError("unsupported");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const latlng: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(latlng);
        if (!centeredOnceRef.current) {
          centeredOnceRef.current = true;
          map.flyTo(latlng, Math.max(map.getZoom(), 15), { duration: 1 });
        }
      },
      () => onError("denied"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!pos) return null;
  return <Marker position={pos} icon={liveIcon} />;
}

export default function MapView({ spaceId }: { spaceId: string }) {
  const { t } = useLang();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newPoint, setNewPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<{ from?: string; to?: string; category?: string }>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  async function loadPlaces() {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
      );
      const params = new URLSearchParams({ spaceId, ...cleanFilters });
      const res = await fetch(`/api/places?${params.toString()}`);

      if (!res.ok) {
        console.error("No se pudieron cargar los lugares:", res.status);
        setPlaces([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setPlaces([]);
        return;
      }

      setPlaces(JSON.parse(text));
    } catch (err) {
      console.error("Error cargando lugares:", err);
      setPlaces([]);
    }
  }

  useEffect(() => {
    loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, filters]);

  const selectedPlace = places.find((p) => p.id === selectedId) || null;

  return (
    <div className="map-frame">
      <span className="hud-corner hud-tl" />
      <span className="hud-corner hud-tr" />
      <span className="hud-corner hud-bl" />
      <span className="hud-corner hud-br" />

      <div className="panel map-filters">
        <button
          className="mono"
          onClick={() => setFiltersOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)",
            padding: "10px 12px", width: "100%",
          }}
        >
          <IconFilter size={14} /> {t.filters}
          <span style={{ marginLeft: "auto", transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <IconChevronDown size={13} />
          </span>
        </button>

        {filtersOpen && (
          <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label className="filter-label">{t.from}</label>
              <input type="date" className="tech-input" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            </div>
            <div>
              <label className="filter-label">{t.to}</label>
              <input type="date" className="tech-input" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            </div>
            <div>
              <label className="filter-label">{t.category}</label>
              <select className="tech-input" onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}>
                <option value="">{t.allCategories}</option>
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="panel map-counter mono">
        {places.length.toString().padStart(2, "0")} <span style={{ color: "var(--text-dim)" }}>PTS</span>
      </div>

      <button
        className={`icon-btn panel locate-btn ${locating ? "active" : ""}`}
        onClick={() => setLocating((v) => !v)}
        aria-label={t.locateMe}
        title={t.locateMe}
      >
        <IconTarget size={16} />
      </button>

      <MapContainer center={[20.0, -99.0]} zoom={6} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onMapClick={(lat, lng) => setNewPoint({ lat, lng })} />
        <LiveLocationMarker
          enabled={locating}
          onError={(kind) => {
            setLocating(false);
            alert(kind === "unsupported" ? t.locationUnsupported : t.locationDenied);
          }}
        />

        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={makeIcon(p.category, selectedId === p.id)}
            eventHandlers={{ click: () => setSelectedId(p.id) }}
          />
        ))}
      </MapContainer>

      {selectedPlace && (
        <PlaceModal
          mode="view"
          place={selectedPlace}
          onClose={() => setSelectedId(null)}
          onVisitAdded={loadPlaces}
          onPlaceDeleted={() => { setSelectedId(null); loadPlaces(); }}
        />
      )}

      {newPoint && (
        <PlaceModal
          mode="create"
          spaceId={spaceId}
          coords={newPoint}
          onClose={() => setNewPoint(null)}
          onCreated={() => { setNewPoint(null); loadPlaces(); }}
        />
      )}
    </div>
  );
}
