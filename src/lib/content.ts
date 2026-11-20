import type { ServiceKey } from "./site";

/**
 * Contenu éditorial du site. Les textes de prestations reprennent la liste du cahier des charges ;
 * ils sont à confirmer/ajuster par Brain Group (prestations réellement proposées, tarifs éventuels).
 */
export interface ServicePage {
  key: ServiceKey;
  title: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  offers: { title: string; text: string }[];
  steps: string[];
  faq: { q: string; a: string }[];
  gradient: string;
}

export const SERVICE_PAGES: Record<ServiceKey, ServicePage> = {
  evenementiel: {
    key: "evenementiel",
    title: "Couverture événementielle",
    seoTitle: "Couverture événementielle : photo, vidéo, mariages, dots, cérémonies",
    seoDescription:
      "Brain Group couvre vos mariages, baptêmes, anniversaires, dots, cérémonies et événements professionnels. Demandez votre devis en ligne.",
    lead: "Vos moments importants méritent d'être racontés avec soin. Brain Group couvre vos événements, du plus intime au plus professionnel.",
    offers: [
      { title: "Mariages & dots", text: "Une couverture complète de la cérémonie à la réception, pour garder chaque émotion." },
      { title: "Baptêmes & anniversaires", text: "Des souvenirs naturels et chaleureux des moments en famille." },
      { title: "Cérémonies", text: "Une présence discrète et professionnelle lors de vos cérémonies officielles et religieuses." },
      { title: "Événements professionnels", text: "Conférences, lancements, séminaires : une image soignée pour votre entreprise." },
    ],
    steps: [
      "Vous décrivez votre événement (date, lieu, prestations souhaitées).",
      "Nous étudions votre demande et vous envoyons un devis détaillé.",
      "Après validation et acompte, votre date est réservée.",
      "Nous couvrons l'événement puis livrons le résultat convenu.",
    ],
    faq: [
      { q: "À quelle date dois-je demander un devis ?", a: "Dès que votre date est fixée : plus vous nous contactez tôt, plus nous pouvons garantir votre disponibilité." },
      { q: "Comment se règle la prestation ?", a: "Un acompte confirme la réservation, le solde est réglé selon les modalités de votre devis, via Wave Marchand." },
      { q: "Quels services sont inclus ?", a: "Cela dépend de votre besoin (photo, vidéo, captation, montage…). Chaque devis détaille précisément les prestations." },
    ],
    gradient: "from-navy via-navy-800 to-orange",
  },
  imprimerie: {
    key: "imprimerie",
    title: "Imprimerie & communication visuelle",
    seoTitle: "Imprimerie & communication visuelle : T-shirts, kakémonos, flyers, cartes de visite",
    seoDescription:
      "T-shirts, polos, goodies, kakémonos, stands PVC, cartes de visite, flyers et affiches : Brain Group imprime vos supports. Devis gratuit en ligne.",
    lead: "Donnez de la visibilité à votre marque ou à votre événement avec des supports imprimés nets, durables et livrés dans les délais.",
    offers: [
      { title: "Textile personnalisé", text: "T-shirts, polos et goodies à vos couleurs, pour vos équipes, événements ou campagnes." },
      { title: "Supports grand format", text: "Kakémonos / roll-up et stands PVC pour vos salons, boutiques et présentations." },
      { title: "Papeterie commerciale", text: "Cartes de visite, plaquettes commerciales et documents à l'image de votre activité." },
      { title: "Flyers & affiches", text: "Des supports percutants pour annoncer vos offres et vos événements." },
    ],
    steps: [
      "Vous précisez le support, la quantité, le format et joignez votre fichier.",
      "Nous vérifions la faisabilité et vous envoyons un devis.",
      "Après validation et acompte, la production démarre.",
      "Nous vous informons dès que votre commande est prête.",
    ],
    faq: [
      { q: "Puis-je envoyer mon propre visuel ?", a: "Oui, joignez votre fichier (PDF, JPG ou PNG) dans le formulaire. Sans fichier, indiquez simplement votre besoin." },
      { q: "Quelles quantités minimales ?", a: "Elles varient selon le support. Indiquez la quantité souhaitée, nous vous répondrons dans le devis." },
      { q: "Quel délai de réalisation ?", a: "Le délai estimatif figure sur chaque devis, selon le support et la quantité." },
    ],
    gradient: "from-orange via-orange-600 to-navy",
  },
  informatique: {
    key: "informatique",
    title: "Matériel informatique",
    seoTitle: "Matériel informatique : ordinateurs, téléphones, accessoires",
    seoDescription:
      "Ordinateurs, téléphones, accessoires et périphériques : demandez la disponibilité ou un devis à Brain Group.",
    lead: "Trouvez le bon équipement pour votre travail, vos études ou votre entreprise. Dites-nous votre besoin, nous vérifions la disponibilité et vous proposons un devis.",
    offers: [
      { title: "Ordinateurs", text: "Portables et ordinateurs de bureau adaptés à votre usage et à votre budget." },
      { title: "Téléphones", text: "Smartphones et tablettes des principales marques, selon disponibilité." },
      { title: "Accessoires", text: "Chargeurs, casques, claviers, souris, sacoches et autres accessoires." },
      { title: "Périphériques", text: "Imprimantes, écrans, stockage et équipements de bureau." },
    ],
    steps: [
      "Vous indiquez le type d'équipement, la marque ou les caractéristiques souhaitées.",
      "Nous vérifions la disponibilité et vous envoyons un devis.",
      "Après validation et paiement, nous préparons votre commande.",
      "Remise ou livraison de votre matériel.",
    ],
    faq: [
      { q: "Les prix sont-ils affichés ?", a: "Les tarifs sont communiqués sur devis, selon la disponibilité et la quantité." },
      { q: "Puis-je demander un modèle précis ?", a: "Oui : indiquez la marque, le modèle ou joignez une fiche technique, nous vérifierons la disponibilité." },
      { q: "Proposez-vous des achats en quantité ?", a: "Oui, pour les entreprises et les institutions, précisez la quantité dans votre demande." },
    ],
    gradient: "from-navy-700 via-navy to-orange",
  },
  digital: {
    key: "digital",
    title: "Solutions digitales & intelligence artificielle",
    seoTitle: "Création de site web, application mobile, e-commerce, automatisation et agents IA",
    seoDescription:
      "Brain Group conçoit vos sites web (vitrine, e-commerce), applications web et mobiles, solutions e-banking, automatisations, digitalisation de procédures et agents IA. Demandez votre devis.",
    lead: "De l'idée à la mise en ligne : nous concevons les sites, applications et automatisations qui font gagner du temps à votre entreprise, et nous vous accompagnons dans l'usage de l'intelligence artificielle.",
    offers: [
      { title: "Sites web", text: "Sites vitrines et boutiques e-commerce modernes, rapides, adaptés au mobile et pensés pour attirer des clients." },
      { title: "Applications web & mobiles", text: "Conception et développement d'applications sur mesure, Android, iOS et web, de la maquette à la publication." },
      { title: "Applications e-banking & fintech", text: "Espaces clients, suivi de comptes et parcours de paiement en ligne, conçus avec une attention particulière à la sécurité." },
      { title: "Automatisation de systèmes", text: "Connexion de vos outils, tâches répétitives automatisées, tableaux de bord et notifications pour réduire les erreurs et le temps perdu." },
      { title: "Digitalisation de procédures", text: "Passage du papier au numérique : formulaires, validations, suivi de dossiers et archivage, pour des processus clairs et traçables." },
      { title: "IA : accompagnement et agents", text: "Prise en main d'outils d'IA pour vos équipes et création d'agents IA (assistants, réponses automatiques, traitement de documents) adaptés à votre métier." },
    ],
    steps: [
      "Vous décrivez votre projet et vos objectifs ; nous cadrons le besoin avec vous.",
      "Nous vous remettons un devis détaillé, avec périmètre, planning et étapes de validation.",
      "Nous concevons les maquettes, puis développons par étapes avec des points de validation réguliers.",
      "Mise en ligne, formation de vos équipes et accompagnement après livraison.",
    ],
    faq: [
      { q: "Pouvez-vous reprendre un site ou un outil existant ?", a: "Oui, indiquez le lien ou joignez la documentation dans le formulaire : nous évaluons l'existant et proposons une amélioration ou une refonte." },
      { q: "Comment est fixé le prix d'un projet digital ?", a: "Après cadrage de votre besoin : le devis détaille les fonctionnalités, le planning et les modalités de paiement par étapes." },
      { q: "Les données de mon entreprise sont-elles protégées ?", a: "La sécurité est intégrée dès la conception (accès contrôlés, données protégées). Les exigences précises sont définies avec vous, surtout pour les applications financières." },
      { q: "Faut-il des connaissances techniques ?", a: "Non. Nous traduisons votre besoin métier en solution et formons vos équipes à l'utiliser." },
    ],
    gradient: "from-navy via-navy-700 to-orange",
  },
  communication: {
    key: "communication",
    title: "Communication & visibilité",
    seoTitle: "Communication digitale, réseaux sociaux, clip vidéo et visibilité en ligne",
    seoDescription:
      "Brain Group accompagne entreprises et personnalités pour être vus sur les réseaux sociaux et sur Internet : gestion de réseaux, clips vidéo, publicité en ligne et image de marque.",
    lead: "Entreprise, artiste, personnalité ou association : soyez vu et reconnu sur les réseaux sociaux et sur Internet grâce à notre équipe d'experts du digital.",
    offers: [
      { title: "Gestion des réseaux sociaux", text: "Création et animation de vos pages, calendrier de publications, contenus réguliers et suivi de votre audience." },
      { title: "Clips et vidéos", text: "Réalisation de clips vidéo, spots publicitaires, vidéos de présentation et contenus courts pour les réseaux." },
      { title: "Visibilité en ligne", text: "Campagnes de publicité en ligne et optimisation de votre présence pour toucher les bonnes personnes." },
      { title: "Création de contenus", text: "Visuels, photos et affiches soignés, cohérents avec votre univers et adaptés à chaque réseau." },
      { title: "Image de marque", text: "Identité visuelle, charte graphique et positionnement pour une image professionnelle et reconnaissable." },
      { title: "Pour entreprises et personnalités", text: "Un accompagnement adapté à votre profil : commerce, artiste, influenceur, institution ou association." },
    ],
    steps: [
      "Vous nous parlez de votre activité, de votre objectif et des réseaux visés.",
      "Nous vous proposons une stratégie et un devis détaillé.",
      "Notre équipe produit les contenus et les vidéos, avec vos validations.",
      "Publication, suivi des résultats et ajustements pour renforcer votre visibilité.",
    ],
    faq: [
      { q: "Réalisez-vous des clips vidéo complets ?", a: "Oui : de la préparation au tournage et au montage. Précisez la durée, le style et la date souhaités dans le formulaire." },
      { q: "Pouvez-vous gérer mes réseaux sociaux à ma place ?", a: "Oui. Nous créons les contenus, les publions et suivons les résultats, selon la fréquence convenue dans le devis." },
      { q: "Je suis un particulier ou un artiste, est-ce pour moi ?", a: "Oui, nous accompagnons aussi les personnalités, artistes et créateurs de contenus qui veulent gagner en visibilité." },
      { q: "Comment est fixé le prix ?", a: "Après échange sur votre objectif : le devis détaille les contenus, la durée de l'accompagnement et les modalités de paiement." },
    ],
    gradient: "from-navy-800 via-navy to-orange",
  },
};

