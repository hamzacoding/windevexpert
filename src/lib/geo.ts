import type { NextRequest } from "next/server";
import eurozone from "@/config/geo/eurozone.json";
import africa from "@/config/geo/africa.json";

type DisplayPrice = { valeur: number; devise: "USD" | "EUR" | "DZD" };

function parseIpFromHeaders(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    return first || null;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  // Next.js local dev often lacks remote IP. Fallback to 127.0.0.1.
  return null;
}

function readCountryCodeFromHeaders(req: NextRequest): string | null {
  const headerCandidates = [
    "x-country-code", // custom override from client
    "cf-ipcountry",   // Cloudflare
    "x-vercel-ip-country", // Vercel
    "x-geo-country"   // generic
  ];
  for (const h of headerCandidates) {
    const v = req.headers.get(h);
    if (v && typeof v === "string" && v.length >= 2) {
      const cc = v.slice(0, 2).toUpperCase();
      if (/^[A-Z]{2}$/.test(cc)) return cc;
    }
  }
  return null;
}

export function detectCountryCode(req: NextRequest): string {
  // 1) Header override (highest priority)
  const headerCC = readCountryCodeFromHeaders(req);
  if (headerCC) return headerCC;

  // 2) Cookie if available
  const cookieCountry = req.cookies.get("country_code")?.value;
  if (cookieCountry && typeof cookieCountry === "string" && cookieCountry.length === 2) {
    return cookieCountry.toUpperCase();
  }

  const ip = parseIpFromHeaders(req) || "127.0.0.1";
  // Charger geoip-lite dynamiquement pour éviter les erreurs de bundling
  // quand les fichiers de données ne sont pas présents (dev/Turbopack).
  let cc = "US";
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const geoip = require("geoip-lite");
    const geo = geoip?.lookup?.(ip);
    cc = geo?.country || "US";
  } catch (_err) {
    // Fallback silencieux → US
    cc = "US";
  }
  return cc.toUpperCase();
}

export function determineDisplayPrice(
  countryCode: string,
  course: {
    priceUSD?: number | null;
    priceEUR?: number | null;
    priceDZD?: number | null;
    priceAFR?: number | null;
    price?: number | null; // legacy euro
    priceDA?: number | null; // legacy dinar
  }
): DisplayPrice {
  const cc = countryCode.toUpperCase();
  const isDZ = cc === "DZ";
  const isAfrica = !isDZ && africa.includes(cc);
  const isEuro = eurozone.includes(cc);

  // Prefer new fields; fall back to legacy
  const eur = course.priceEUR ?? course.price ?? null;
  const dzd = course.priceDZD ?? course.priceDA ?? null;
  const usd = course.priceUSD ?? null;
  const afr = course.priceAFR ?? usd ?? null;

  if (isDZ && dzd != null) {
    return { valeur: Number(dzd), devise: "DZD" };
  }
  if (isAfrica && afr != null) {
    return { valeur: Number(afr), devise: "USD" };
  }
  if (isEuro && eur != null) {
    return { valeur: Number(eur), devise: "EUR" };
  }
  // Rest of world → USD; fallback to EUR if USD not set
  const world = usd ?? eur ?? dzd ?? 0;
  return { valeur: Number(world), devise: usd != null ? "USD" : eur != null ? "EUR" : "DZD" };
}

export function buildPrixAffiche(countryCode: string, course: any) {
  const p = determineDisplayPrice(countryCode, course);
  return { prix_affiche: { valeur: p.valeur, devise: p.devise } };
}