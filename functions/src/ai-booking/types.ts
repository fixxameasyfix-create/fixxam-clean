/* ==============================================================
   AI BOOKING TYPES
============================================================== */

/* ==============================================================
   REQUEST
============================================================== */

export type AiBookingRequest = {
  description?: string;
  imageBase64?: string;
  mimeType?: string;

  latitude?: number;
  longitude?: number;
  address?: string;
};

/* ==============================================================
   REASON
============================================================== */

export type AiBookingReason =
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker"
  | null;

/* ==============================================================
   WORKER
============================================================== */

export type AiBookingWorker = {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  completedJobs: number;
  verified: boolean;
  distanceKm: number;
};

/* ==============================================================
   SERVICE
============================================================== */

export type AiBookingService = {
  id: string;
  name: string;
  confidence: number;
};

/* ==============================================================
   BOOKING PREVIEW
============================================================== */

export type AiBookingPreview = {
  serviceId: string;
  serviceName: string;

  workerId: string;
  workerName: string;
  workerPhoto: string;

  description: string;

  photos: string[];

  address: string;

  latitude: number | null;
  longitude: number | null;

  /**
   * Null means ASAP.
   */
  bookingDate: string | null;

  /**
   * Null means ASAP.
   */
  bookingTime: string | null;

  amount: number;

  urgent: boolean;

  urgentFee: number;

  aiGenerated: boolean;

  aiConfidence: number;
};

/* ==============================================================
   RESPONSE
============================================================== */

export type AiBookingResponse = {
  success: boolean;

  /**
   * True only when the backend successfully
   * prepared a customer booking preview.
   */
  completed: boolean;

  /**
   * True when AI cannot safely continue.
   */
  rejected: boolean;

  message: string;

  reason: AiBookingReason;

  customerDescription: string;

  service: AiBookingService | null;

  worker: AiBookingWorker | null;

  booking: AiBookingPreview | null;
};