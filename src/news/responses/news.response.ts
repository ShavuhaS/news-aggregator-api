export class NewsCategoryResponse {
  id: string;
  name: string;
}

export class LocationResponse {
  id: string;
  lemma: string;
  address: string;
  originalText: string;
  lat: number;
  lon: number;
}

export class NewsResponse {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  sentimentScore: number | null;
  sourceId: string;
  categoryId: string;
  category?: NewsCategoryResponse;
  locations?: LocationResponse[];
  createdAt: Date;
  updatedAt: Date;
}
