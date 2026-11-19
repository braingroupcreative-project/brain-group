# Brain Group — Site vitrine, devis et suivi des commandes

Implémentation du cahier des charges v1.0 (19 novembre 2026).
**Stack** : Next.js 15 (App Router, TypeScript) · Tailwind · PostgreSQL managé (Supabase) · stockage privé Supabase · Resend (e-mails) · pdf-lib (PDF) · Vercel (hébergement + cron).

## 1. Ce qui est livré

| Cahier des charges | Où |
|---|---|
| Site public (Accueil, 3 services, Réalisations, À propos, Contact, pages légales) | `src/app/(site)` |
| Formulaire de devis multi-étapes, champs conditionnels, pièces jointes, récapitulatif, référence `BG-AAAA-NNNN` | `src/app/(site)/devis`, `src/app/api/devis`, `src/lib/form.ts` |
| Enregistrement + e-mail à l'équipe + accusé de réception + page de confirmation + WhatsApp | `src/app/api/devis/route.ts`, `src/lib/workflow.ts` |
| Back-office (tableau de bord, recherche/filtres, affectation, notes internes, historique, appel/WhatsApp) | `src/app/admin` |
| Rôles Administrateur / Agent commercial, contrôlés **côté serveur** | `src/lib/auth.ts`, `src/app/admin/actions.ts` |
| Devis : lignes, remises, validité, délai, conditions, acompte (% ou montant), PDF de marque, envoi e-mail, partage WhatsApp, acceptation/refus, conversion en commande | `admin/devis`, `src/lib/pdf.ts`, `/proposition/[token]` |
| Statut commercial **distinct** du statut de paiement | `admin/commandes/[id]` |
| Paiement Wave Marchand : page de règlement (QR officiel), déclaration client, **confirmation manuelle** par l'admin, solde recalculé, reçu PDF | `/paiement/[token]`, `admin/commandes` |
| Relance 72 h : alerte e-mail + alerte tableau de bord, annulée dès la prise en charge | `src/app/api/cron/relance`, `vercel.json` |
| Notifications e-mail (7 événements du §9) | `src/lib/workflow.ts` |
| Réalisations gérées depuis l'administration (ajout d'image, masquer, mettre en avant, supprimer) | `admin/realisations`, `src/lib/realisations.ts` |
| Répondre au client par e-mail depuis la fiche de demande (consigné dans l'historique) | `admin/demandes/[id]` |
| Sécurité (§11), SEO (§12), responsive/accessibilité | voir §5 |

Hors périmètre v1 (comme prévu au cahier des charges) : boutique avec panier/stock, API Wave, API WhatsApp automatique.

## 2. Démarrage en local

```bash
npm install
npm run dev          # http://localhost:3000
```

Sans variables d'environnement, le site fonctionne en **mode local** : données dans `.data/` (JSON), fichiers dans `.data/uploads`, e-mails écrits dans `.data/outbox.jsonl`.
Connexion admin locale : `admin@braingroup.local` / `ChangeMe!2026` (uniquement hors production).
⚠ Le mode local n'est **pas** persistant sur Vercel : renseignez Supabase avant de déployer.

## 3. Mise en production (Vercel)

1. **Supabase** : créer un projet → *SQL Editor* → exécuter `supabase/schema.sql` (tables, compteurs, RLS verrouillé, bucket privé `brain-private`).
2. **Resend** : créer un compte, vérifier le domaine d'envoi, créer une clé API. (Ne pas utiliser le mot de passe Gmail : voir §9 du cahier des charges.)
3. **Dépôt Git** : pousser le projet (le dépôt doit appartenir à Brain Group ou lui être transféré).
4. **Vercel** : *Add New Project* → importer le dépôt → renseigner les variables ci-dessous → déployer. Ajouter le domaine personnalisé (HTTPS automatique).
5. **Premier accès** : se connecter sur `/admin/login` avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` ; le compte administrateur est créé à la première connexion. **Changer aussitôt le mot de passe** (*Mon compte*), puis retirer `ADMIN_PASSWORD` des variables.
6. `public/wave-qr.png` (QR Wave Marchand) est déjà en place. Le logo Brain Group (`public/logo.png` et `logo-white.png`) est déjà en place.
7. **Réalisations** : les 3 logos fournis (Skiny & Seduction by Flora, BATCI, Dreamland Africa) sont publiés automatiquement au premier affichage. Ensuite, tout se gère dans **Administration → Réalisations**.

> **v1.2 (pôle Solutions digitales & IA)** : exécuter la section « Mise à jour v1.2 » de `supabase/schema.sql` dans Supabase, sinon les demandes du nouveau pôle sont refusées par la base.
>
> Si la base Supabase a été créée avant la v1.1, exécuter à nouveau la fin de `supabase/schema.sql` (section « Mise à jour v1.1 ») pour créer la table `realisations`.

### Variables d'environnement (voir `.env.example`)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique (liens dans les e-mails, SEO, sitemap) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_ADDRESS` | Coordonnées affichées |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` | Base + stockage privé (**secret** : serveur uniquement) |
| `AUTH_SECRET` | Signature des sessions (≥ 32 caractères aléatoires) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Création du premier administrateur |
| `RESEND_API_KEY`, `MAIL_FROM`, `TEAM_EMAIL` | E-mails transactionnels |
| `CRON_SECRET` | Protège `/api/cron/relance` (Vercel l'envoie automatiquement) |

Environnements : utiliser un projet Supabase distinct pour la préproduction et définir les variables par environnement Vercel (Preview / Production).

### Tâche planifiée 72 h
`vercel.json` exécute `/api/cron/relance` **chaque jour à 08:00 UTC** (limite du plan Vercel gratuit « Hobby »). Sur un plan Pro, remplacer par `0 * * * *` (toutes les heures) pour une alerte au plus près des 72 h. En complément, le tableau de bord affiche en temps réel les demandes proches (> 48 h) ou au-delà de 72 h.

## 4. Guide d'utilisation du back-office (résumé)

1. **Demandes** → ouvrir une demande → *Prendre en charge* (annule la relance 72 h).
2. *Créer un devis* → remplir les lignes → *Enregistrer* → *Aperçu PDF* → *Envoyer par e-mail* (ou *Partager sur WhatsApp*).
3. Le client ouvre le lien, **accepte ou refuse** en ligne (ou vous enregistrez sa décision à la main).
4. Devis accepté → *Convertir en commande* → le client reçoit/consulte sa page de paiement.
5. Le client déclare son paiement Wave (référence + preuve). **Vérifiez dans votre espace Wave Marchand**, puis *Confirmer* dans *Commandes & paiements* : le solde est recalculé et un reçu PDF est envoyé. Vous pouvez aussi saisir un paiement reçu directement.
6. Faire avancer la commande : *En production* → *Terminée / livrée* (e-mail automatique au client).

## 5. Sécurité, SEO, accessibilité — ce qui est en place

- HTTPS + en-têtes de sécurité (HSTS, nosniff, anti-framing) ; `/admin`, `/proposition`, `/paiement` en `noindex`.
- Mots de passe hachés (scrypt) ; sessions signées (cookie `httpOnly`, `secure`, `sameSite`) ; comptes désactivables avec effet immédiat ; limitation des tentatives de connexion.
- Rôles vérifiés **côté serveur** dans chaque action/route ; middleware sur `/admin`.
- Validation serveur (zod) de tous les champs ; seuls les champs du service choisi sont conservés.
- Pièces jointes : type **réel** contrôlé (signature binaire, pas seulement l'extension), 8 Mo / 5 fichiers max, stockage **privé**, téléchargement uniquement via une route authentifiée.
- Anti-spam : champ piège, délai minimal de remplissage, limitation de débit par IP, contrôle d'origine (CSRF) sur les routes API ; les Server Actions Next.js ont leur protection native.
- Devis/paiement client protégés par un jeton aléatoire de 192 bits (non devinable).
- Journal des actions sensibles (devis, paiements, suppressions, utilisateurs) visible dans *Utilisateurs*.
- Secrets uniquement en variables d'environnement ; la clé service Supabase n'atteint jamais le navigateur ; RLS activé sans politique.
- SEO : titres/descriptions uniques, URL lisibles, `sitemap.xml`, `robots.txt`, données structurées (LocalBusiness, Service, FAQ). Accessibilité : lien d'évitement, labels, focus visible, contrastes, `prefers-reduced-motion`.

## 6. Sauvegarde et restauration
- Supabase : activer les sauvegardes quotidiennes (plan Pro) **ou** planifier un `pg_dump` hebdomadaire ; **tester une restauration** avant la mise en ligne (recette §13).
- Stockage : exporter périodiquement le bucket `brain-private`.

## 7. À fournir / à confirmer (cahier des charges §14)
Logo HD · numéros téléphone et WhatsApp Business · lien Facebook · adresse · **QR Code Wave Marchand** · photos/vidéos libres de droits · descriptions exactes des prestations et tarifs éventuels · domaine · coordonnées légales (à compléter entre crochets dans `mentions-legales`, `confidentialite`, `conditions`).
Conformité Côte d'Ivoire (données personnelles, durée de conservation) : à valider avant la mise en production.

## 8. Choix d'architecture retenus (à confirmer)
Next.js + PostgreSQL managé + stockage privé (recommandation du §10) · administrateur + agents · devis préparé manuellement · acompte défini devis par devis (50 % proposé par défaut) · Wave par QR avec vérification manuelle · WhatsApp par lien direct + relance manuelle · catalogue informatique sans prix.
