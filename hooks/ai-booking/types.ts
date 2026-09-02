export type AiBookingInputMode =
  | "text"
  | "photo";

export type AiBookingStatus =
  | "idle"
  | "analyzing"
  | "matched"
  | "error";

export type AiBookingMatch = {
  serviceId: string | null;
  serviceName: string | null;

  confidence: number;

  reason: string;

  suggestedNote: string;

  needsMoreInformation: boolean;
};

export type AiBookingState = {
  mode: AiBookingInputMode | null;

  text: string;

  photos: string[];

  status: AiBookingStatus;

  match: AiBookingMatch | null;

  error: string | null;
};