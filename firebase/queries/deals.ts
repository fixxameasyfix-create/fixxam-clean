import {
  addDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import {
  dealsCollection,
} from "@/firebase/collections/deals";

import {
  db,
} from "@/firebase/config";

import type {
  Deal,
} from "@/types/deal";

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getProductId(
  deal: Deal,
): string {
  return normalizeString(
    (
      deal as {
        productId?: unknown;
      }
    ).productId,
  );
}

/* ============================================================
   CREATE / UPDATE DEAL
============================================================ */

/**
 * Product deals are unique per active product.
 *
 * If an active product deal already exists,
 * update it instead of creating another active deal.
 *
 * This prevents:
 *
 * 21% active
 * +
 * 12% active
 *
 * from existing at the same time.
 *
 * If duplicate active deals already exist,
 * all of them are synchronized to the latest deal data.
 */
export async function createDeal(
  deal: Deal,
): Promise<
  DocumentReference
> {
  const type =
    normalizeString(
      (
        deal as {
          type?: unknown;
        }
      ).type,
    );

  const status =
    normalizeString(
      (
        deal as {
          status?: unknown;
        }
      ).status,
    );

  const productId =
    getProductId(
      deal,
    );

  /* ==========================================================
     NON-PRODUCT DEAL

     Preserve existing behavior for service
     or other deal types.
  ========================================================== */

  if (
    type !== "product" ||
    status !== "active" ||
    !productId
  ) {
    return addDoc(
      dealsCollection,
      deal,
    );
  }

  /* ==========================================================
     FIND EXISTING ACTIVE PRODUCT DEAL
  ========================================================== */

  const activeDealQuery =
    query(
      dealsCollection,

      where(
        "type",
        "==",
        "product",
      ),

      where(
        "status",
        "==",
        "active",
      ),

      where(
        "productId",
        "==",
        productId,
      ),
    );

  const snapshot =
    await getDocs(
      activeDealQuery,
    );

  /* ==========================================================
     FIRST DEAL FOR THIS PRODUCT
  ========================================================== */

  if (
    snapshot.empty
  ) {
    return addDoc(
      dealsCollection,
      deal,
    );
  }

  /* ==========================================================
     UPDATE EXISTING DEALS

     Updating every active duplicate also cleans up
     products that already have multiple active deals.

     Therefore, regardless of which deal Firestore
     returns first, all active deals contain the
     latest discount values.
  ========================================================== */

  const batch =
    writeBatch(
      db,
    );

  for (
    const document of
      snapshot.docs
  ) {
    batch.update(
      document.ref,
      {
        ...deal,

        updatedAt:
          serverTimestamp(),
      },
    );
  }

  await batch.commit();

  /* ==========================================================
     PRESERVE API

     Return a DocumentReference just like addDoc().
  ========================================================== */

  return snapshot.docs[0]
    .ref;
}

/* ============================================================
   GET ALL DEALS
============================================================ */

export async function getDeals() {
  return getDocs(
    dealsCollection,
  );
}

/* ============================================================
   GET ACTIVE PRODUCT DEALS
============================================================ */

export async function getActiveProductDeals() {
  return getDocs(
    query(
      dealsCollection,

      where(
        "type",
        "==",
        "product",
      ),

      where(
        "status",
        "==",
        "active",
      ),
    ),
  );
}

/* ============================================================
   GET ACTIVE SERVICE DEALS
============================================================ */

export async function getActiveServiceDeals() {
  return getDocs(
    query(
      dealsCollection,

      where(
        "type",
        "==",
        "service",
      ),

      where(
        "status",
        "==",
        "active",
      ),
    ),
  );
}

/* ============================================================
   GET WORKER DEALS
============================================================ */

export async function getWorkerDeals(
  workerId: string,
) {
  const normalizedWorkerId =
    workerId.trim();

  if (!normalizedWorkerId) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  return getDocs(
    query(
      dealsCollection,

      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    ),
  );
}