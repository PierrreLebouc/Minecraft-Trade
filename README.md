# Grimoire

Suivi des enchantements Minecraft Bedrock et organisation d'un breeder à villageois (bibliothécaires).

- `index.html` : tout le site (aucune étape de build)
- `functions/api/state.js` : petite API Cloudflare qui garde l'état partagé (enchantements, bibliothécaires, favoris) pour que tous les appareils voient la même chose

## Mise en ligne sur Cloudflare Pages

1. **Créer le projet** : Cloudflare → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → choisir `Minecraft-Trade`.
   - Framework preset : *None*
   - Build command : *(vide)*
   - Build output directory : `/`
2. **Créer le stockage** : *Storage & Databases* → *KV* → *Create namespace* (par exemple `grimoire`).
3. **Lier le stockage au site** : projet Pages → *Settings* → *Bindings* → *Add* → *KV namespace*
   - Variable name : `GRIMOIRE` (exactement)
   - KV namespace : celui créé à l'étape 2
4. **(Recommandé) Protéger l'édition** : *Settings* → *Variables and Secrets* → *Add* → type *Secret*
   - Name : `EDIT_TOKEN`, Value : le code de ton choix

   Sans ce code, toute personne qui a l'URL peut modifier ta carte. Avec, chaque appareil le demande une seule fois.
5. **Redéployer** (*Deployments* → *Retry deployment*) pour que les liaisons soient prises en compte.

## Indicateur de synchronisation

À côté de « Grimoire », en haut de la liste :

- **Synchronisé** : les données sont partagées entre tous tes appareils
- **Envoi…** : une modification est en cours d'enregistrement
- **Hors ligne** : serveur injoignable, nouvel essai automatique
- **Local** : site ouvert en fichier local, ou stockage `GRIMOIRE` pas encore lié ; les données restent sur cet appareil

Les autres appareils récupèrent les changements en quelques secondes. Le stockage KV de Cloudflare peut parfois mettre jusqu'à une minute à propager une modification entre régions.
