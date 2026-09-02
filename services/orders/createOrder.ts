import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* ============================================================
   PAYMENT
============================================================ */

export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer";

/* ============================================================
   PRODUCT
============================================================ */

export type CreateOrderProduct = {
  productId: string;
  name: string;
  image: string;

  /**
   * Original product price before discount.
   */
  price: number;

  /**
   * Final customer price per unit.
   */
  unitPrice: number;

  /**
   * Quantity ordered.
   */
  quantity: number;

  /**
   * Discount percentage applied.
   */
  discountPercentage?: number;

  /**
   * Final discounted unit price.
   */
  discountedPrice?: number;

  /**
   * Deal responsible for discount.
   */
  dealId?: string;
};

/* ============================================================
   INPUT
============================================================ */

export type CreateOrderInput = {
  customerId: string;

  /**
   * Worker responsible for the order.
   */
  workerId: string;

  /**
   * Optional store.
   */
  storeId?: string;

  /**
   * Seller/store owner.
   */
  sellerId: string;

  products: CreateOrderProduct[];

  /**
   * Original product subtotal.
   */
  subtotal: number;

  /**
   * Total product discount.
   */
  discountTotal: number;

  /**
   * Delivery fee.
   */
  deliveryFee: number;

  /**
   * Final amount customer pays.
   */
  total: number;

  paymentMethod: PaymentMethod;

  receiverName: string;

  receiverPhone: string;

  stateId: string;

  lgaId: string;

  address: string;

  latitude?: number;

  longitude?: number;

  note: string;
};

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

function isValidNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isValidPaymentMethod(
  value: unknown,
): value is PaymentMethod {
  return (
    value === "cash" ||
    value === "card" ||
    value === "transfer"
  );
}

function isValidPercentage(
  value: unknown,
): value is number {
  return (
    isValidNumber(value) &&
    value > 0 &&
    value < 100
  );
}

/* ============================================================
   CREATE ORDER
============================================================ */

