import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "./serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

type ResolveServiceFulfillmentInput = {
  serviceMode?: unknown;

  subcategoryMode?: unknown;

  categoryMode?: unknown;
};

/* ==============================================================
   RESOLVER
============================================================== */

export function resolveServiceFulfillmentMode({
  serviceMode,
  subcategoryMode,
  categoryMode,
}: ResolveServiceFulfillmentInput): ServiceFulfillmentMode {
  /*
   * Service-specific configuration has
   * the highest priority.
   */
  if (
    isServiceFulfillmentMode(
      serviceMode,
    )
  ) {
    return serviceMode;
  }

  /*
   * Fall back to the selected
   * subcategory configuration.
   */
  if (
    isServiceFulfillmentMode(
      subcategoryMode,
    )
  ) {
    return subcategoryMode;
  }

  /*
   * Finally use the category default.
   */
  if (
    isServiceFulfillmentMode(
      categoryMode,
    )
  ) {
    return categoryMode;
  }

  /*
   * Never guess when configuration
   * is missing.
   */
  return "needs_review";
}