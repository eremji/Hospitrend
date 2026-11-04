/**
 * Topic taxonomy. Source of truth: docs/sujets.md.
 * Slugs are in English (code), labels in French (UI).
 * Keywords (FR / EN / ES) drive the fallback keyword classification
 * used when no LLM summary is available (SPEC US-20 CA6).
 */

export type ThemeColor = "blue" | "orange" | "green" | "violet" | "slate";

export interface Theme {
  slug: string;
  label: string;
  color: ThemeColor;
  core: boolean;
  keywords: string[];
}

export const THEMES: Theme[] = [
  {
    slug: "hospitality",
    label: "Hôtellerie",
    color: "blue",
    core: true,
    keywords: [
      "hôtel", "hotel", "hôtelier", "hôtelière", "hotelier", "hotelero", "hotelera",
      "groupe hôtelier", "hotel group", "cadena hotelera", "franchise", "franquicia",
      "ouverture", "opening", "apertura", "rénovation", "acquisition", "rachat", "cession",
      "hotel deal", "compraventa", "revpar", "adr", "taux d'occupation", "occupancy",
      "ocupación", "palace", "luxury hotel", "hotel de lujo", "boutique hotel",
      "hôtel boutique", "aparthotel", "coliving", "resort", "accor", "marriott",
      "hilton", "hyatt", "ihg", "meliá", "melia", "barceló", "nh hotels", "b&b hotels",
      "louvre hotels", "radisson", "wyndham",
    ],
  },
  {
    slug: "tourism",
    label: "Tourisme",
    color: "orange",
    core: true,
    keywords: [
      "tourisme", "tourism", "turismo", "touriste", "tourist", "turista",
      "fréquentation touristique", "tourist arrivals", "llegadas de turistas",
      "destination", "destino", "surtourisme", "overtourism", "saison", "season",
      "temporada", "voyageurs", "travelers", "travellers", "viajeros", "vacances",
      "vacation", "holiday", "vacaciones", "tour-opérateur", "tour operator",
      "touroperador", "croisière", "cruise", "crucero", "festival", "jeux olympiques",
      "slow travel", "bleisure",
    ],
  },
  {
    slug: "mice",
    label: "Tourisme d'affaires et MICE",
    color: "orange",
    core: true,
    keywords: [
      "mice", "séminaire", "seminaire", "seminar", "congrès", "congress", "congreso",
      "convention", "salon professionnel", "trade show", "feria", "meetings",
      "événementiel", "events industry", "incentive", "viajes de incentivo",
      "voyage d'affaires", "business travel", "viajes de negocios", "corporate travel",
      "tmc", "travel manager",
    ],
  },
  {
    slug: "wellness",
    label: "Bien-être",
    color: "green",
    core: true,
    keywords: [
      "bien-être", "wellness", "bienestar", "spa", "thermalisme", "thermal", "termalismo",
      "thalasso", "retraite", "retreat", "retiro", "détox", "detox", "longévité",
      "longevity", "longevidad", "sommeil", "sleep", "sueño", "yoga", "méditation",
      "meditation", "nutrition", "soins", "cosmétique",
    ],
  },
  {
    slug: "distribution",
    label: "Distribution et revenue",
    color: "blue",
    core: false,
    keywords: [
      "ota", "booking.com", "booking holdings", "expedia", "airbnb", "trip.com",
      "commission", "réservation directe", "direct booking", "venta directa",
      "moteur de réservation", "booking engine", "revenue management", "yield",
      "tarification", "pricing", "gestión de ingresos", "channel manager", "rms",
      "distribution", "distribución", "parité tarifaire", "rate parity", "partenariat",
      "partnership", "alianza", "b2b",
    ],
  },
  {
    slug: "hotel-tech",
    label: "Tech hôtelière",
    color: "violet",
    core: false,
    keywords: [
      "intelligence artificielle", "artificial intelligence", "inteligencia artificial",
      " ia ", " ai ", "genai", "chatbot", "agent ia", "ai agent", "automatisation",
      "automation", "pms", "crm", "check-in digital", "mobile check-in", "check-in móvil",
      "clé digitale", "digital key", "chambre connectée", "smart room", "startup",
      "start-up", "traveltech", "levée de fonds", "funding", "financiación", "saas",
      "software", "logiciel", "tecnología", "technologie", "technology",
    ],
  },
  {
    slug: "guest-experience",
    label: "Expérience client et marketing",
    color: "violet",
    core: false,
    keywords: [
      "expérience client", "guest experience", "experiencia del cliente", "avis clients",
      "online reviews", "reseñas", "tripadvisor", "réputation", "reputation",
      "fidélité", "loyalty", "fidelización", "programme de fidélité", "marketing",
      "réseaux sociaux", "social media", "redes sociales", "influence", "influencer",
      "personnalisation", "personalization", "personalización",
    ],
  },
  {
    slug: "food-beverage",
    label: "Restauration et F&B",
    color: "orange",
    core: false,
    keywords: [
      "restaurant", "restauración", "restauration", "f&b", "food and beverage",
      "gastronomie", "gastronomy", "gastronomía", "chef", "bar", "rooftop", "cuisine",
      "culinary", "culinaria", "michelin", "petit-déjeuner", "breakfast", "desayuno",
    ],
  },
  {
    slug: "sustainability",
    label: "RSE et durabilité",
    color: "green",
    core: false,
    keywords: [
      "rse", "esg", "durable", "durabilité", "sustainability", "sustainable",
      "sostenible", "sostenibilidad", "clef verte", "green key", "écolabel", "ecolabel",
      "carbone", "carbon", "carbono", "énergie", "energy", "energía", "sobriété",
      "tourisme responsable", "responsible travel", "turismo responsable", "décarbonation",
    ],
  },
  {
    slug: "hr",
    label: "Ressources humaines",
    color: "slate",
    core: false,
    keywords: [
      "recrutement", "recruitment", "recruiting", "contratación", "pénurie de personnel",
      "staff shortage", "falta de personal", "salariés", "employees", "empleados",
      "formation", "training", "formación", "salaire", "wages", "salario", "talent",
      "ressources humaines", "human resources", "recursos humanos",
    ],
  },
  {
    slug: "regulation",
    label: "Réglementation",
    color: "slate",
    core: false,
    keywords: [
      "taxe de séjour", "tourist tax", "tasa turística", "tva", "vat", "iva",
      "meublés de tourisme", "meublé de tourisme", "short-term rental", "alquiler vacacional",
      "vivienda turística", "loi", "law", "ley", "décret", "decree", "decreto",
      "réglementation", "regulation", "regulación", "normes", "classement", "gouvernement",
      "government", "gobierno",
    ],
  },
  {
    slug: "transport",
    label: "Transport",
    color: "blue",
    core: false,
    keywords: [
      "aérien", "airline", "aerolínea", "compagnie aérienne", "aéroport", "airport",
      "aeropuerto", "nouvelle ligne", "new route", "nueva ruta", "vol ", "flight",
      "vuelo", "ferroviaire", "rail", "train", "tren", "sncf", "renfe", "eurostar",
      "ouigo", "mobilité", "mobility", "movilidad", "air france", "ryanair", "easyjet",
      "iberia", "lufthansa",
    ],
  },
  {
    slug: "design",
    label: "Design et architecture",
    color: "violet",
    core: false,
    keywords: [
      "design", "diseño", "architecture", "arquitectura", "architecte", "architect",
      "arquitecto", "décoration", "interior", "intérieur", "interiorismo", "rénovation",
      "renovation", "renovación", "aménagement",
    ],
  },
];

export const THEME_BY_SLUG: Record<string, Theme> = Object.fromEntries(
  THEMES.map((t) => [t.slug, t]),
);

export function themeLabel(slug: string | null | undefined): string {
  if (!slug) return "Actualité";
  return THEME_BY_SLUG[slug]?.label ?? "Actualité";
}

export function themeColor(slug: string | null | undefined): ThemeColor {
  if (!slug) return "slate";
  return THEME_BY_SLUG[slug]?.color ?? "slate";
}
