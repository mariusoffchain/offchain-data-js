# ocm-proxy — Cloudflare Worker

Proxy CORS pour mempool.space (hashrate, difficulty, fees, mempool).

## Déploiement (une fois, ~2 min)

```bash
cd worker
npx wrangler login    # ouvre le navigateur, se connecter au compte Cloudflare
npx wrangler deploy
```

Wrangler affiche l'URL déployée, ex. :

```
https://ocm-proxy.mariusoffchain.workers.dev
```

## Après déploiement

`src/data.js` pointe déjà vers `https://ocm-proxy.mariusoffchain.workers.dev`
(constante `MEMPOOL_BASE` en haut du fichier).

- Si l'URL déployée est **identique** → rien à faire, les charts mining/mempool
  passent en live au prochain chargement de la page.
- Si le sous-domaine workers.dev est **différent** → mettre à jour
  `MEMPOOL_BASE` dans `src/data.js`, puis `npm run build` et push.

## Vérification

```bash
curl -s "https://ocm-proxy.mariusoffchain.workers.dev/api/v1/mining/hashrate/1y" | head -c 200
```

Doit renvoyer du JSON (`{"hashrates":[...`).