/**
 * Réalisations affichées par défaut : elles sont copiées dans la base lors du premier affichage,
 * puis gérées depuis l'administration (Réalisations : ajout, masquage, mise en avant, suppression).
 */
export const DEFAULT_REALISATIONS = [
  { id: "7b1f0a10-0000-4000-8000-000000000001", service: "imprimerie", title: "Logo — Skiny & Seduction by Flora", caption: "Création d'identité visuelle.", image: "/realisations/skiny-seduction.webp", fit: "contain", featured: true, visible: true, link: "" },
  { id: "7b1f0a10-0000-4000-8000-000000000002", service: "imprimerie", title: "Logo — BATCI, Services et Bâtiment de Côte d'Ivoire", caption: "Création d'identité visuelle.", image: "/realisations/batci.jpg", fit: "contain", featured: true, visible: true, link: "" },
  { id: "7b1f0a10-0000-4000-8000-000000000003", service: "imprimerie", title: "Logo — Dreamland Africa Business Center", caption: "Création d'identité visuelle, déclinée en versions claire et sombre.", image: "/realisations/dreamland-africa.png", fit: "contain", featured: true, visible: true, link: "" },
] as const;

export const ADVANTAGES = [
  { icon: "users", title: "Un interlocuteur unique", text: "Événement, impression et équipement : un seul partenaire pour vos besoins." },
  { icon: "bolt", title: "Devis rapide et clair", text: "Un formulaire guidé, une référence de suivi et une réponse structurée." },
  { icon: "shield", title: "Suivi transparent", text: "Acompte, solde et état de votre commande suivis du début à la fin." },
  { icon: "star", title: "Qualité et soin", text: "Un souci du détail dans chaque prestation, du devis à la livraison." },
];
