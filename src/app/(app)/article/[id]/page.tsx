import { SavedArticleView } from "@/components/SavedArticleView";

export default async function ArticlePage({ params }: PageProps<"/article/[id]">) {
  const { id } = await params;
  return <SavedArticleView id={id} />;
}
