/**
 * Initial list of the 33 sources (docs/sources.md), used to seed the
 * `sources` table on first ingestion (SPEC US-22 CA6).
 *
 * `feedUrl` is our best guess of the RSS/Atom feed. When it is missing or
 * unreadable, ingestion tries feed auto-discovery on the site's home page,
 * then falls back to Google News RSS restricted to the site's domain.
 * A feed found by auto-discovery is saved back on the source.
 */

export type Language = "fr" | "en" | "es";

export interface SourceSeed {
  slug: string;
  name: string;
  siteUrl: string;
  feedUrl: string | null;
  language: Language;
  /** 1 (low) to 3 (high). Used to pick the card shown for duplicate stories. */
  reliability: 1 | 2 | 3;
  priority: 1 | 2;
  /** Theme used when keyword classification finds nothing. */
  defaultTheme: string;
  /** Google News query used as last resort. Defaults to `site:<domain>`. */
  googleNewsQuery?: string;
}

export const SOURCE_SEEDS: SourceSeed[] = [
  // Français
  { slug: "hospitality-on", name: "Hospitality ON", siteUrl: "https://hospitality-on.com", feedUrl: null, language: "fr", reliability: 3, priority: 1, defaultTheme: "hospitality" },
  { slug: "lhotellerie-restauration", name: "L'Hôtellerie Restauration", siteUrl: "https://www.lhotellerie-restauration.fr", feedUrl: null, language: "fr", reliability: 3, priority: 1, defaultTheme: "hospitality" },
  { slug: "echo-touristique", name: "L'Écho touristique", siteUrl: "https://www.lechotouristique.com", feedUrl: "https://www.lechotouristique.com/feed", language: "fr", reliability: 3, priority: 1, defaultTheme: "tourism" },
  { slug: "tourmag", name: "TourMaG", siteUrl: "https://www.tourmag.com", feedUrl: "https://www.tourmag.com/xml/syndication.rss", language: "fr", reliability: 3, priority: 1, defaultTheme: "tourism" },
  { slug: "deplacements-pros", name: "Déplacements Pros", siteUrl: "https://www.deplacementspros.com", feedUrl: null, language: "fr", reliability: 3, priority: 1, defaultTheme: "mice" },
  { slug: "voyages-d-affaires", name: "Voyages d'Affaires", siteUrl: "https://www.voyages-d-affaires.com", feedUrl: "https://www.voyages-d-affaires.com/feed/", language: "fr", reliability: 2, priority: 2, defaultTheme: "mice" },
  { slug: "journal-des-palaces", name: "Journal des Palaces", siteUrl: "https://www.journaldespalaces.com", feedUrl: null, language: "fr", reliability: 2, priority: 2, defaultTheme: "hospitality" },
  { slug: "tendance-hotellerie", name: "Tendance Hôtellerie", siteUrl: "https://www.tendancehotellerie.fr", feedUrl: null, language: "fr", reliability: 2, priority: 2, defaultTheme: "hospitality" },
  { slug: "air-journal", name: "Air Journal", siteUrl: "https://www.air-journal.fr", feedUrl: "https://www.air-journal.fr/feed", language: "fr", reliability: 2, priority: 2, defaultTheme: "transport" },
  { slug: "nouvelles-esthetiques", name: "Les Nouvelles Esthétiques Spa", siteUrl: "https://www.nouvellesesthetiques.com", feedUrl: null, language: "fr", reliability: 2, priority: 2, defaultTheme: "wellness" },
  { slug: "atout-france", name: "Atout France", siteUrl: "https://www.atout-france.fr", feedUrl: null, language: "fr", reliability: 3, priority: 1, defaultTheme: "tourism" },
  { slug: "insee-tourisme", name: "Insee (tourisme)", siteUrl: "https://www.insee.fr", feedUrl: null, language: "fr", reliability: 3, priority: 2, defaultTheme: "tourism", googleNewsQuery: "site:insee.fr (tourisme OR hôtellerie OR fréquentation)" },
  { slug: "les-echos-tourisme", name: "Les Echos (tourisme)", siteUrl: "https://www.lesechos.fr", feedUrl: null, language: "fr", reliability: 3, priority: 2, defaultTheme: "hospitality", googleNewsQuery: "site:lesechos.fr (hôtellerie OR hôtel OR tourisme)" },

  // Anglais
  { slug: "skift", name: "Skift", siteUrl: "https://skift.com", feedUrl: "https://skift.com/feed/", language: "en", reliability: 3, priority: 1, defaultTheme: "tourism" },
  { slug: "hospitality-net", name: "Hospitality Net", siteUrl: "https://www.hospitalitynet.org", feedUrl: "https://www.hospitalitynet.org/news/global.xml", language: "en", reliability: 2, priority: 1, defaultTheme: "hospitality" },
  { slug: "hotel-dive", name: "Hotel Dive", siteUrl: "https://www.hoteldive.com", feedUrl: "https://www.hoteldive.com/feeds/news/", language: "en", reliability: 3, priority: 1, defaultTheme: "hospitality" },
  { slug: "phocuswire", name: "PhocusWire", siteUrl: "https://www.phocuswire.com", feedUrl: null, language: "en", reliability: 3, priority: 1, defaultTheme: "hotel-tech" },
  { slug: "hotel-management", name: "Hotel Management", siteUrl: "https://www.hotelmanagement.net", feedUrl: "https://www.hotelmanagement.net/rss.xml", language: "en", reliability: 2, priority: 2, defaultTheme: "hospitality" },
  { slug: "costar-hospitality", name: "CoStar Hospitality", siteUrl: "https://www.costar.com", feedUrl: null, language: "en", reliability: 3, priority: 2, defaultTheme: "hospitality", googleNewsQuery: "site:costar.com hotel" },
  { slug: "hospitality-tech", name: "Hospitality Tech", siteUrl: "https://hospitalitytech.com", feedUrl: "https://hospitalitytech.com/rss.xml", language: "en", reliability: 2, priority: 2, defaultTheme: "hotel-tech" },
  { slug: "ehl-insights", name: "EHL Hospitality Insights", siteUrl: "https://hospitalityinsights.ehl.edu", feedUrl: "https://hospitalityinsights.ehl.edu/rss.xml", language: "en", reliability: 3, priority: 1, defaultTheme: "hospitality" },
  { slug: "boutique-hotel-news", name: "Boutique Hotel News", siteUrl: "https://www.boutiquehotelnews.com", feedUrl: null, language: "en", reliability: 2, priority: 2, defaultTheme: "hospitality" },
  { slug: "hotel-designs", name: "Hotel Designs", siteUrl: "https://www.hoteldesigns.net", feedUrl: "https://www.hoteldesigns.net/feed/", language: "en", reliability: 2, priority: 2, defaultTheme: "design" },
  { slug: "global-wellness-institute", name: "Global Wellness Institute", siteUrl: "https://globalwellnessinstitute.org", feedUrl: "https://globalwellnessinstitute.org/feed/", language: "en", reliability: 3, priority: 1, defaultTheme: "wellness" },
  { slug: "spa-business", name: "Spa Business", siteUrl: "https://www.spabusiness.com", feedUrl: null, language: "en", reliability: 2, priority: 2, defaultTheme: "wellness" },
  { slug: "un-tourism", name: "UN Tourism", siteUrl: "https://www.unwto.org", feedUrl: null, language: "en", reliability: 3, priority: 2, defaultTheme: "tourism" },
  { slug: "wttc", name: "WTTC", siteUrl: "https://wttc.org", feedUrl: null, language: "en", reliability: 3, priority: 2, defaultTheme: "tourism" },

  // Espagnol
  { slug: "hosteltur", name: "Hosteltur", siteUrl: "https://www.hosteltur.com", feedUrl: null, language: "es", reliability: 3, priority: 1, defaultTheme: "tourism" },
  { slug: "tecnohotel", name: "Tecnohotel", siteUrl: "https://tecnohotelnews.com", feedUrl: "https://tecnohotelnews.com/feed/", language: "es", reliability: 2, priority: 1, defaultTheme: "hotel-tech" },
  { slug: "preferente", name: "Preferente", siteUrl: "https://www.preferente.com", feedUrl: null, language: "es", reliability: 2, priority: 2, defaultTheme: "tourism" },
  { slug: "nexotur", name: "Nexotur", siteUrl: "https://www.nexotur.com", feedUrl: null, language: "es", reliability: 2, priority: 2, defaultTheme: "distribution" },
  { slug: "smart-travel-news", name: "Smart Travel News", siteUrl: "https://www.smarttravel.news", feedUrl: "https://www.smarttravel.news/feed/", language: "es", reliability: 2, priority: 2, defaultTheme: "mice" },
  { slug: "exceltur", name: "Exceltur", siteUrl: "https://www.exceltur.org", feedUrl: null, language: "es", reliability: 3, priority: 2, defaultTheme: "tourism" },
];
