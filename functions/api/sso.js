// Connexion automatique depuis le Hub : GET /api/sso?token=…
// Le jeton (signé par le Hub, vérifié dans hub-sso.js) ouvre une session d'édition sur cet appareil :
// plus besoin de taper le code d'édition. Un jeton ne sert qu'une fois (noté dans le KV pendant 2 min).
import { verifyHubToken } from "../../hub-sso.js";
import { editCookie } from "../../edit-session.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const back = (msg) => Response.redirect(`${url.origin}/${msg ? `?sso=${encodeURIComponent(msg)}` : ""}`, 302);
  let t;
  try {
    t = await verifyHubToken(url.searchParams.get("token"), url.origin, env.HUB_PUBLIC_KEY || undefined);
  } catch (e) {
    return back(e.message);
  }
  const owner = env.HUB_EMAIL || "pierre.lebouc@etik.com";
  if (t.sub.toLowerCase() !== owner.toLowerCase()) return back("Compte non autorisé");
  if (env.GRIMOIRE) {
    const k = "sso:" + t.jti;
    if (await env.GRIMOIRE.get(k)) return back("Jeton déjà utilisé");
    await env.GRIMOIRE.put(k, "1", { expirationTtl: 120 });
  }
  // Sans EDIT_TOKEN, l'édition est déjà ouverte à tous : rien à mémoriser.
  const headers = { location: t.next };
  if (env.EDIT_TOKEN) headers["set-cookie"] = await editCookie(env.EDIT_TOKEN);
  return new Response(null, { status: 302, headers });
}
