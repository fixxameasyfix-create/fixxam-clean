import type {
  GeoPoint,
} from "firebase/firestore";

/* ============================================================
   WORKER SERVICE
============================================================ */

export type WorkerService = {
  id?: string;

  name: string;

  icon?: string;

  color?: string;

  backgroundColor?: string;
};

/* ============================================================
   WORKER CARD DATA
============================================================ */

export type WorkerCardData = {
  id: string;

  /**
   * Public worker display name.
   *
   * Normally synchronized from
   * Build Your Profile.
   */
  fullName: string;

  /**
   * Kept for existing worker-card,
   * filtering and search compatibility.
   */
  firstName: string;

  surname: string;

  /* ==========================================================
     REPUTATION
  ========================================================== */

  rating: number;

  totalReviews: number;

  /* ==========================================================
     STATUS
  ========================================================== */

  online: boolean;

  verified: boolean;

  /* ==========================================================
     CUSTOMER CONTEXT
  ========================================================== */

  distance?: number;

  completedJobs?: number;

  /* ==========================================================
     SERVICE
  ========================================================== */

  category?: string;

  subcategory?: string;

  /**
   * Resolved public service objects.
   */
  services: WorkerService[];

  /**
   * Original service document IDs.
   */
  serviceIds?: string[];

  /* ==========================================================
     PUBLIC WORKER PROFILE
  ========================================================== */

  workerProfile: {
    /**
     * Public worker profile photo.
     *
     * Customer-facing mapper only exposes
     * a valid HTTPS URL or an empty string.
     */
    photoUrl: string;

    /**
     * Public experience information.
     */
    experience: string;

    /**
     * Public service location.
     */
    state: string;

    lga: string;

    /**
     * Public service rate.
     */
    hourlyRate: number;

    /**
     * Worker coordinates.
     *
     * null means the worker has no valid
     * coordinate available.
     *
     * Never default missing coordinates
     * to 0,0.
     */
    latitude: number | null;

    longitude: number | null;

    /**
     * Optional Firestore geolocation data.
     */
    geoPoint?: GeoPoint | null;

    geoHash?: string;

    address?: string;
  };
};