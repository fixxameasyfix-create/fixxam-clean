import type {
    ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

export type ServiceMatch = {
  service: ServiceCardData;
  score: number;
};

const MIN_SCORE = 0.34;
const MAX_RESULTS = 10;

function normalize(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(
  value: string,
): string[] {
  return normalize(value)
    .split(" ")
    .filter(
      (token) => token.length >= 2,
    );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(Boolean),
    ),
  );
}

/**
 * Levenshtein similarity.
 *
 * Useful for small spelling mistakes:
 *
 * "haircut"
 * "hair cut"
 *
 * "plumber"
 * "plumming"
 */
function levenshteinDistance(
  a: string,
  b: string,
): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const previous = Array.from(
    { length: b.length + 1 },
    (_, index) => index,
  );

  for (
    let i = 1;
    i <= a.length;
    i += 1
  ) {
    const current = [i];

    for (
      let j = 1;
      j <= b.length;
      j += 1
    ) {
      const insert =
        current[j - 1] + 1;

      const remove =
        previous[j] + 1;

      const replace =
        previous[j - 1] +
        (a[i - 1] === b[j - 1]
          ? 0
          : 1);

      current[j] = Math.min(
        insert,
        remove,
        replace,
      );
    }

    for (
      let j = 0;
      j < current.length;
      j += 1
    ) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function similarity(
  a: string,
  b: string,
): number {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  if (
    left.includes(right) ||
    right.includes(left)
  ) {
    const shorter = Math.min(
      left.length,
      right.length,
    );

    const longer = Math.max(
      left.length,
      right.length,
    );

    return Math.min(
      0.96,
      shorter / longer + 0.2,
    );
  }

  const distance =
    levenshteinDistance(
      left,
      right,
    );

  const maxLength = Math.max(
    left.length,
    right.length,
  );

  return maxLength === 0
    ? 0
    : 1 - distance / maxLength;
}

/**
 * Compare individual query words against
 * service words.
 */
function tokenSimilarity(
  queryTokens: string[],
  serviceTokens: string[],
): number {
  if (
    queryTokens.length === 0 ||
    serviceTokens.length === 0
  ) {
    return 0;
  }

  let total = 0;
  let matched = 0;

  for (const queryToken of queryTokens) {
    let best = 0;

    for (const serviceToken of serviceTokens) {
      const current =
        similarity(
          queryToken,
          serviceToken,
        );

      if (current > best) {
        best = current;
      }
    }

    if (best >= 0.55) {
      total += best;
      matched += 1;
    }
  }

  return matched === 0
    ? 0
    : total / queryTokens.length;
}

/**
 * Build searchable fields with priority.
 *
 * Aliases and keywords are particularly
 * important for multilingual search.
 */

function getSearchFields(
  service: ServiceCardData,
) {
  return {
    name: normalize(
      service.name,
    ),

    description: normalize(
      service.description,
    ),

    categoryId: normalize(
      service.categoryId,
    ),

    subcategoryId: normalize(
      service.subcategoryId,
    ),

    keywords: unique(
      service.keywords.map(
        normalize,
      ),
    ),

    aliases: unique(
      service.aliases.map(
        normalize,
      ),
    ),

    tags: unique(
      service.tags.map(
        normalize,
      ),
    ),

    searchText: normalize(
      service.searchText,
    ),
  };
}

function scoreService(
  query: string,
  service: ServiceCardData,
): number {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  const fields =
    getSearchFields(service);

  const queryTokens =
    tokenize(normalizedQuery);

  const serviceNameTokens =
    tokenize(fields.name);

  const serviceTextTokens =
    tokenize(fields.searchText);

  let score = 0;

  /*
   * 1. Exact service name.
   */
  if (
    fields.name ===
    normalizedQuery
  ) {
    score += 1;
  }

  /*
   * 2. Exact alias.
   *
   * This is extremely important for:
   *
   * aski -> haircut
   * gyaran ac -> AC Repair
   * etc.
   */
  if (
    fields.aliases.includes(
      normalizedQuery,
    )
  ) {
    score += 0.95;
  }

  /*
   * 3. Exact keyword.
   */
  if (
    fields.keywords.includes(
      normalizedQuery,
    )
  ) {
    score += 0.88;
  }

  /*
   * 4. Query phrase inside service name.
   */
  if (
    fields.name.includes(
      normalizedQuery,
    )
  ) {
    score += 0.72;
  }

  /*
   * 5. Query phrase inside complete
   * searchable catalog text.
   */
  if (
    fields.searchText.includes(
      normalizedQuery,
    )
  ) {
    score += 0.45;
  }

  /*
   * 6. Alias similarity.
   *
   * Handles spelling differences.
   */
  let bestAliasScore = 0;

  for (const alias of fields.aliases) {
    const current =
      similarity(
        normalizedQuery,
        alias,
      );

    if (current > bestAliasScore) {
      bestAliasScore = current;
    }
  }

  score +=
    bestAliasScore * 0.82;

  /*
   * 7. Keyword similarity.
   */
  let bestKeywordScore = 0;

  for (const keyword of fields.keywords) {
    const current =
      similarity(
        normalizedQuery,
        keyword,
      );

    if (
      current > bestKeywordScore
    ) {
      bestKeywordScore = current;
    }
  }

  score +=
    bestKeywordScore * 0.68;

  /*
   * 8. Name similarity.
   */
  const nameScore =
    similarity(
      normalizedQuery,
      fields.name,
    );

  score += nameScore * 0.62;

  /*
   * 9. Token-level similarity.
   */
  const tokenScore =
    tokenSimilarity(
      queryTokens,
      serviceNameTokens,
    );

  score += tokenScore * 0.42;

  /*
   * 10. General catalog token match.
   */
  const catalogTokenScore =
    tokenSimilarity(
      queryTokens,
      serviceTextTokens,
    );

  score +=
    catalogTokenScore * 0.18;

  /*
   * 11. Category/subcategory relevance.
   */
  
  const categoryText = [
  fields.categoryId,
  fields.subcategoryId,
]
  .filter(Boolean)
  .join(" ");

if (
  categoryText.includes(
    normalizedQuery,
  )
) {
  score += 0.28;
}

  /*
   * Convert arbitrary accumulated score
   * into a predictable 0..1 range.
   */
  return Math.min(
    1,
    score / 3,
  );
}

/**
 * Main local AI/service matcher.
 *
 * Important:
 * - Uses ONLY services already loaded
 *   from Firebase.
 * - Never invents a service.
 * - Can return multiple services.
 * - Does not call Gemini.
 */
export function matchServices(
  query: string,
  services: ServiceCardData[],
): ServiceMatch[] {
  const cleanedQuery =
    normalize(query);

  if (
    !cleanedQuery ||
    services.length === 0
  ) {
    return [];
  }

  const matches = services
    .map((service) => ({
      service,
      score: scoreService(
        cleanedQuery,
        service,
      ),
    }))
    .filter(
      ({ score }) =>
        score >= MIN_SCORE,
    )
    .sort(
      (a, b) =>
        b.score - a.score,
      );

  if (matches.length === 0) {
    return [];
  }

  /*
   * Keep related services together,
   * while preventing weak/unrelated
   * services from appearing.
   */
  const bestScore =
    matches[0].score;

  const dynamicThreshold =
    Math.max(
      MIN_SCORE,
      bestScore * 0.52,
    );

  return matches
    .filter(
      ({ score }) =>
        score >=
        dynamicThreshold,
    )
    .slice(
      0,
      MAX_RESULTS,
    );
}