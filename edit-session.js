// Session d'édition du Grimoire ouverte par le Hub : cookie signé (HMAC avec EDIT_TOKEN), valable 30 jours.
// Elle remplace la saisie du code d'édition sur cet appareil.
const COOKIE = "grimoire_edit";
const DAYS = 30;
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(secret, text) {
  const key = await crypto.subtle.importKey("raw", enc.encode("grimoire-session:" + secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

export async function editCookie(secret) {
  const payload = String(Date.now() + DAYS * 864e5);
  return `${COOKIE}=${payload}.${await sign(secret, payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86400}`;
}

export async function hasEditSession(request, secret) {
  const value = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1);
  if (!value || !secret) return false;
  const [payload, sig] = value.split(".");
  return Number(payload) > Date.now() && (await sign(secret, payload)) === sig;
}
