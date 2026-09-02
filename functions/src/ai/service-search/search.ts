import {
  getActiveServices,
  getServicesByCategory,
  getServicesBySubcategory,
} from "./firestore";

import { calculateScore } from "./scorer";
import { tokenize } from "./tokenizer";

import {
  SearchFilters,
  SearchOptions,
  SearchableService,
  ServiceMatch,
} from "./types";

const DEFAULT_OPTIONS: SearchOptions = {
  minimumScore: 0.25,
  limit: 20,
};

function buildServiceTokens(
  service: SearchableService,
): string[] {
  const tokens = new Set<string>();

  const addText = (
    value?: string,
  ): void => {
    if (!value) {
      return;
    }

    tokenize(value).forEach(
      (token) =>
        tokens.add(
          token.normalized,
        ),
    );
  };

  addText(service.name);

  addText(
    service.categoryName,
  );

  addText(
    service.subcategoryName,
  );

  addText(
    service.description,
  );

  for (const keyword of service.keywords ??
    []) {
    addText(keyword);
  }

  return [...tokens];
}

async function loadServices(
  filters: SearchFilters,
): Promise<
  SearchableService[]
> {
  if (
    filters.subcategoryId
  ) {
    return getServicesBySubcategory(
      filters.subcategoryId,
    );
  }

  if (
    filters.categoryId
  ) {
    return getServicesByCategory(
      filters.categoryId,
    );
  }

  return getActiveServices();
}

export async function searchServices(
  query: string,
  filters: SearchFilters = {},
  options: Partial<SearchOptions> = {},
): Promise<
  ServiceMatch[]
> {
  const config: SearchOptions =
    {
      ...DEFAULT_OPTIONS,
      ...options,
    };

  const queryTokens =
    tokenize(query).map(
      (token) =>
        token.normalized,
    );

  if (
    queryTokens.length === 0
  ) {
    return [];
  }

  const services =
    await loadServices(
      filters,
    );

  const results: ServiceMatch[] =
    [];

  for (const service of services) {
    const serviceTokens =
      buildServiceTokens(
        service,
      );

    const {
      score,
      matched,
    } = calculateScore(
      queryTokens,
      serviceTokens,
    );

    if (
      score <
      config.minimumScore
    ) {
      continue;
    }

    results.push({
      service,
      score,
      matchedTokens:
        matched,
    });
  }

  results.sort((a, b) => {
    if (
      b.score !==
      a.score
    ) {
      return (
        b.score -
        a.score
      );
    }

    return a.service.name.localeCompare(
      b.service.name,
    );
  });

  return results.slice(
    0,
    config.limit,
  );
}