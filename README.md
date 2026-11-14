# Lugares

Historial de los lugares que visitamos en pareja: mapa, visitas con fecha, descripción y fotos.

Next.js 14 · Prisma · MySQL · NextAuth · Leaflet · Cloudinary

## Correr en local

1. Enciende MySQL en XAMPP y crea la base `lugares_app`.
2. Copia `.env.example` a `.env` y llena los valores.
3. Instala y prepara la base:
   ```bash
   npm install
   npx prisma migrate deploy
   ```
4. `npm run dev` y abre http://localhost:3000

Si tu terminal tiene `NODE_ENV=production`, quítalo antes de `npm run dev`; si no, Next falla al compilar el CSS.

## Fotos

Con las variables `CLOUDINARY_*`, el navegador sube las fotos directo a Cloudinary con una firma del servidor; se guardan como JPG de máx. 2048 px. Sin esas variables se guardan en `public/imagenes` (ignorada por git).

## Producción

- App: Vercel (plan Hobby)
- Base: TiDB Cloud (MySQL, plan gratis). La URL lleva `?sslaccept=strict`.
- Fotos: Cloudinary (plan gratis)

Variables en Vercel: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` y, para LifeOS, `LIFEOS_TOKEN` y `LIFEOS_USER_EMAIL`.

Cambios de esquema: `DATABASE_URL="<url de producción>" npx prisma migrate deploy`.

`scripts/migrar-a-produccion.mjs` copia la base local a producción y sube las fotos de `public/imagenes` a Cloudinary (se puede repetir sin duplicar).

## Registro

Cerrado por defecto. Para abrirlo, pon `ALLOW_REGISTRATION=true`.

## LifeOS

`GET /api/integracion/resumen` (contrato v1). Ver `C:\Workspace\PortafolioProyectos\lifeos\INTEGRACION.md`.
