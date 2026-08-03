# Nuestros Lugares — Historial de visitas con amigos/pareja

## Qué incluye este scaffold
- Login/registro con NextAuth (credenciales + bcrypt)
- Amigos (solicitudes, aceptar/rechazar) — `app/api/friends`
- Espacios individuales o compartidos (álbumes) — `app/api/spaces`
- Mapa (Leaflet + OpenStreetMap) con marcador por categoría — `components/MapView.tsx`
- Modal de lugar: nombre, descripción, fecha, galería de fotos (URLs) — `components/PlaceModal.tsx`
- Filtros por fecha / rango de fechas / categoría
- PWA lista (manifest + next-pwa) para el "Agregar a pantalla de inicio"
- Prisma + MySQL — `prisma/schema.prisma`

## 1. Correr localmente con phpMyAdmin (XAMPP/WAMP/Laragon)

1. Instala **XAMPP** (o Laragon, más ligero) y arranca Apache + MySQL.
2. Abre phpMyAdmin (`http://localhost/phpmyadmin`) y crea una base vacía llamada `lugares_app`.
3. Clona/descomprime este proyecto, entra a la carpeta:
   ```bash
   npm install
   cp .env.example .env
   ```
4. Ajusta `.env` si tu MySQL tiene contraseña (por defecto root sin password en XAMPP):
   ```
   DATABASE_URL="mysql://root:@localhost:3306/lugares_app"
   ```
5. Genera las tablas:
   ```bash
   npx prisma migrate dev --name init
   ```
   Esto crea todas las tablas automáticamente en `lugares_app`, visibles en phpMyAdmin.
6. Corre el proyecto:
   ```bash
   npm run dev
   ```
   Ve a `http://localhost:3000/register` para crear tu primer usuario.

### Ver/editar datos con GUI (alternativa a phpMyAdmin)
```bash
npx prisma studio
```

## 2. Pendientes por conectar (para que quede 100% funcional)
- **Fotos**: ahora mismo el modal solo guarda URLs de imágenes. Para subir fotos reales desde el celular, conecta un uploader a **Cloudinary** (tienen free tier con API sencilla) o Supabase Storage, y pon la URL resultante en el campo.
- **Iconos PWA**: agrega `public/icons/icon-192.png` y `icon-512.png` (192x192 y 512x512 px) para que el prompt de instalación se vea bien.
- **Autocompletar ubicación**: si quieres buscar direcciones por nombre en vez de solo click en el mapa, se puede agregar Nominatim (gratis, mismo proveedor de OpenStreetMap).
- El botón de "agregar amigo" y "crear espacio compartido" ya tienen su API lista (`/api/friends`, `/api/spaces`); falta la pantalla de UI para amigos — dime si quieres que te la arme también.

## 3. Subir a hosting gratuito

**Frontend (Next.js) → Vercel**
1. Sube el proyecto a un repo de GitHub.
2. En vercel.com, "Import Project" desde ese repo.
3. Agrega las variables de entorno (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) en el dashboard de Vercel.

**Base de datos MySQL gratuita** (elige una):
- **Railway** (railway.app) — MySQL gratis con límite de horas/mes, connection string lista para copiar.
- **Aiven** (aiven.io) — free tier de MySQL, buena opción estable.
- **Clever Cloud** — también tiene MySQL free tier.

Una vez tengas la connection string de producción:
```bash
# Actualiza DATABASE_URL en Vercel con la string de producción, luego:
npx prisma migrate deploy
```
(esto aplica las migraciones a la base de datos en la nube, sin perder los datos)

## 5. Novedades: visitas múltiples, fotos reales y tema secreto

**Cambio de modelo de datos**: ahora un `Place` (el pin del mapa) puede tener muchas `Visit` (cada visita con su propia fecha, descripción y fotos). Como esto cambia la estructura de las tablas, si ya tenías datos de prueba corriendo local vas a necesitar resetear la base:
```bash
npx prisma migrate reset
npx prisma migrate dev --name visits_and_photos
```
(`migrate reset` borra los datos actuales; si te importa conservarlos avísame y armamos una migración de datos en vez de reset)

**Fotos reales, no URLs**: ahora se suben de verdad a `public/imagenes/` vía `/api/upload` (multipart, máx 8MB, solo jpg/png/webp/gif). Como viven dentro de `public/`, Next las sirve directo como `/imagenes/archivo.jpg`. Para tu contenedor de Docker, monta `public/imagenes` como volumen persistente así:
```dockerfile
VOLUME ["/app/public/imagenes"]
```
para que las fotos no se pierdan cada vez que reconstruyas la imagen.

**Tema secreto**: si el `id` del espacio activo es `cms9d0fjj00027rj77m0ys9pq` (editable en `lib/constants.ts`), aparece una opción extra "✦ Tema especial ✦" en el menú de configuración con paleta lila/morado. Para cualquier otro espacio, esa opción ni siquiera se muestra.

## 4. Categorías de lugares incluidas
☕ Cafetería · 🍽️ Restaurante · 🏠 Casa · 🏨 Hotel · 🌳 Parque · 🎬 Cine · 🚶 Paseo ·
🎡 Feria · 🏛️ Museo · 🍸 Bar · 🏖️ Playa · 🎤 Concierto · ⚽ Deporte · 🛍️ Compras · 📍 Otro

Puedes agregar/quitar categorías editando `lib/categories.ts` y el enum `PlaceCategory` en `prisma/schema.prisma` (luego corre `npx prisma migrate dev` de nuevo).
