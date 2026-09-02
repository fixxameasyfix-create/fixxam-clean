import {
  AvailableService,
  DiagnosisResult,
} from "../../shared/diagnosis/types";

export interface MatchResult {
  found: boolean;

  service?: AvailableService;

  confidence: number;
}

function normalize(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function matchService(
  diagnosis: DiagnosisResult,
  services: AvailableService[],
): MatchResult {
  const id = normalize(
    diagnosis.matchedServiceId,
  );

  const name = normalize(
    diagnosis.matchedService,
  );

  const byId = services.find(
    (service) =>
      normalize(service.id) === id,
  );

  if (byId) {
    return {
      found: true,
      service: byId,
      confidence:
        diagnosis.confidence,
    };
  }

  const byName = services.find(
    (service) =>
      normalize(service.name) ===
      name,
  );

  if (byName) {
    return {
      found: true,
      service: byName,
      confidence:
        diagnosis.confidence,
    };
  }

  const partial =
    services.find((service) => {
      const current =
        normalize(service.name);

      return (
        current.includes(name) ||
        name.includes(current)
      );
    });

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

  return {
    found: false,
    confidence: 0,
  };
}