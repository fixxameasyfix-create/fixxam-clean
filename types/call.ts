export type CallStatus =
  | "connecting"
  | "ringing"
  | "connected"
  | "ended"
  | "failed";

export type CallParticipant = {
  id: string;
  name: string;
  image: string;
  service: string;
};