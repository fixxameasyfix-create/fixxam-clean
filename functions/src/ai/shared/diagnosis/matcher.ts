import {
  AvailableService,
  DiagnosisResult,
} from "./types";

export interface MatchResult {
  found: boolean;
  service?: AvailableService;
  confidence: number;
}

function normalize(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function matchService(
  diagnosis: DiagnosisResult,
  services: AvailableService[],
): MatchResult {
  if (
    !diagnosis ||
    !Array.isArray(services) ||
    services.length === 0
  ) {
    return {
      found: false,
      confidence: 0,
    };
  }

  const id = normalize(
    diagnosis.matchedServiceId,
  );

  const name = normalize(
    diagnosis.matchedService,
  );

  /*
   * --------------------------------------------------
   * 1. EXACT SERVICE ID MATCH
   * --------------------------------------------------
   *
   * Only use the ID if the AI actually returned one.
   * Empty values must never match a service.
   */
  if (id) {
    const byId = services.find(
      (service) =>
        normalize(service.id) === id,
    );

    if (byId) {
      return {
        found: true,
        service: byId,
        confidence: diagnosis.confidence,
      };
    }
  }

  /*
   * --------------------------------------------------
   * 2. EXACT SERVICE NAME MATCH
   * --------------------------------------------------
   */
  if (name) {
    const byName = services.find(
      (service) =>
        normalize(service.name) === name,
    );

    if (byName) {
      return {
        found: true,
        service: byName,
        confidence: diagnosis.confidence,
      };
    }
  }

  /*
   * --------------------------------------------------
   * 3. PARTIAL SERVICE NAME MATCH
   * --------------------------------------------------
   *
   * Never run partial matching with an empty name.
   * Otherwise:
   *
   * "".includes("")
   *
   * becomes true and the first service can be
   * incorrectly selected.
   */
  if (name) {
    const partial = services.find(
      (service) => {
        const current =
          normalize(service.name);

        if (!current) {
          return false;
        }

        return (
          current.includes(name) ||
          name.includes(current)
        );
      },
    );

    if (partial) {
      return {
        found: true,
        service: partial,
        confidence: Math.min(
          diagnosis.confidence,
          80,
        ),
      };
    }
  }

  /*
   * --------------------------------------------------
   * 4. NO MATCH
   * --------------------------------------------------
   */
  return {
    found: false,
    confidence: 0,
  };
}