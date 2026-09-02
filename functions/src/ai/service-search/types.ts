export interface SearchToken {
  value: string;

  normalized: string;
}

export interface SearchableService {
  id: string;

  name: string;

  categoryId: string;

  categoryName: string;

  subcategoryId?: string;

  subcategoryName?: string;

  description?: string;

  keywords?: string[];

  active: boolean;
}

export interface TokenizedService {
  service: SearchableService;

  tokens: string[];
}

export interface ServiceMatch {
  service: SearchableService;

  score: number;

  matchedTokens: string[];
}

export interface SearchOptions {
  minimumScore: number;

  limit: number;
}

export interface SearchFilters {
  categoryId?: string;

  subcategoryId?: string;
}

export interface ServiceSearchRequest {
  query: string;

  language?: string;

  categoryId?: string;

  subcategoryId?: string;

  limit?: number;
}

export interface ServiceSearchResponse {
  query: string;

  normalizedQuery: string;

  matches: ServiceMatch[];
}

export interface AbbreviationDictionary {
  [key: string]: string;
}