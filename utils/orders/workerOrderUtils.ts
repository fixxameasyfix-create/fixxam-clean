import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type {
  WorkerMarketOrder,
  WorkerMarketProduct,
  WorkerOrderStatus,
  WorkerServiceIcon,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   SAFE STRING
============================================================== */

function toString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   SAFE NUMBER
============================================================== */

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

/* ==============================================================
   OPTIONAL NUMBER
============================================================== */

function toOptionalNumber(
  value: unknown,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

/* ==============================================================
   OPTIONAL STRING
============================================================== */

function toOptionalString(
  value: unknown,
): string | undefined {
  const result =
    toString(value);

  return result || undefined;
}

/* ==============================================================
   STATUS
============================================================== */

export function normalizeWorkerStatus(
  value: unknown,
): WorkerOrderStatus {
  switch (value) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "in progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   SERVICE ICON
============================================================== */

export function resolveServiceIcon(
  value: unknown,
): WorkerServiceIcon {
  const iconName =
    toString(value);

  if (!iconName) {
    return "tools";
  }

  return iconName in
    MaterialCommunityIcons.glyphMap
    ? (iconName as WorkerServiceIcon)
    : "tools";
}

/* ==============================================================
   DATE
============================================================== */

export function getOrderDate(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  /* ==========================================================
     JAVASCRIPT DATE
  ========================================================== */

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime(),
    )
      ? null
      : value;
  }

  /* ==========================================================
     FIREBASE TIMESTAMP
  ========================================================== */

  if (
    typeof value === "object" &&
    value !== null &&
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

      return date instanceof Date &&
        !Number.isNaN(
          date.getTime(),
        )
        ? date
        : null;
    } catch {
      return null;
    }
  }

  /* ==========================================================
     FIREBASE TIMESTAMP-LIKE OBJECT
  ========================================================== */

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value
  ) {
    const seconds =
      (
        value as {
          seconds?: unknown;
        }
      ).seconds;

    if (
      typeof seconds ===
        "number" &&
      Number.isFinite(seconds)
    ) {
      const date =
        new Date(
          seconds * 1000,
        );

      return Number.isNaN(
        date.getTime(),
      )
        ? null
        : date;
    }
  }

  /* ==========================================================
     STRING / NUMBER
  ========================================================== */

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  return null;
}

/* ==============================================================
   ORDER TIMESTAMP
============================================================== */

export function getOrderTimestamp(
  value: unknown,
): number {
  return (
    getOrderDate(
      value,
    )?.getTime() ?? 0
  );
}

/* ==============================================================
   FORMAT DATE
============================================================== */

export function formatOrderDate(
  value: unknown,
): string {
  const date =
    getOrderDate(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

/* ==============================================================
   LOCATION
============================================================== */

function resolveLocation(
  data: Record<string, unknown>,
): string {
  /* ==========================================================
     ADDRESS
  ========================================================== */

  const address =
    toString(
      data.address,
    );

  if (address) {
    return address;
  }

  /* ==========================================================
     LOCATION STRING
  ========================================================== */

  const location =
    data.location;

  if (
    typeof location ===
    "string"
  ) {
    const locationText =
      location.trim();

    if (locationText) {
      return locationText;
    }
  }

  /* ==========================================================
     LOCATION OBJECT
  ========================================================== */

  if (
    typeof location ===
      "object" &&
    location !== null
  ) {
    const locationData =
      location as Record<
        string,
        unknown
      >;

    const locationAddress =
      toString(
        locationData.address,
      );

    if (locationAddress) {
      return locationAddress;
    }

    const city =
      toString(
        locationData.city,
      );

    if (city) {
      return city;
    }

    const state =
      toString(
        locationData.state,
      );

    if (state) {
      return state;
    }
  }

  return "Location unavailable";
}

/* ==============================================================
   SERVICE ORDER MAPPER
============================================================== */

export function mapWorkerServiceOrder(
  id: string,
  data: Record<string, unknown>,
): WorkerServiceOrder {
  const serviceName =
    toString(
      data.serviceName,
    ) ||
    toString(
      data.service,
    ) ||
    "Service request";

  const serviceColor =
    toString(
      data.serviceColor,
    ) ||
    "#2563EB";

  const serviceBackgroundColor =
    toString(
      data.serviceBackgroundColor,
    ) ||
    "#EFF6FF";

  const customerPhoto =
    toOptionalString(
      data.customerPhotoURL,
    ) ||
    toOptionalString(
      data.customerPhoto,
    );

  const createdAt =
    data.createdAt ??
    data.created_at ??
    data.date;

  return {
    /* ========================================================
       ID
    ======================================================== */

    id,

    /* ========================================================
       STATUS
    ======================================================== */

    status:
      normalizeWorkerStatus(
        data.status,
      ),

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerId:
      toOptionalString(
        data.customerId,
      ),

    customerName:
      toString(
        data.customerName,
      ) ||
      "Customer",

    customerPhoto,

    customerPhotoURL:
      customerPhoto,

    /* ========================================================
       WORKER
    ======================================================== */

    workerId:
      toOptionalString(
        data.workerId,
      ),

    /* ========================================================
       SERVICE
    ======================================================== */

    type: "service",

    serviceId:
      toOptionalString(
        data.serviceId,
      ),

    serviceName,

    serviceIcon:
      resolveServiceIcon(
        data.serviceIcon,
      ),

    serviceColor,

    serviceBackgroundColor,

    description:
      toOptionalString(
        data.description,
      ),

    /* ========================================================
       LOCATION
    ======================================================== */

    address:
      toOptionalString(
        data.address,
      ),

    location:
      resolveLocation(data),

    /* ========================================================
       DATE / TIME
    ======================================================== */

    date:
      formatOrderDate(
        createdAt,
      ),

    time:
      toOptionalString(
        data.time,
      ),

    createdAt,

    updatedAt:
      data.updatedAt,

    /* ========================================================
       OFFER
    ======================================================== */

    offerStatus:
      toOptionalString(
        data.offerStatus,
      ),

    offerAmount:
      toOptionalNumber(
        data.offerAmount,
      ),

    amount:
      toOptionalNumber(
        data.amount,
      ),

    /* ========================================================
       DELETE
    ======================================================== */

    deletedByWorker:
      data.deletedByWorker ===
      true,
  };
}

/* ==============================================================
   MARKET PRODUCT MAPPER
============================================================== */

function mapWorkerMarketProduct(
  value: unknown,
): WorkerMarketProduct | null {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const name =
    toString(
      data.name,
    ) ||
    toString(
      data.productName,
    ) ||
    "Market item";

  return {
    id:
      toOptionalString(
        data.id,
      ),

    productId:
      toOptionalString(
        data.productId,
      ),

    name,

    productName:
      toOptionalString(
        data.productName,
      ),

    image:
      toOptionalString(
        data.image,
      ),

    imageURL:
      toOptionalString(
        data.imageURL,
      ),

    productImage:
      toOptionalString(
        data.productImage,
      ),

    quantity:
      Math.max(
        1,
        toNumber(
          data.quantity,
          1,
        ),
      ),

    price:
      Math.max(
        0,
        toNumber(
          data.price,
          0,
        ),
      ),
  };
}

/* ==============================================================
   MARKET PRODUCTS
============================================================== */

function resolveMarketProducts(
  value: unknown,
): WorkerMarketProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      mapWorkerMarketProduct,
    )
    .filter(
      (
        product,
      ): product is WorkerMarketProduct =>
        product !== null,
    );
}

