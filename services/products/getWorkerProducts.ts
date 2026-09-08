import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerProduct = {
  id: string;

  workerId?: string;
  workerName?: string;

  name?: string;
  category?: string;
  description?: string;

  price?: number;
  stock?: number;

  thumbnail?: string;
  images?: string[];

  delivery?: boolean;

  condition?:
    | "new"
    | "used";

  featured?: boolean;

  status?:
    | "active"
    | "out_of_stock";

  sold?: number;
  views?: number;
  rating?: number;

  createdAt?: unknown;
  updatedAt?: unknown;

  discountPercent: number;
  discountedPrice?: number;

  dealId?: string;

  discountStartsAt?: unknown;
  discountExpiresAt?: unknown;
};

type DealData = {
  id: string;

  productId?: unknown;
  workerId?: unknown;

  type?: unknown;
  status?: unknown;

  discountPercentage?: unknown;
  discountedPrice?: unknown;

  startsAt?: unknown;
  expiresAt?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function getTimestampMillis(
  value: unknown,
): number {
  if (value instanceof Date) {
    const milliseconds =
      value.getTime();

    return Number.isFinite(
      milliseconds,
    )
      ? milliseconds
      : 0;
  }

  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis === "function"
  ) {
    try {
      const milliseconds =
        (
          value as {
            toMillis: () => number;
          }
        ).toMillis();

      return Number.isFinite(
        milliseconds,
      )
        ? milliseconds
        : 0;
    } catch {
      return 0;
    }
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    try {
      const date =
        (
          value as {
            toDate: () => Date;
          }
        ).toDate();

      if (!(date instanceof Date)) {
        return 0;
      }

      const milliseconds =
        date.getTime();

      return Number.isFinite(
        milliseconds,
      )
        ? milliseconds
        : 0;
    } catch {
      return 0;
    }
  }

  return 0;
}

function getSafeNumber(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return value;
}

function getSafeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getSafeImages(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      image: unknown,
    ): image is string =>
      typeof image === "string" &&
      image.trim().length > 0,
  );
}

/* ==============================================================
   NORMALIZE PRODUCT
============================================================== */

function normalizeProduct(
  id: string,
  data: Record<string, unknown>,
): WorkerProduct {
  const price = Math.max(
    0,
    getSafeNumber(data.price),
  );

  const stock = Math.max(
    0,
    Math.floor(
      getSafeNumber(data.stock),
    ),
  );

  return {
    id,

    workerId:
      getSafeString(
        data.workerId,
      ),

    workerName:
      getSafeString(
        data.workerName,
      ),

    name:
      getSafeString(data.name),

    category:
      getSafeString(
        data.category,
      ),

    description:
      getSafeString(
        data.description,
      ),

    price,

    stock,

    thumbnail:
      getSafeString(
        data.thumbnail,
      ),

    images:
      getSafeImages(
        data.images,
      ),

    delivery:
      data.delivery === true,

    condition:
      data.condition === "used"
        ? "used"
        : "new",

    featured:
      data.featured === true,

    status:
      data.status === "out_of_stock"
        ? "out_of_stock"
        : "active",

    sold: Math.max(
      0,
      getSafeNumber(
        data.sold,
      ),
    ),

    views: Math.max(
      0,
      getSafeNumber(
        data.views,
      ),
    ),

    rating: Math.min(
      5,
      Math.max(
        0,
        getSafeNumber(
          data.rating,
        ),
      ),
    ),

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null,

    discountPercent: 0,

    discountedPrice:
      undefined,

    dealId:
      undefined,

    discountStartsAt:
      undefined,

    discountExpiresAt:
      undefined,
  };
}

/* ==============================================================
   NORMALIZE DEAL
============================================================== */

function normalizeDeal(
  id: string,
  data: Record<string, unknown>,
): DealData {
  return {
    id,

    productId:
      data.productId,

    workerId:
      data.workerId,

    type:
      data.type,

    status:
      data.status,

    discountPercentage:
      data.discountPercentage,

    discountedPrice:
      data.discountedPrice,

    startsAt:
      data.startsAt,

    expiresAt:
      data.expiresAt,
  };
}

/* ==============================================================
   FIND ACTIVE DEAL
============================================================== */

function getActiveDeal(
  deals: DealData[],
  productId: string,
  productPrice: number,
  now: number,
): DealData | null {
  if (productPrice <= 0) {
    return null;
  }

  const validDeals =
    deals.filter(
      (deal) => {
        if (
          deal.productId !==
          productId
        ) {
          return false;
        }

        if (
          deal.type !==
          "product"
        ) {
          return false;
        }

        if (
          deal.status !==
          "active"
        ) {
          return false;
        }

        const discountPercentage =
          getSafeNumber(
            deal.discountPercentage,
          );

        if (
          discountPercentage <= 0 ||
          discountPercentage >= 100
        ) {
          return false;
        }

        const discountedPrice =
          getSafeNumber(
            deal.discountedPrice,
          );

        if (
          discountedPrice <= 0 ||
          discountedPrice >=
            productPrice
        ) {
          return false;
        }

        const startsAtMillis =
          getTimestampMillis(
            deal.startsAt,
          );

        if (
          startsAtMillis <= 0 ||
          startsAtMillis > now
        ) {
          return false;
        }

        const expiresAtMillis =
          getTimestampMillis(
            deal.expiresAt,
          );

        if (
          expiresAtMillis <= 0 ||
          expiresAtMillis <= now
        ) {
          return false;
        }

        return true;
      },
    );

  if (
    validDeals.length === 0
  ) {
    return null;
  }

  return validDeals.reduce(
    (
      current,
      candidate,
    ) => {
      const currentExpiry =
        getTimestampMillis(
          current.expiresAt,
        );

      const candidateExpiry =
        getTimestampMillis(
          candidate.expiresAt,
        );

      return candidateExpiry >
        currentExpiry
        ? candidate
        : current;
    },
  );
}

