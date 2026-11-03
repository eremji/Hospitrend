# Taxonomie des sujets — Hospitrend

Cette taxonomie sert à classer chaque article (par le LLM, à l'ingestion) et à construire le profil d'intérêts.
Deux niveaux : **thème** (choisi à l'onboarding, US-02) puis **sous-thèmes**. Les mots-clés FR / EN / ES aident à la classification et aux requêtes Google News.

L'identifiant (`slug`) est en anglais, comme le code. Le libellé affiché est en français.

---

## 1. Hôtellerie — `hospitality`
- **Groupes et marques** (`brands`) : stratégie des groupes, lancements de marques, franchise, management. *groupe hôtelier, franchise / hotel group, brand launch / cadena hotelera, marca*
- **Ouvertures et rénovations** (`openings`) : nouveaux hôtels, repositionnements. *ouverture d'hôtel / hotel opening / apertura hotel*
- **Investissement et transactions** (`investment`) : rachats, fusions, cessions, fonds. *acquisition, cession / hotel deal, M&A / compraventa hotel*
- **Performance** (`performance`) : TO, ADR, RevPAR, baromètres. *taux d'occupation / occupancy, RevPAR / ocupación hotelera*
- **Nouveaux concepts** (`concepts`) : lifestyle, hybride, coliving, aparthotel, hôtel boutique. *concept hôtelier / hybrid hotel / nuevo concepto*
- **Luxe** (`luxury`) : palaces, haut de gamme, conciergerie. *palace / luxury hotel / hotel de lujo*

## 2. Tourisme — `tourism`
- **Flux et fréquentation** (`flows`) : chiffres, clientèles étrangères, prévisions. *fréquentation touristique / tourist arrivals / llegadas de turistas*
- **Destinations** (`destinations`) : attractivité, promotion, surtourisme. *destination / overtourism / destino turístico*
- **Grands événements** (`events`) : salons, festivals, compétitions sportives qui génèrent des nuitées. *salon, JO / trade show / feria*
- **Comportements voyageurs** (`traveler-trends`) : bleisure, slow travel, génération Z, voyage solo. *tendances voyage / travel trends / tendencias viajeros*

## 3. Tourisme d'affaires et MICE — `mice`
- **Séminaires et congrès** (`meetings`) : appels d'offres, lieux, formats. *séminaire / meetings and events / congresos*
- **Voyage d'affaires** (`business-travel`) : politiques voyage, agences, TMC. *voyage d'affaires / business travel / viajes de negocios*
- **Incentive et événementiel** (`incentive`). *incentive / incentive travel / viajes de incentivo*

## 4. Bien-être — `wellness`
- **Spa et soins** (`spa`) : nouveaux soins, marques cosmétiques, spas d'hôtel. *spa / spa / spa*
- **Thermalisme** (`thermal`). *thermalisme / thermal / termalismo*
- **Tourisme de bien-être** (`wellness-travel`) : retraites, détox, longévité. *retraite bien-être / wellness retreat / turismo de bienestar*
- **Sommeil, nutrition, sport** (`healthy-living`). *sommeil / sleep tourism / turismo del sueño*

## 5. Distribution et revenue management — `distribution`
- **OTA et plateformes** (`ota`) : Booking, Expedia, Airbnb, commissions, litiges. *OTA, Booking / online travel agency / OTA*
- **Vente directe** (`direct-booking`) : site, moteur de réservation, désintermédiation. *réservation directe / direct booking / venta directa*
- **Revenue management et pricing** (`revenue`) : tarification dynamique, outils RMS. *yield, tarification / revenue management / gestión de ingresos*
- **Ventes B2B et partenariats** (`b2b`) : contrats corporate, tour-opérateurs, partenariats. *partenariat / partnership / alianza*

## 6. Tech hôtelière — `hotel-tech`
- **IA et automatisation** (`ai`) : IA générative, chatbots, agents de réservation. *IA hôtellerie / AI in hospitality / IA hotelera*
- **Systèmes** (`systems`) : PMS, CRM, channel manager, paiement. *PMS, CRM*
- **Expérience digitale** (`guest-tech`) : check-in mobile, clé digitale, chambre connectée. *check-in digital / mobile check-in / check-in móvil*
- **Startups et levées de fonds** (`startups`). *startup / traveltech / startup turística*

## 7. Expérience client et marketing — `guest-experience`
- **Avis et réputation** (`reputation`). *avis clients / online reviews / reseñas*
- **Fidélité** (`loyalty`). *programme de fidélité / loyalty program / fidelización*
- **Marketing et réseaux sociaux** (`marketing`) : influence, contenus, campagnes. *marketing hôtelier / hotel marketing / marketing hotelero*
- **Personnalisation et service** (`service`).

## 8. Restauration et F&B — `food-beverage`
- **Restauration d'hôtel** (`hotel-restaurants`), **bars et rooftops** (`bars`), **tendances culinaires** (`food-trends`).

## 9. RSE et durabilité — `sustainability`
- **Labels et certifications** (`labels`) : Clef Verte / Green Key, Ecolabel. *écolabel / eco-certification / certificación sostenible*
- **Énergie et sobriété** (`energy`), **tourisme responsable** (`responsible-travel`), **réglementation environnementale** (`green-regulation`).

## 10. Ressources humaines — `hr`
- **Recrutement et pénurie** (`recruitment`), **formation** (`training`), **conditions de travail** (`work-conditions`).

## 11. Réglementation et politique publique — `regulation`
- **Fiscalité** (`tax`) : taxe de séjour, TVA. **Meublés de tourisme** (`short-term-rental`). **Normes et classement** (`standards`). *taxe de séjour / tourist tax / tasa turística*

## 12. Transport — `transport`
- **Aérien** (`air`), **ferroviaire** (`rail`), **mobilité locale** (`mobility`). *nouvelle ligne / new route / nueva ruta*

## 13. Design et architecture — `design`
- **Design intérieur** (`interior`), **architecture hôtelière** (`architecture`), **rénovation** (`renovation`).

---

## Règles d'usage

- Un article reçoit **1 thème principal + 0 à 2 thèmes secondaires**, et des **tags libres** (entreprises, lieux, personnes, concepts).
- Les thèmes 1 à 4 sont proposés par défaut à l'onboarding (domaines cœur). Les autres sont visibles et activables.
- Toute modification de cette taxonomie doit être reportée dans le prompt de classification et dans le CLAUDE.md.
