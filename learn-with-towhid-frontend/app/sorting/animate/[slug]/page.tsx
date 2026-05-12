// app/sorting/animate/[slug]/page.tsx
import VisualizerClient from "./VisualizerClient";

// Define which paths should be pre-rendered during build
export async function generateStaticParams() {
  const slugs = ["bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort"];
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Ensure only the slugs above are valid
export const dynamicParams = false;

export default function AlgorithmVisualizerPage({ params }: { params: Promise<{ slug: string }> }) {
  // We simply pass the params promise down to the client component
  return <VisualizerClient params={params} />;
}