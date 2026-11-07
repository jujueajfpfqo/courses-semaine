# Déploiement — Les repas de la semaine

Guide pas à pas pour mettre l'appli en ligne, gratuitement, en ~20 minutes.
Aucune connaissance technique requise.

---

## Ce qu'on va faire

1. Mettre le code sur GitHub (le service qui héberge le code)
2. Créer la base de données sur Supabase (gratuit)
3. Mettre l'appli en ligne sur Vercel (gratuit)
4. Renseigner trois clés secrètes dans Vercel
5. Partager le lien à la famille

---

## Étape 1 — Mettre le code sur GitHub

### 1a. Créer un compte GitHub (si tu n'en as pas)

Va sur https://github.com et crée un compte gratuit.

### 1b. Créer un dépôt

1. Clique sur **New** (bouton vert en haut à gauche)
2. Donne un nom : `courses-semaine`
3. Choisis **Private** (tes recettes resteront privées)
4. Clique **Create repository**

### 1c. Envoyer le code

Dans le terminal, dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON-PSEUDO/courses-semaine.git
git push -u origin main
```

Remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub.

---

## Étape 2 — Créer la base de données Supabase

### 2a. Créer un compte et un projet

1. Va sur https://supabase.com et crée un compte gratuit
2. Clique **New project**
3. Donne un nom : `courses-semaine`
4. **Important : note le mot de passe que tu choisis** (tu n'en auras plus besoin, mais garde-le)
5. Choisis la région la plus proche (ex. **West EU (Paris)**)
6. Clique **Create new project** — attends 1-2 minutes

### 2b. Créer les tables (exécuter le schéma SQL)

1. Dans le menu de gauche, clique **SQL Editor**
2. Clique **New query** (bouton + en haut)
3. Ouvre le fichier `supabase/schema.sql` de ce projet et copie tout son contenu
4. Colle-le dans l'éditeur SQL de Supabase
5. Clique **Run** (bouton vert, ou Ctrl+Entrée)
6. Tu dois voir `Success. No rows returned` — c'est normal

### 2c. Récupérer les clés Supabase

1. Dans le menu de gauche, clique **Project Settings** (icône d'engrenage)
2. Clique **API**
3. Note ces deux valeurs (tu en auras besoin à l'étape 4) :
   - **Project URL** → ressemble à `https://xxxxxxxxxxx.supabase.co`
   - **service_role key** (clique sur "Reveal" pour l'afficher) → commence par `eyJ…`

   ⚠️ La `service_role key` donne un accès total à la base. Ne la partage jamais,
   ne la mets jamais dans le code — elle ira uniquement dans les variables Vercel.

---

## Étape 3 — Obtenir une clé Firecrawl (facultatif)

La clé Firecrawl permet d'importer des recettes depuis des sites qui n'ont pas
de données structurées (schema.org). Sans elle, l'import par URL fonctionne
quand même sur ~80% des sites de recettes. Tu as 1 000 crédits/mois gratuits.

1. Va sur https://firecrawl.dev et crée un compte gratuit
2. Dans ton tableau de bord, copie ta **API Key** (commence par `fc-…`)

Si tu ne veux pas de Firecrawl, laisse la variable `FIRECRAWL_API_KEY` vide à l'étape 4 —
l'appli utilisera uniquement le parsing schema.org.

---

## Étape 4 — Déployer sur Vercel

### 4a. Créer un compte et connecter GitHub

1. Va sur https://vercel.com et crée un compte gratuit (choisis "Continue with GitHub")
2. Autorise Vercel à accéder à tes dépôts GitHub

### 4b. Importer le projet

1. Sur le dashboard Vercel, clique **Add New… → Project**
2. Trouve `courses-semaine` dans la liste et clique **Import**
3. Sur la page de configuration, **ne change rien** — clique directement **Deploy**
4. Attends ~1 minute. Tu verras une animation, puis un message de succès.

### 4c. Renseigner les variables d'environnement

C'est ici que tu entres les clés secrètes. Vercel les stocke de façon sécurisée :
elles ne sont jamais visibles dans le code ni dans le navigateur.

1. Dans ton projet Vercel, clique sur **Settings** (menu du haut)
2. Dans le menu de gauche, clique **Environment Variables**
3. Ajoute ces trois variables, une par une :

| Nom                           | Valeur                                 |
|-------------------------------|----------------------------------------|
| `SUPABASE_URL`                | L'URL copiée à l'étape 2c             |
| `SUPABASE_SERVICE_ROLE_KEY`   | La service_role key de l'étape 2c     |
| `FIRECRAWL_API_KEY`           | Ta clé Firecrawl (ou laisse vide)     |

   Pour chaque variable :
   - Clique **Add New**
   - Remplis le champ **Name** (ex. `SUPABASE_URL`)
   - Remplis le champ **Value** (colle la valeur)
   - Laisse **All Environments** coché
   - Clique **Save**

4. Une fois les trois variables ajoutées, **redéploie** pour qu'elles soient prises en compte :
   - Clique sur **Deployments** dans le menu du haut
   - Clique sur les **…** à droite du dernier déploiement
   - Clique **Redeploy → Redeploy**
   - Attends ~30 secondes

---

## Étape 5 — Accéder à l'appli et la partager

1. Vercel t'a attribué une URL publique, visible en haut de ton projet :
   elle ressemble à `courses-semaine-xxxx.vercel.app`

2. Ouvre cette URL dans ton navigateur

3. Sur l'écran de connexion, invente un **code foyer** :
   par exemple `famille-dupont-automne-2026`
   - Ce code n'est pas votre mot de passe, c'est l'identifiant de votre espace partagé
   - Toute personne qui connaît ce code accède au même planning
   - Sur un autre appareil (téléphone, tablette, ordi), entrez exactement le même code

4. Partagez le lien Vercel et le code foyer à votre famille !

---

## Mises à jour futures

Quand tu modifies le code en local et que tu veux mettre l'appli à jour :

```bash
git add .
git commit -m "Description des changements"
git push
```

Vercel redéploie automatiquement dès qu'il détecte un push sur GitHub. Ça prend ~1 minute.

---

## En cas de problème

**L'appli s'affiche mais les données ne se sauvegardent pas**
→ Vérifie que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont bien renseignées dans Vercel
→ Vérifie que le SQL a bien été exécuté (étape 2b)

**L'import d'une recette par URL échoue**
→ Colle le texte de la recette directement dans le champ texte
→ Si tu as une clé Firecrawl, vérifie qu'elle est bien renseignée dans `FIRECRAWL_API_KEY`

**Erreur 500 dans la console**
→ Dans Vercel → Functions → logs, tu verras le message d'erreur exact
