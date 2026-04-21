export interface AnalyzedLocation {
  original_text: string;
  lemma: string;
  formatted_address: string;
  lat: number;
  lon: number;
}

export interface AnalyzedNews {
  title: string;
  description: string;
  link: string;
  image_url: string | null;
  published_at: string;
  source_id: string;
  category: string;
  sentiment_score: number;
  locations: AnalyzedLocation[];
}
