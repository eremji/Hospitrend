import type { Metadata } from "next";
import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = { title: "Mes favoris · Hospitrend" };

export default function SavedPage() {
  return <SavedList />;
}