/* ==============================================================
   APPLY DEALS
============================================================== */

function applyDeals(
  products: WorkerProduct[],
  deals: DealData[],
): WorkerProduct[] {
  const now =
    Date.now();

  return products.map(
    (product) => {
      const activeDeal =
        getActiveDeal(
          deals,
          product.id,
          product.price ?? 0,
          now,
        );

      if (!activeDeal) {
        return {
          ...product,

          discountPercent: 0,

          discountedPrice:
            undefined,

          dealId:
            undefined,

          discountStartsAt:
            undefined,

          discountExpiresAt:
            undefined,
        };
      }

      const discountPercentage =
        Math.min(
          99,
          Math.max(
            0,
            getSafeNumber(
              activeDeal.discountPercentage,
            ),
          ),
        );

      const discountedPrice =
        getSafeNumber(
          activeDeal.discountedPrice,
        );

      return {
        ...product,

        discountPercent:
          discountPercentage,

        discountedPrice,

        dealId:
          activeDeal.id,

        discountStartsAt:
          activeDeal.startsAt,

        discountExpiresAt:
          activeDeal.expiresAt,
      };
    },
  );
}

/* ==============================================================
   SORT PRODUCTS
============================================================== */

function sortProducts(
  products: WorkerProduct[],
): WorkerProduct[] {
  return [
    ...products,
  ].sort(
    (a, b) => {
      const aCreatedAt =
        getTimestampMillis(
          a.createdAt,
        );

      const bCreatedAt =
        getTimestampMillis(
          b.createdAt,
        );

      return (
        bCreatedAt -
        aCreatedAt
      );
    },
  );
}

/* ==============================================================
   SERVICE
============================================================== */

export default function getWorkerProducts(
  workerId: string,
  callback: (
    products: WorkerProduct[],
  ) => void,
) {
  const normalizedWorkerId =
    typeof workerId === "string"
      ? workerId.trim()
      : "";

  if (!normalizedWorkerId) {
    callback([]);

    return () => {};
  }

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const productsQuery =
    query(
      collection(
        db,
        "products",
      ),
      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    );

  /* ============================================================
     DEALS
  ============================================================ */

  const dealsQuery =
    query(
      collection(
        db,
        "deals",
      ),
      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    );

  /* ============================================================
     LOCAL STATE
  ============================================================ */

  let latestProducts:
    WorkerProduct[] = [];

  let latestDeals:
    DealData[] = [];

  /* ============================================================
     EMIT
  ============================================================ */

  const emitProducts =
    () => {
      const sortedProducts =
        sortProducts(
          latestProducts,
        );

      const productsWithDeals =
        applyDeals(
          sortedProducts,
          latestDeals,
        );

      callback(
        productsWithDeals,
      );
    };

  /* ============================================================
     PRODUCTS LISTENER
  ============================================================ */

  const unsubscribeProducts =
    onSnapshot(
      productsQuery,
      (snapshot) => {
        latestProducts =
          snapshot.docs.map(
            (
              document,
            ) =>
              normalizeProduct(
                document.id,
                document.data(),
              ),
          );

        emitProducts();
      },
      (error) => {
        console.error(
          "FIXXAM_WORKER_PRODUCTS_SNAPSHOT_ERROR:",
          error,
        );

        latestProducts = [];

        emitProducts();
      },
    );

  /* ============================================================
     DEALS LISTENER
  ============================================================ */

  const unsubscribeDeals =
    onSnapshot(
      dealsQuery,
      (snapshot) => {
        latestDeals =
          snapshot.docs.map(
            (
              document,
            ) =>
              normalizeDeal(
                document.id,
                document.data(),
              ),
          );

        emitProducts();
      },
      (error) => {
        console.error(
          "FIXXAM_WORKER_PRODUCT_DEALS_SNAPSHOT_ERROR:",
          error,
        );

        latestDeals = [];

        emitProducts();
      },
    );

  /* ============================================================
     DEAL EXPIRY REFRESH
  ============================================================ */

  const expiryInterval =
    setInterval(
      () => {
        if (
          latestProducts.length === 0
        ) {
          return;
        }

        emitProducts();
      },
      30_000,
    );

  /* ============================================================
     CLEANUP
  ============================================================ */

  return () => {
    unsubscribeProducts();
    unsubscribeDeals();

    clearInterval(
      expiryInterval,
    );
  };
}