/* ==============================================================
   MARKET ORDER MAPPER
============================================================== */

export function mapWorkerMarketOrder(
  id: string,
  data: Record<string, unknown>,
): WorkerMarketOrder {
  const products =
    resolveMarketProducts(
      data.products,
    );

  /* ==========================================================
     CALCULATED TOTAL
  ========================================================== */

  const calculatedTotal =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.price *
          product.quantity,
      0,
    );

  /* ==========================================================
     FIRESTORE TOTAL
  ========================================================== */

  const firestoreTotal =
    toOptionalNumber(
      data.total,
    );

  const total =
    firestoreTotal ??
    calculatedTotal;

  /* ==========================================================
     DATE
  ========================================================== */

  const createdAt =
    data.createdAt ??
    data.created_at ??
    data.date;

  /* ==========================================================
     CUSTOMER PHOTO
  ========================================================== */

  const customerPhoto =
    toOptionalString(
      data.customerPhotoURL,
    ) ||
    toOptionalString(
      data.customerPhoto,
    );

  /* ==========================================================
     STORE
  ========================================================== */

  const storeName =
    toString(
      data.storeName,
    ) ||
    toString(
      data.store,
    ) ||
    "Market seller";

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    /* ========================================================
       ID
    ======================================================== */

    id,

    /* ========================================================
       TYPE
    ======================================================== */

    type: "market",

    /* ========================================================
       STATUS
    ======================================================== */

    status:
      normalizeWorkerStatus(
        data.status,
      ),

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerId:
      toOptionalString(
        data.customerId,
      ),

    customerName:
      toString(
        data.customerName,
      ) ||
      "Customer",

    customerPhoto,

    customerPhotoURL:
      customerPhoto,

    /* ========================================================
       WORKER
    ======================================================== */

    workerId:
      toOptionalString(
        data.workerId,
      ),

    /* ========================================================
       STORE
    ======================================================== */

    storeId:
      toOptionalString(
        data.storeId,
      ),

    storeName,

    /* ========================================================
       PRODUCT
    ======================================================== */

    productId:
      toOptionalString(
        data.productId,
      ),

    productName:
      toOptionalString(
        data.productName,
      ),

    productImage:
      toOptionalString(
        data.productImage,
      ),

    products,

    itemCount:
      products.reduce(
        (
          count,
          product,
        ) =>
          count +
          product.quantity,
        0,
      ),

    /* ========================================================
       LOCATION
    ======================================================== */

    address:
      toOptionalString(
        data.address,
      ),

    location:
      resolveLocation(data),

    /* ========================================================
       DATE
    ======================================================== */

    date:
      formatOrderDate(
        createdAt,
      ),

    time:
      toOptionalString(
        data.time,
      ),

    createdAt,

    updatedAt:
      data.updatedAt,

    /* ========================================================
       TOTAL
    ======================================================== */

    total,

    totalAmount:
      total,

    amount:
      toOptionalNumber(
        data.amount,
      ),

    /* ========================================================
       OFFER
    ======================================================== */

    offerStatus:
      toOptionalString(
        data.offerStatus,
      ),

    offerAmount:
      toOptionalNumber(
        data.offerAmount,
      ),

    /* ========================================================
       DELETE
    ======================================================== */

    deletedByWorker:
      data.deletedByWorker ===
      true,
  };
}