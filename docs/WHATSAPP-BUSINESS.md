# Configurer WhatsApp Business (menu de services dans la conversation)

Le site affiche déjà un menu de services quand le client clique sur le bouton WhatsApp : son choix arrive pré-écrit dans votre conversation.
Ce guide complète le dispositif **dans l'application WhatsApp Business** (gratuite, sur le téléphone), pour répondre plus vite.

> Utilisez l'application **WhatsApp Business** (pas WhatsApp classique) avec le numéro professionnel de Brain Group.
> Le numéro doit aussi être renseigné dans Vercel : `NEXT_PUBLIC_WHATSAPP_NUMBER` (format `2250700000000`).

## 1. Profil professionnel
*Paramètres → Outils professionnels → Profil de l'entreprise* : nom, logo, description, adresse, horaires, e-mail, site web (`https://www.braingroup-ci.com`).

## 2. Message d'accueil automatique
*Outils professionnels → Message d'accueil* (envoyé à un nouveau client). Texte proposé :

```
Bonjour 👋 Merci de contacter Brain Group !
Dites-nous ce qui vous intéresse :

1️⃣ Couverture événementielle (photo, vidéo)
2️⃣ Imprimerie & communication visuelle
3️⃣ Matériel informatique
4️⃣ Solutions digitales & IA (site, application, automatisation)
5️⃣ Communication & visibilité (réseaux sociaux, clips vidéo)

Répondez par le numéro de votre choix. Pour un devis en 2 minutes :
https://www.braingroup-ci.com/devis
```

## 3. Message d'absence
*Outils professionnels → Message d'absence* (hors horaires) :

```
Merci pour votre message ! Nous sommes actuellement indisponibles.
Nous vous répondons dès notre retour. Pour gagner du temps, demandez votre devis ici :
https://www.braingroup-ci.com/devis
```

## 4. Réponses rapides (raccourcis)
*Outils professionnels → Réponses rapides*. Tapez `/` puis le raccourci dans une conversation :

| Raccourci | Message |
|---|---|
| `/devis` | `Pour recevoir un devis précis, remplissez ce formulaire (2 minutes) : https://www.braingroup-ci.com/devis` |
| `/evenement` | `Pour votre événement, pouvez-vous nous indiquer : le type d'événement, la date, le lieu, la durée et les prestations souhaitées (photo, vidéo, drone) ?` |
| `/impression` | `Pour votre impression, merci de préciser : le support, la quantité, le format, les couleurs, la date souhaitée, et d'envoyer votre fichier si vous en avez un.` |
| `/materiel` | `Quel équipement recherchez-vous ? Merci d'indiquer le type, la marque ou le modèle, la quantité et l'usage prévu.` |
| `/digital` | `Pour votre projet digital, décrivez-nous l'objectif, les fonctionnalités attendues, le secteur d'activité et l'échéance souhaitée.` |
| `/visibilite` | `Pour la communication, dites-nous votre activité, votre objectif, les réseaux visés (Facebook, Instagram, TikTok…) et si vous souhaitez un clip vidéo.` |
| `/paiement` | `Le règlement se fait par Wave Marchand. Une fois votre devis accepté, vous recevrez le lien de paiement avec le QR Code.` |

## 5. Catalogue
*Outils professionnels → Catalogue* : ajoutez vos prestations ou produits avec photo, description et, si vous le souhaitez, un prix ou « sur devis ». Les clients le consultent directement dans la conversation.

## 6. Étiquettes (suivi des clients)
*Outils professionnels → Étiquettes* : par exemple « Nouveau client », « Devis envoyé », « Acompte payé », « Livré ». À chaque conversation, vous voyez où en est le client.

## Pour aller plus loin (plus tard)
Un vrai chatbot (menu interactif automatique, réponses 24 h/24) nécessite l'API WhatsApp Business : numéro dédié, validation par Meta, messages modèles et frais par conversation. À envisager quand le volume de demandes le justifie.
