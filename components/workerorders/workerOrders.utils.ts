import type {
  WorkerMarketOrder,
  WorkerOrderCounts,
  WorkerServiceOrder,
  WorkerFilterType,
} from "@/types/workerOrders";

type FirestoreData = Record<string, unknown>;

export function normalizeStatus(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function matchesFilter(
  status: unknown,
  filter: WorkerFilterType,
): boolean {
  const normalized = normalizeStatus(status);

  switch (filter) {
    case "pending":
      return normalized === "pending";

    case "active":
      return (
        normalized === "accepted" ||
        normalized === "in-progress" ||
        normalized === "on-the-way"
      );

    case "completed":
      return (
        normalized === "completed" ||
        normalized === "delivered"
      );

    case "cancelled":
      return (
        normalized === "cancelled" ||
        normalized === "canceled" ||
        normalized === "expired" ||
        normalized === "declined"
      );

    case "all":
    default:
      return true;
  }
}

export function getSafeId(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

export function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

export function parseSafeNumber(
  value: unknown,
): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .replace(/[₦,\s]/g, "")
    .trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    const parsed = parseSafeNumber(value);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return 0;
}

export function getOptionalNumber(
  ...values: unknown[]
): number | undefined {
  for (const value of values) {
    const parsed = parseSafeNumber(value);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

export function getTimestampMillis(
  value: unknown,
): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : undefined;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp)
      ? undefined
      : timestamp;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const candidate = value as {
      toMillis?: () => number;
      toDate?: () => Date;
    };

    if (typeof candidate.toMillis === "function") {
      const millis = candidate.toMillis();

      return Number.isFinite(millis)
        ? millis
        : undefined;
    }

    if (typeof candidate.toDate === "function") {
      const date = candidate.toDate();

      return date instanceof Date &&
        !Number.isNaN(date.getTime())
        ? date.getTime()
        : undefined;
    }
  }

  return undefined;
}

export function getOrderDate(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    const millis = getTimestampMillis(value);

    if (millis !== undefined) {
      return new Intl.DateTimeFormat(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      ).format(new Date(millis));
    }
  }

  return "Date unavailable";
}

export function isDeletedByWorker(
  value: unknown,
): boolean {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  return (
    (value as FirestoreData).deletedByWorker === true
  );
}

export function normalizeWorkerServiceStatus(
  value: unknown,
): WorkerServiceOrder["status"] {
  const status = normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
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

export function normalizeWorkerMarketStatus(
  value: unknown,
): WorkerMarketOrder["status"] {
  const status = normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
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

export function normalizeWorkerServiceOrder(
  id: string,
  data: FirestoreData,
): WorkerServiceOrder {
  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  const serviceName = getString(
    data.serviceName,
    data.service,
    data.title,
    "Service",
  );

  const customerName = getString(
    data.customerName,
    data.customerDisplayName,
    "Customer",
  );

  const customerPhoto = getString(
    data.customerPhoto,
    data.customerImage,
    data.customerAvatar,
  );

  const location = getString(
    data.location,
    data.address,
    data.serviceAddress,
    "Address unavailable",
  );

  const date = getOrderDate(
    data.date,
    data.createdAt,
    data.requestedAt,
  );

  const serviceIcon = getString(
    data.serviceIcon,
    "tools",
  );

  const offerAmount = getOptionalNumber(
    data.offerAmount,
  );

  return {
    ...data,
    id,
    type: "service",
    serviceName,
    ...(customerPhoto
      ? { customerPhoto }
      : {}),
    location,
    date,
    createdAt,
    serviceIcon:
      serviceIcon as WorkerServiceOrder["serviceIcon"],
    ...(typeof data.serviceColor === "string"
      ? {
          serviceColor: data.serviceColor,
        }
      : {}),
    ...(typeof data.serviceBackgroundColor ===
    "string"
      ? {
          serviceBackgroundColor:
            data.serviceBackgroundColor,
        }
      : {}),
    status:
      normalizeWorkerServiceStatus(
        data.status,
      ),
    deletedByWorker:
      data.deletedByWorker === true,
    ...(offerAmount !== undefined
      ? { offerAmount }
      : {}),
    ...(typeof data.offerStatus === "string"
      ? {
          offerStatus:
            data.offerStatus as WorkerServiceOrder["offerStatus"],
        }
      : {}),
  } as WorkerServiceOrder;
}

export function normalizeWorkerMarketOrder(
  id: string,
  data: FirestoreData,
): WorkerMarketOrder {
  const products = Array.isArray(data.products)
    ? data.products.filter(
        (
          product,
        ): product is FirestoreData =>
          Boolean(
            product &&
              typeof product === "object",
          ),
      )
    : [];

  const firstProduct = products[0] ?? {};

  const productName = getString(
    firstProduct.name,
    firstProduct.productName,
    data.productName,
    data.name,
    data.title,
    "Market Order",
  );

  const productImage = getString(
    firstProduct.image,
    firstProduct.imageUrl,
    firstProduct.photo,
    firstProduct.productImage,
    data.productImage,
    data.image,
    data.imageUrl,
  );

  const customerName = getString(
    data.customerName,
    data.customerDisplayName,
    data.receiverName,
    "Customer",
  );

  const customerPhoto = getString(
    data.customerPhoto,
    data.customerImage,
    data.customerAvatar,
  );

  const amount = getNumber(
    data.amount,
    data.total,
    data.price,
  );

  const offerAmount = getOptionalNumber(
    data.offerAmount,
    data.counterOfferAmount,
  );

  const address = getString(
    data.address,
    data.deliveryAddress,
    data.location,
    "Address unavailable",
  );

  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  const date = getOrderDate(
    data.createdAt,
    data.date,
    data.requestedAt,
  );

  const itemCount =
    products.length > 0
      ? products.length
      : Math.max(
          1,
          Math.floor(
            getNumber(
              data.itemCount,
              1,
            ),
          ),
        );

  return {
    ...data,
    id,
    type: "market",
    productName,
    ...(productImage
      ? { productImage }
      : {}),
    customerName,
    ...(customerPhoto
      ? { customerPhoto }
      : {}),
    amount,
    ...(offerAmount !== undefined
      ? { offerAmount }
      : {}),
    address,
    date,
    itemCount,
    createdAt,
    status:
      normalizeWorkerMarketStatus(
        data.status,
      ),
    deletedByWorker:
      data.deletedByWorker === true,
  } as WorkerMarketOrder;
}

export function getStatusBucket(
  status: unknown,
): keyof Omit<WorkerOrderCounts, "all"> {
  const normalized = normalizeStatus(status);

  if (normalized === "pending") {
    return "pending";
  }

  if (
    normalized === "accepted" ||
    normalized === "in-progress" ||
    normalized === "on-the-way"
  ) {
    return "active";
  }

  if (
    normalized === "completed" ||
    normalized === "delivered"
  ) {
    return "completed";
  }

  return "cancelled";
}