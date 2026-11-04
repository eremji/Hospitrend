import { describe, expect, it } from "vitest";
import { THEMES } from "@/lib/taxonomy";
import { classifyByKeywords } from "./classify";

describe("classifyByKeywords", () => {
  it("picks the most specific theme over the generic hotel words", () => {
    const c = classifyByKeywords(
      "Booking.com relève ses commissions pour les hôtels",
      "Les hôteliers dénoncent la hausse et misent sur la réservation directe.",
      "hospitality",
    );
    expect(c.mainTheme).toBe("distribution");
  });

  it("understands English and Spanish keywords", () => {
    expect(classifyByKeywords("Sleep tourism is booming in wellness retreats", "", "tourism").mainTheme).toBe("wellness");
    expect(classifyByKeywords("La tasa turística sube en Barcelona", "", "tourism").mainTheme).toBe("regulation");
  });

  it("does not match keywords inside other words", () => {
    // "ota" must not match "total", "bar" must not match "barrière"
    const c = classifyByKeywords("Le total des barrières", "", "transport");
    expect(c.mainTheme).toBe("transport");
    expect(c.secondaryThemes).toEqual([]);
  });

  it("falls back to the source theme when nothing matches", () => {
    expect(classifyByKeywords("Nomination", "Une nouvelle directrice.", "mice")).toEqual({
      mainTheme: "mice",
      secondaryThemes: [],
    });
  });

  it("returns at most two secondary themes, all from the taxonomy", () => {
    const c = classifyByKeywords(
      "Spa, séminaire, Airbnb, taxe de séjour et TGV : l'hôtel de demain",
      "Wellness, MICE, OTA, réglementation, train, intelligence artificielle.",
      "hospitality",
    );
    const slugs = THEMES.map((t) => t.slug);
    expect(c.secondaryThemes.length).toBeLessThanOrEqual(2);
    expect([c.mainTheme, ...c.secondaryThemes].every((s) => slugs.includes(s))).toBe(true);
  });
});
