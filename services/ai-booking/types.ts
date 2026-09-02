export type AiBookingResolution = {
  serviceId: string;
  serviceName: string;

  confidence: number;

  reason: string;

  suggestedNote: string;
};

export type ResolveAiBookingInput = {
  description: string;
  latitude?: number;
  longitude?: number;
};