export class AnalyzedLocation {
  original_text: string;
  lemma: string;
  formatted_address: string;
  lat: number;
  lon: number;
}

export class AnalyzedNews {
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
