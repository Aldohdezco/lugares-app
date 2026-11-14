// Copia la base local (DATABASE_URL) a producción (DATABASE_URL_PROD) y sube a
// Cloudinary las fotos guardadas en public/imagenes, cambiando sus URLs.
// Se puede correr varias veces: no duplica filas ni fotos.
//
//   node scripts/migrar-a-produccion.mjs
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")]; }),
);
for (const k of ["DATABASE_URL", "DATABASE_URL_PROD", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!env[k]) throw new Error(`Falta ${k} en .env`);
}

const local = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
const prod = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL_PROD } } });

const sign = (p) =>
  crypto.createHash("sha1")
    .update(Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join("&") + env.CLOUDINARY_API_SECRET)
    .digest("hex");

// Sube un archivo local con un public_id fijo (lugares/<nombre>), así repetirlo no duplica
async function uploadPhoto(file) {
  const params = {
    public_id: `lugares/${path.parse(file).name}`,
    format: "jpg",
    overwrite: "false",
    timestamp: Math.floor(Date.now() / 1000),
    transformation: "c_limit,h_2048,w_2048/q_auto:good",
  };
  const fd = new FormData();
  fd.append("file", new Blob([fs.readFileSync(file)]), path.basename(file));
  for (const [k, v] of Object.entries({ ...params, api_key: env.CLOUDINARY_API_KEY, signature: sign(params) })) fd.append(k, String(v));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || res.statusText);
  return data.secure_url;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

async function main() {
  const [users, friendships, spaces, members, places, visits, photos] = await Promise.all([
    local.user.findMany(), local.friendship.findMany(), local.space.findMany(), local.spaceMember.findMany(),
    local.place.findMany(), local.visit.findMany(), local.photo.findMany(),
  ]);
  console.log(`Local: ${users.length} usuarios, ${spaces.length} espacios, ${places.length} lugares, ${visits.length} visitas, ${photos.length} fotos`);

  // Fotos: las que están en disco se suben; las demás conservan su URL
  const pending = photos.filter((p) => p.url.startsWith("/imagenes/"));
  console.log(`Subiendo ${pending.length} fotos a Cloudinary...`);
  const missing = [];
  let done = 0;
  const newUrl = new Map();
  await mapLimit(pending, 4, async (p) => {
    const file = path.join("public", "imagenes", path.basename(p.url));
    if (!fs.existsSync(file)) { missing.push(p.url); return; }
    newUrl.set(p.id, await uploadPhoto(file));
    if (++done % 10 === 0) console.log(`  ${done}/${pending.length}`);
  });
  const photosOut = photos
    .filter((p) => !missing.includes(p.url))
    .map((p) => ({ ...p, url: newUrl.get(p.id) ?? p.url }));

  // Copia en orden de dependencias; skipDuplicates permite repetir
  const opts = { skipDuplicates: true };
  await prod.user.createMany({ data: users, ...opts });
  await prod.friendship.createMany({ data: friendships, ...opts });
  await prod.space.createMany({ data: spaces, ...opts });
  await prod.spaceMember.createMany({ data: members, ...opts });
  await prod.place.createMany({ data: places, ...opts });
  await prod.visit.createMany({ data: visits, ...opts });
  await prod.photo.createMany({ data: photosOut, ...opts });

  const counts = await Promise.all([prod.user.count(), prod.space.count(), prod.place.count(), prod.visit.count(), prod.photo.count()]);
  console.log(`Producción: ${counts[0]} usuarios, ${counts[1]} espacios, ${counts[2]} lugares, ${counts[3]} visitas, ${counts[4]} fotos`);
  if (missing.length) console.log(`Fotos sin archivo local (no se copiaron): ${missing.join(", ")}`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => Promise.all([local.$disconnect(), prod.$disconnect()]));
