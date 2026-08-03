"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const translations = {
  es: {
    settings: "Configuración",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    language: "Idioma",
    logout: "Salir",
    filters: "Filtros",
    from: "Desde",
    to: "Hasta",
    allCategories: "Todas las categorías",
    members: "Miembros",
    addFriend: "Agregar amigo",
    friendEmail: "Correo del amigo",
    send: "Enviar",
    spaceMembers: "Miembros del espacio",
    addToSpace: "Agregar al espacio",
    newSpace: "Nuevo espacio",
    spaceName: "Nombre del espacio",
    create: "Crear",
    newPlace: "Nuevo lugar",
    name: "Nombre",
    category: "Categoría",
    date: "Fecha",
    description: "Descripción",
    photoUrl: "Foto (URL)",
    photos: "Fotos",
    addVisit: "Agregar visita",
    visit: "visita",
    visitsPlural: "visitas",
    cancel: "Cancelar",
    secretTheme: "Tema especial",
    edit: "Editar",
    delete: "Eliminar",
    editPlace: "Editar lugar",
    editVisit: "Editar visita",
    confirmDeletePlace: "¿Eliminar este lugar y todas sus visitas? Esta acción no se puede deshacer.",
    confirmDeleteVisit: "¿Eliminar esta visita? Esta acción no se puede deshacer.",
    pendingRequests: "Solicitudes pendientes",
    accept: "Aceptar",
    reject: "Rechazar",
    spaceSettings: "Espacio actual",
    renameSpace: "Renombrar espacio",
    deleteSpace: "Eliminar espacio",
    confirmDeleteSpace: "¿Eliminar este espacio y TODOS sus lugares, visitas y fotos? Esta acción no se puede deshacer.",
    onlyOwnerCanManage: "Solo quien creó el espacio puede editarlo o eliminarlo",
    noPendingRequests: "No tienes solicitudes pendientes",
    save: "Guardar lugar",
    saving: "Guardando...",
    addedBy: "agregado por",
    hello: "Hola",
    noFriendsYet: "Aún no tienes amigos agregados",
    locateMe: "Mi ubicación",
    locationDenied: "No se pudo acceder a tu ubicación. Revisa los permisos del navegador.",
    locationUnsupported: "Tu navegador no soporta geolocalización.",
  },
  en: {
    settings: "Settings",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    logout: "Log out",
    filters: "Filters",
    from: "From",
    to: "To",
    allCategories: "All categories",
    members: "Members",
    addFriend: "Add friend",
    friendEmail: "Friend's email",
    send: "Send",
    spaceMembers: "Space members",
    addToSpace: "Add to space",
    newSpace: "New space",
    spaceName: "Space name",
    create: "Create",
    newPlace: "New place",
    name: "Name",
    category: "Category",
    date: "Date",
    description: "Description",
    photoUrl: "Photo (URL)",
    photos: "Photos",
    addVisit: "Add visit",
    visit: "visit",
    visitsPlural: "visits",
    cancel: "Cancel",
    secretTheme: "Special theme",
    edit: "Edit",
    delete: "Delete",
    editPlace: "Edit place",
    editVisit: "Edit visit",
    confirmDeletePlace: "Delete this place and all its visits? This can't be undone.",
    confirmDeleteVisit: "Delete this visit? This can't be undone.",
    pendingRequests: "Pending requests",
    accept: "Accept",
    reject: "Reject",
    spaceSettings: "Current space",
    renameSpace: "Rename space",
    deleteSpace: "Delete space",
    confirmDeleteSpace: "Delete this space and ALL its places, visits and photos? This can't be undone.",
    onlyOwnerCanManage: "Only the space creator can edit or delete it",
    noPendingRequests: "No pending requests",
    save: "Save place",
    saving: "Saving...",
    addedBy: "added by",
    hello: "Hi",
    noFriendsYet: "You haven't added any friends yet",
    locateMe: "My location",
    locationDenied: "Couldn't access your location. Check your browser permissions.",
    locationUnsupported: "Your browser doesn't support geolocation.",
  },
};

type Lang = "es" | "en";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: typeof translations["es"] }>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored) setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