export default async function createOrder(
  data: CreateOrderInput,
): Promise<string> {
  /* ==========================================================
     BASIC VALIDATION
  ========================================================== */

  if (!data) {
    throw new Error(
      "Order data is required.",
    );
  }

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  const customerId =
    normalizeString(
      data.customerId,
    );

  if (!customerId) {
    throw new Error(
      "Customer ID required.",
    );
  }

  /* ==========================================================
     WORKER
  ========================================================== */

  const workerId =
    normalizeString(
      data.workerId,
    );

  if (!workerId) {
    throw new Error(
      "Worker ID required.",
    );
  }

  /* ==========================================================
     SELLER
  ========================================================== */

  const sellerId =
    normalizeString(
      data.sellerId,
    );

  if (!sellerId) {
    throw new Error(
      "Seller ID required.",
    );
  }

  /* ==========================================================
     STORE
  ========================================================== */

  const storeId =
    normalizeString(
      data.storeId,
    );

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  if (
    !Array.isArray(
      data.products,
    )
  ) {
    throw new Error(
      "Invalid products.",
    );
  }

  if (
    data.products.length === 0
  ) {
    throw new Error(
      "Products cannot be empty.",
    );
  }

  const products =
    data.products.map(
      (product) => {
        const productId =
          normalizeString(
            product.productId,
          );

        const name =
          normalizeString(
            product.name,
          );

        const image =
          normalizeString(
            product.image,
          );

        if (!productId) {
          throw new Error(
            "Invalid product ID.",
          );
        }

        if (!name) {
          throw new Error(
            "Product name required.",
          );
        }

        /* ----------------------------------------------------
           ORIGINAL PRICE
        ---------------------------------------------------- */

        if (
          !isValidNumber(
            product.price,
          ) ||
          product.price < 0
        ) {
          throw new Error(
            `Invalid price for ${name}.`,
          );
        }

        /* ----------------------------------------------------
           UNIT PRICE
        ---------------------------------------------------- */

        if (
          !isValidNumber(
            product.unitPrice,
          ) ||
          product.unitPrice < 0
        ) {
          throw new Error(
            `Invalid unit price for ${name}.`,
          );
        }

        if (
          product.unitPrice >
          product.price
        ) {
          throw new Error(
            `Unit price cannot exceed original price for ${name}.`,
          );
        }

        /* ----------------------------------------------------
           QUANTITY
        ---------------------------------------------------- */

        if (
          !Number.isInteger(
            product.quantity,
          ) ||
          product.quantity <= 0
        ) {
          throw new Error(
            `Invalid quantity for ${name}.`,
          );
        }

        /* ----------------------------------------------------
           DISCOUNT
        ---------------------------------------------------- */

        const hasDiscount =
          product.unitPrice <
          product.price;

        const dealId =
          normalizeString(
            product.dealId,
          );

        if (hasDiscount) {
          const percentage =
            product.discountPercentage;

          const discountedPrice =
            product.discountedPrice;

          if (
            !isValidPercentage(
              percentage,
            )
          ) {
            throw new Error(
              `Invalid discount percentage for ${name}.`,
            );
          }

          if (
            !isValidNumber(
              discountedPrice,
            ) ||
            discountedPrice <= 0 ||
            discountedPrice >=
              product.price
          ) {
            throw new Error(
              `Invalid discounted price for ${name}.`,
            );
          }

          if (
            Math.abs(
              discountedPrice -
                product.unitPrice,
            ) > 0.01
          ) {
            throw new Error(
              `Discounted price does not match unit price for ${name}.`,
            );
          }

          if (!dealId) {
            throw new Error(
              `Deal ID required for discounted product ${name}.`,
            );
          }

          return {
            productId,
            name,
            image,

            price:
              product.price,

            unitPrice:
              product.unitPrice,

            quantity:
              product.quantity,

            discountPercentage:
              Number(
                percentage,
              ),

            discountedPrice:
              Number(
                discountedPrice,
              ),

            dealId,
          };
        }

        /* ----------------------------------------------------
           NO DISCOUNT
        ---------------------------------------------------- */

        return {
          productId,
          name,
          image,

          price:
            product.price,

          unitPrice:
            product.unitPrice,

          quantity:
            product.quantity,
        };
      },
    );

  /* ==========================================================
     SUBTOTAL
  ========================================================== */

  if (
    !isValidNumber(
      data.subtotal,
    ) ||
    data.subtotal <= 0
  ) {
    throw new Error(
      "Invalid subtotal.",
    );
  }

  /* ==========================================================
     DISCOUNT TOTAL
  ========================================================== */

  if (
    !isValidNumber(
      data.discountTotal,
    ) ||
    data.discountTotal < 0
  ) {
    throw new Error(
      "Invalid discount total.",
    );
  }

  if (
    data.discountTotal >
    data.subtotal
  ) {
    throw new Error(
      "Discount cannot exceed subtotal.",
    );
  }

  /* ==========================================================
     DELIVERY FEE
  ========================================================== */

  if (
    !isValidNumber(
      data.deliveryFee,
    ) ||
    data.deliveryFee < 0
  ) {
    throw new Error(
      "Invalid delivery fee.",
    );
  }

  /* ==========================================================
     TOTAL
  ========================================================== */

  if (
    !isValidNumber(
      data.total,
    ) ||
    data.total <= 0
  ) {
    throw new Error(
      "Invalid order total.",
    );
  }

  /* ==========================================================
     CALCULATE PRODUCT AMOUNTS
  ========================================================== */

  /**
   * Original product amount before discounts.
   *
   * Example:
   * ₦5,000 × 2 = ₦10,000
   */
  const originalProductAmount =
    products.reduce(
      (
        sum,
        product,
      ) =>
        sum +
        product.price *
          product.quantity,
      0,
    );

  /**
   * Final amount for products
   * after discounts.
   *
   * This is the authoritative
   * Market Product Amount.
   */
  const productAmount =
    products.reduce(
      (
        sum,
        product,
      ) =>
        sum +
        product.unitPrice *
          product.quantity,
      0,
    );

  /**
   * Actual product discount.
   */
  const productDiscountTotal =
    originalProductAmount -
    productAmount;

  /* ==========================================================
     AMOUNT CONSISTENCY
  ========================================================== */

  if (
    Math.abs(
      originalProductAmount -
        data.subtotal,
    ) > 0.01
  ) {
    throw new Error(
      "Order subtotal is invalid.",
    );
  }

  if (
    Math.abs(
      productDiscountTotal -
        data.discountTotal,
    ) > 0.01
  ) {
    throw new Error(
      "Order discount is invalid.",
    );
  }

  /* ----------------------------------------------------------
     PRODUCT AMOUNT
  ---------------------------------------------------------- */

  if (
    !Number.isFinite(
      productAmount,
    ) ||
    productAmount <= 0
  ) {
    throw new Error(
      "Invalid market product amount.",
    );
  }

  /* ----------------------------------------------------------
     EXPECTED TOTAL
  ---------------------------------------------------------- */

  const expectedTotal =
    productAmount +
    data.deliveryFee;

  if (
    Math.abs(
      data.total -
        expectedTotal,
    ) > 0.01
  ) {
    throw new Error(
      "Order total is invalid.",
    );
  }

  /* ==========================================================
     PAYMENT
  ========================================================== */

  if (
    !isValidPaymentMethod(
      data.paymentMethod,
    )
  ) {
    throw new Error(
      "Invalid payment method.",
    );
  }

  /* ==========================================================
     RECEIVER
  ========================================================== */

  const receiverName =
    normalizeString(
      data.receiverName,
    );

  const receiverPhone =
    normalizeString(
      data.receiverPhone,
    );

  if (!receiverName) {
    throw new Error(
      "Receiver name required.",
    );
  }

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const address =
    normalizeString(
      data.address,
    );

  if (!address) {
    throw new Error(
      "Delivery address required.",
    );
  }

  /* ==========================================================
     STATE / LGA
  ========================================================== */

  const stateId =
    normalizeString(
      data.stateId,
    );

  const lgaId =
    normalizeString(
      data.lgaId,
    );

  /* ==========================================================
     NOTE
  ========================================================== */

  const note =
    normalizeString(
      data.note,
    );

  /* ==========================================================
     LOCATION
  ========================================================== */

  const hasLatitude =
    data.latitude !==
    undefined;

  const hasLongitude =
    data.longitude !==
    undefined;

  if (
    hasLatitude !==
    hasLongitude
  ) {
    throw new Error(
      "Invalid delivery location.",
    );
  }

  if (
    data.latitude !==
    undefined
  ) {
    if (
      !isValidNumber(
        data.latitude,
      ) ||
      data.latitude < -90 ||
      data.latitude > 90
    ) {
      throw new Error(
        "Invalid latitude.",
      );
    }
  }

  if (
    data.longitude !==
    undefined
  ) {
    if (
      !isValidNumber(
        data.longitude,
      ) ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new Error(
        "Invalid longitude.",
      );
    }
  }

  /* ==========================================================
     ORDER DATA
  ========================================================== */

  const orderData = {
    /* --------------------------------------------------------
       TYPE
    -------------------------------------------------------- */

    orderType:
      "market" as const,

    type:
      "market" as const,

    /* --------------------------------------------------------
       OWNERSHIP
    -------------------------------------------------------- */

    customerId,

    workerId,

    sellerId,

    ...(storeId
      ? {
          storeId,
        }
      : {}),

    /* --------------------------------------------------------
       PRODUCTS
    -------------------------------------------------------- */

    products,

    /* --------------------------------------------------------
       AMOUNTS
    -------------------------------------------------------- */

    /**
     * Original product amount.
     */
    subtotal:
      data.subtotal,

    /**
     * Total discount on products.
     */
    discountTotal:
      data.discountTotal,

    /**
     * Final product amount after discount.
     *
     * IMPORTANT:
     * This is what Fixxam Activity
     * should use as Market Product Amount.
     */
    productAmount,

    /**
     * Explicit original product amount.
     */
    originalProductAmount,

    /**
     * Explicit product discount.
     */
    productDiscountTotal,

    /**
     * Delivery is kept separate.
     */
    deliveryFee:
      data.deliveryFee,

    /**
     * Final customer payable amount.
     */
    total:
      data.total,

    /* --------------------------------------------------------
       PAYMENT
    -------------------------------------------------------- */

    paymentMethod:
      data.paymentMethod,

    paymentStatus:
      "pending" as const,

    /* --------------------------------------------------------
       STATUS
    -------------------------------------------------------- */

    status:
      "pending" as const,

    offerStatus:
      "pending" as const,

    /* --------------------------------------------------------
       RECEIVER
    -------------------------------------------------------- */

    receiverName,

    receiverPhone,

    /* --------------------------------------------------------
       LOCATION
    -------------------------------------------------------- */

    stateId,

    lgaId,

    address,

    ...(data.latitude !==
      undefined &&
    data.longitude !==
      undefined
      ? {
          latitude:
            data.latitude,

          longitude:
            data.longitude,
        }
      : {}),

    /* --------------------------------------------------------
       NOTE
    -------------------------------------------------------- */

    note,

    /* --------------------------------------------------------
       TIMESTAMPS
    -------------------------------------------------------- */

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  /* ==========================================================
     FIRESTORE
  ========================================================== */

  try {
    const orderRef =
      await addDoc(
        collection(
          db,
          "orders",
        ),
        orderData,
      );

    console.log(
      "FIXXAM_MARKET_ORDER_CREATED",
      {
        orderId:
          orderRef.id,

        customerId,

        workerId,

        sellerId,

        storeId:
          storeId || null,

        originalProductAmount,

        productAmount,

        productDiscountTotal,

        deliveryFee:
          data.deliveryFee,

        total:
          data.total,

        status:
          "pending",
      },
    );

    return orderRef.id;
  } catch (error) {
    console.error(
      "FIXXAM_CREATE_ORDER_FIRESTORE_ERROR:",
      error,
    );

    throw new Error(
      "Unable to create order. Please try again.",
    );
  }
}