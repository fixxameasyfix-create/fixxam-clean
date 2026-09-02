import { expandAbbreviations } from "./abbreviations";

function unique(
  values: string[],
): string[] {
  return [...new Set(values)];
}

function normalizeTokens(
  tokens: string[],
): string[] {
  return unique(
    expandAbbreviations(
      tokens
        .map((token) =>
          token.trim().toLowerCase(),
        )
        .filter(Boolean),
    ),
  );
}

export function matchTokens(
  queryTokens: string[],
  serviceTokens: string[],
): string[] {
  const query =
    normalizeTokens(queryTokens);

  const service = new Set(
    normalizeTokens(
      serviceTokens,
    ),
  );

  const matched: string[] = [];

  for (const token of query) {
    if (service.has(token)) {
      matched.push(token);
      continue;
    }

    for (const candidate of service) {
      if (
        candidate.includes(token) ||
        token.includes(candidate)
      ) {
        matched.push(candidate);
        break;
      }
    }
  }

  return unique(matched);
}

export function hasMatch(
  queryTokens: string[],
  serviceTokens: string[],
): boolean {
  return (
    matchTokens(
      queryTokens,
      serviceTokens,
    ).length > 0
  );
}