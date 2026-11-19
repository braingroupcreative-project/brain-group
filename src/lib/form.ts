import type { ServiceKey } from "./site";

/** Définition unique des champs conditionnels, utilisée par le formulaire (client) ET la validation (serveur). */
export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "multi";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export const SERVICE_FIELDS: Record<ServiceKey, Field[]> = {
  evenementiel: [
    {
      name: "type_evenement",
      label: "Type d'événement",
      type: "select",
      required: true,
      options: ["Mariage", "Baptême", "Anniversaire", "Dot", "Cérémonie", "Événement professionnel", "Autre"],
    },
    { name: "date_evenement", label: "Date de l'événement", type: "date", required: true },
    { name: "horaires", label: "Horaires", type: "text", placeholder: "Ex. 10h – 18h" },
    { name: "lieu", label: "Lieu / commune", type: "text", required: true, placeholder: "Ex. Cocody, Abidjan" },
    { name: "duree", label: "Durée prévue", type: "text", placeholder: "Ex. 1 journée, 4 heures" },
    { name: "participants", label: "Nombre approximatif de participants", type: "number", placeholder: "Ex. 150" },
    {
      name: "prestations",
      label: "Prestations souhaitées",
      type: "multi",
      options: ["Photographie", "Vidéo", "Captation / live", "Montage", "Drone", "Autre"],
    },
    { name: "contraintes", label: "Contraintes et informations utiles", type: "textarea" },
  ],
  imprimerie: [
    {
      name: "type_support",
      label: "Type de support",
      type: "select",
      required: true,
      options: [
        "T-shirts",
        "Polos",
        "Goodies",
        "Kakémono / roll-up",
        "Stand PVC",
        "Cartes de visite",
        "Plaquettes commerciales",
        "Flyers",
        "Affiches",
        "Autre",
      ],
    },
    { name: "quantite", label: "Quantité", type: "number", required: true, placeholder: "Ex. 100" },
    { name: "format", label: "Format / dimensions", type: "text", placeholder: "Ex. A5, 85 x 200 cm" },
    { name: "matiere", label: "Matière ou grammage (si connu)", type: "text", placeholder: "Ex. couché mat 300 g" },
    { name: "couleurs", label: "Couleurs", type: "text", placeholder: "Ex. quadri recto-verso" },
    { name: "finition", label: "Finition", type: "text", placeholder: "Ex. pelliculage, découpe" },
    { name: "date_souhaitee", label: "Date souhaitée", type: "date" },
  ],
  informatique: [
    {
      name: "type_equipement",
      label: "Type d'équipement",
      type: "select",
      required: true,
      options: ["Ordinateur portable", "Ordinateur de bureau", "Téléphone", "Tablette", "Accessoire", "Périphérique", "Autre"],
    },
    { name: "marque", label: "Marque ou modèle souhaité", type: "text" },
    { name: "caracteristiques", label: "Caractéristiques", type: "textarea", placeholder: "RAM, stockage, écran…" },
    { name: "quantite", label: "Quantité", type: "number", required: true, placeholder: "Ex. 2" },
    { name: "usage", label: "Usage prévu", type: "text", placeholder: "Bureautique, graphisme, jeu…" },
    { name: "budget", label: "Budget indicatif (facultatif)", type: "text", placeholder: "Ex. 400 000 FCFA" },
  ],
};

export const SERVICE_ATTACH_HINT: Record<ServiceKey, string> = {
  evenementiel: "Programme, plan du lieu… (facultatif)",
  imprimerie: "Fichier de conception si disponible (PDF, JPG, PNG)",
  informatique: "Photo ou fiche technique du produit (facultatif)",
};

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SERVICE_FIELDS)
    .flat()
    .map((f) => [f.name, f.label])
);
