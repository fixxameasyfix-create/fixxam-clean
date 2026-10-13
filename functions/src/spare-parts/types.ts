/* ==============================================================
   SPARE PART AI TYPES
============================================================== */

export type SparePartSearchMode =
  | "photo"
  | "description"
  | "equipment"
  | "combined";

/* ==============================================================
   REQUEST
============================================================== */

export type SparePartIdentifyRequest = {
  imageBase64?: string;
  mimeType?: string;

  description?: string;

  equipmentId?: string;
  equipmentName?: string;

  brandId?: string;
  brandName?: string;
};

/* ==============================================================
   REASON
============================================================== */

export type SparePartIdentifyReason =
  | "unclear_image"
  | "unclear_request"
  | "not_spare_part"
  | null;

/* ==============================================================
   RESPONSE
============================================================== */

export type SparePartIdentifyResponse = {
  success: boolean;

  /**
   * True when there is enough trusted
   * information to continue product search.
   */
  completed: boolean;

  /**
   * True when AI identified a probable
   * physical spare part.
   *
   * Equipment-only search can be completed
   * while identified remains false.
   */
  identified: boolean;

  rejected: boolean;

  mode: SparePartSearchMode;

  reason: SparePartIdentifyReason;

  message: string;

  partName: string;

  equipmentId: string;
  equipmentName: string;

  brandId: string;
  brandName: string;

  category: string;

  searchQuery: string;

  keywords: string[];

  confidence: number;
};