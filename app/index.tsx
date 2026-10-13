import React from "react";

/* ============================================================
   APP ENTRY
============================================================ */

/**
 * FIXXAM root entry point.
 *
 * Routing is intentionally handled by the root layout.
 *
 * This prevents the entry point from forcing every authenticated
 * user into the Customer experience before their Firebase role
 * and activeRole have been resolved.
 *
 * Public users are still routed to Customer Home by
 * app/_layout.tsx.
 *
 * Authenticated users are routed according to:
 *
 * customer only -> Customer Home
 * worker only   -> Worker Home
 * dual role     -> last activeRole
 *
 * If a dual-role account has no valid activeRole:
 * -> Select Account
 */
export default function Index() {
  return null;
}