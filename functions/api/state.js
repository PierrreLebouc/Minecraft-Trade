// Cloudflare Pages Function : état partagé du Grimoire (enchantements + bibliothécaires).
// Liaisons attendues (Paramètres du projet Pages → Liaisons / Variables) :
//   - KV namespace lié sous le nom GRIMOIRE
//   - EDIT_TOKEN (facultatif) : si défini, il faut ce code pour modifier l'état
//     (ou une session d'édition ouverte depuis le Hub, voir api/sso.js)

import { hasEditSession } from "../../edit-session.js";

const KEY = "state";
const MAX_BYTES = 512 * 1024;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function validState(s) {
  return s && typeof s === "object" && !Array.isArray(s)
    && s.owned && typeof s.owned === "object" && !Array.isArray(s.owned)
    && Array.isArray(s.villagers)
    && s.villagers.every(v => v && Number.isInteger(v.id) && Number.isInteger(v.c) && Number.isInteger(v.r) && Array.isArray(v.books));
}

export async function onRequestGet({ env }) {
  if (!env.GRIMOIRE) return json({ error: "KV GRIMOIRE non configuré" }, 503);
  const stored = await env.GRIMOIRE.get(KEY, "json");
  return json(stored || { state: null, updatedAt: 0 });
}

export async function onRequestPut({ request, env }) {
  if (!env.GRIMOIRE) return json({ error: "KV GRIMOIRE non configuré" }, 503);
  if (env.EDIT_TOKEN && request.headers.get("x-edit-token") !== env.EDIT_TOKEN && !(await hasEditSession(request, env.EDIT_TOKEN))) {
    return json({ error: "Code d'édition invalide" }, 401);
  }
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "État trop volumineux" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "JSON invalide" }, 400); }
  if (!validState(body.state)) return json({ error: "État invalide" }, 400);
  const updatedAt = Date.now();
  await env.GRIMOIRE.put(KEY, JSON.stringify({ state: body.state, updatedAt }));
  return json({ updatedAt });
}
