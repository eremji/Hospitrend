import type { Language } from "@/lib/sources";

/** An article as read by the app (row of `articles` + source name). */
export interface Article {
  id: string;
  source_id: string;
  source_name: string;
  url: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  language: Language;
  published_at: string;
  main_theme: string;
  secondary_themes: string[];
  tags: string[];
  summary_status: "pending" | "done" | "ignored";
  summary_short: string | null;
  summary_points: string[] | null;
  hotel_impact: string | null;
}

export type Decision = "like" | "dislike";
