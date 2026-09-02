import { matchTokens } from "./matcher";

export interface ScoreResult {
  score: number;

  matched: string[];
}

export function calculateScore(
  queryTokens: string[],
  serviceTokens: string[],
): ScoreResult {
  if (
    queryTokens.length === 0 ||
    serviceTokens.length === 0
  ) {
    return {
      score: 0,
      matched: [],
    };
  }

  const matched = matchTokens(
    queryTokens,
    serviceTokens,
  );

  if (matched.length === 0) {
    return {
      score: 0,
      matched: [],
    };
  }

  const queryCoverage =
    matched.length /
    queryTokens.length;

  const serviceCoverage =
    matched.length /
    serviceTokens.length;

  const exactBonus =
    matched.length ===
    queryTokens.length
      ? 0.2
      : 0;

  const score = Math.min(
    1,
    queryCoverage * 0.8 +
      serviceCoverage * 0.2 +
      exactBonus,
  );

  return {
    score,
    matched,
  };
}