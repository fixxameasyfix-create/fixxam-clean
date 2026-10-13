import type { Timestamp } from "firebase/firestore";

/* ==============================================================
   STATUS
============================================================== */

export type FirebaseShopRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed"
  | "cancelled";

/* ==============================================================
   SHOP REQUEST
============================================================== */

export type FirebaseShopRequest = {
  id: string;

  /* ============================================================
     SHOP
  ============================================================ */

  shopId: string;

  shopName: string;

  /**
   * Actual shop cover/main photo.
   *
   * NEVER use customerPhotoUrl here.
   * NEVER use photoUrls here.
   */
  shopPhotoUrl: string | null;

  /**
   * Actual shop logo.
   *
   * Used when shopPhotoUrl is unavailable.
   */
  shopLogoUrl: string | null;

  workerId: string;

  /* ============================================================
     CUSTOMER
  ============================================================ */

  customerId: string;

  customerName: string;

  /**
   * Customer profile photo.
   *
   * This belongs ONLY to the customer.
   *
   * NEVER use this as:
   * - shop image
   * - service image
   * - request image
   */
  customerPhotoUrl: string | null;

  /* ============================================================
     SERVICE
  ============================================================ */

  serviceId: string;

  serviceName: string;

  servicePrice: number;

  /**
   * Actual image of the selected service.
   *
   * Example:
   *
   * Haircut → Haircut image
   * Car Wash → Car Wash image
   * Cares → Cares image
   *
   * This is NOT:
   * - customerPhotoUrl
   * - shopPhotoUrl
   * - shopLogoUrl
   * - photoUrls
   */
  serviceImageUrl: string | null;

  /* ============================================================
     SCHEDULE
  ============================================================ */

  requestedDateKey: string;

  requestedDateLabel: string;

  requestedTime: string;

  /* ============================================================
     REQUEST DETAILS
  ============================================================ */

  description: string;

  /**
   * Customer-uploaded request photos.
   *
   * These are completely separate from:
   *
   * - shopPhotoUrl
   * - shopLogoUrl
   * - serviceImageUrl
   */
  photoUrls: string[];

  /* ============================================================
     STATUS
  ============================================================ */

  status: FirebaseShopRequestStatus;

  /* ============================================================
     CUSTOMER HISTORY
  ============================================================ */

  deletedByCustomer: boolean;

  deletedByCustomerAt: Timestamp | null;

  /* ============================================================
     WORKER HISTORY
  ============================================================ */

  deletedByWorker: boolean;

  deletedByWorkerAt: Timestamp | null;

  /* ============================================================
     TIMESTAMPS
  ============================================================ */

  createdAt: Timestamp | null;

  updatedAt: Timestamp | null;
};