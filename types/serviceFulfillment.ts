/* ==============================================================
   SERVICE FULFILLMENT TYPES
============================================================== */

/**
 * Defines where a service is performed
 * and who travels for the service.
 */
export type ServiceFulfillmentMode =
  | "worker_visits_customer"
  | "customer_visits_worker"
  | "flexible"
  | "remote"
  | "needs_review";

/* ==============================================================
   VALID MODES
============================================================== */

export const SERVICE_FULFILLMENT_MODES =
  [
    "worker_visits_customer",
    "customer_visits_worker",
    "flexible",
    "remote",
    "needs_review",
  ] as const satisfies readonly ServiceFulfillmentMode[];

/* ==============================================================
   VALIDATION
============================================================== */

export function isServiceFulfillmentMode(
  value: unknown,
): value is ServiceFulfillmentMode {
  return (
    typeof value === "string" &&
    SERVICE_FULFILLMENT_MODES.some(
      (mode) => mode === value,
    )
  );
}