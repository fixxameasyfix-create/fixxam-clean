import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type WorkerProductItem = {
  status?: unknown;
  stock?: unknown;
  views?: unknown;
  featured?: unknown;
};

type MarketOrderProduct = {
  productId?: unknown;
  quantity?: unknown;
};

type MarketOrderItem = {
  orderType?: unknown;
  type?: unknown;
  status?: unknown;
  products?: unknown;
};

export type WorkerProductPerformance = {
  totalProducts: number;

  activeProducts: number;

  outOfStockProducts: number;

  productsSold: number;

  totalViews: number;

  featuredProducts: number;
};

type WorkerProductPerformanceResult = {
  performance: WorkerProductPerformance;

  loading: boolean;

  error: string | null;
};

/* ============================================================
   INITIAL STATE
============================================================ */

const EMPTY_PERFORMANCE: WorkerProductPerformance = {
  totalProducts: 0,

  activeProducts: 0,

  outOfStockProducts: 0,

  productsSold: 0,

  totalViews: 0,

  featuredProducts: 0,
};

/* ============================================================
   HELPERS
============================================================ */

function toSafeCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
    : "";
}

function isCompletedMarketOrder(
  order: MarketOrderItem,
): boolean {
  const status =
    normalizeString(
      order.status,
    );

  const orderType =
    normalizeString(
      order.orderType,
    );

  const legacyType =
    normalizeString(
      order.type,
    );

  const isMarket =
    orderType === "market" ||
    legacyType === "market";

  const isCompleted =
    status === "completed" ||
    status === "delivered";

  return (
    isMarket &&
    isCompleted
  );
}

function getOrderSoldQuantity(
  order: MarketOrderItem,
): number {
  if (
    !isCompletedMarketOrder(
      order,
    )
  ) {
    return 0;
  }

  if (
    !Array.isArray(
      order.products,
    )
  ) {
    return 0;
  }

  return order.products.reduce(
    (
      total: number,
      rawProduct: unknown,
    ) => {
      if (
        !rawProduct ||
        typeof rawProduct !==
          "object"
      ) {
        return total;
      }

      const product =
        rawProduct as MarketOrderProduct;

      const productId =
        typeof product.productId ===
        "string"
          ? product.productId.trim()
          : "";

      if (!productId) {
        return total;
      }

      const quantity =
        toSafeCount(
          product.quantity,
        );

      return (
        total +
        quantity
      );
    },
    0,
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerProductPerformance(): WorkerProductPerformanceResult {
  const [
    products,
    setProducts,
  ] = useState<
    WorkerProductItem[]
  >([]);

  const [
    orders,
    setOrders,
  ] = useState<
    MarketOrderItem[]
  >([]);

  const [
    productsReady,
    setProductsReady,
  ] = useState(false);

  const [
    ordersReady,
    setOrdersReady,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /* ==========================================================
     PRODUCTS + MARKET ORDERS LISTENERS
  ========================================================== */

  useEffect(() => {
    let unsubscribeProducts:
      | (() => void)
      | undefined;

    let unsubscribeOrders:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeProducts?.();
          unsubscribeOrders?.();

          unsubscribeProducts =
            undefined;

          unsubscribeOrders =
            undefined;

          setProducts([]);
          setOrders([]);

          setProductsReady(
            false,
          );

          setOrdersReady(
            false,
          );

          setError(null);

          if (!user) {
            setProductsReady(
              true,
            );

            setOrdersReady(
              true,
            );

            return;
          }

          /* ==================================================
             PRODUCTS
          ================================================== */

          const productsQuery =
            query(
              collection(
                db,
                "products",
              ),

              where(
                "workerId",
                "==",
                user.uid,
              ),
            );

          unsubscribeProducts =
            onSnapshot(
              productsQuery,

              snapshot => {
                const nextProducts =
                  snapshot.docs.map(
                    productSnapshot =>
                      productSnapshot.data() as WorkerProductItem,
                  );

                setProducts(
                  nextProducts,
                );

                setProductsReady(
                  true,
                );
              },

              listenerError => {
                if (__DEV__) {
                  console.error(
                    "WORKER_PRODUCT_PERFORMANCE_PRODUCTS_ERROR:",
                    listenerError,
                  );
                }

                setProducts([]);

                setProductsReady(
                  true,
                );

                setError(
                  "Unable to load product performance.",
                );
              },
            );

          /* ==================================================
             MARKET ORDERS
          ================================================== */

          const ordersQuery =
            query(
              collection(
                db,
                "orders",
              ),

              where(
                "workerId",
                "==",
                user.uid,
              ),
            );

          unsubscribeOrders =
            onSnapshot(
              ordersQuery,

              snapshot => {
                const nextOrders =
                  snapshot.docs.map(
                    orderSnapshot =>
                      orderSnapshot.data() as MarketOrderItem,
                  );

                setOrders(
                  nextOrders,
                );

                setOrdersReady(
                  true,
                );
              },

              listenerError => {
                if (__DEV__) {
                  console.error(
                    "WORKER_PRODUCT_PERFORMANCE_ORDERS_ERROR:",
                    listenerError,
                  );
                }

                setOrders([]);

                setOrdersReady(
                  true,
                );

                setError(
                  "Unable to load product performance.",
                );
              },
            );
        },
      );

    return () => {
      unsubscribeProducts?.();

      unsubscribeOrders?.();

      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  const loading =
    !productsReady ||
    !ordersReady;

  /* ==========================================================
     PRODUCTS SOLD
  ========================================================== */

  const productsSold =
    useMemo(() => {
      let totalSold =
        0;

      for (
        const order of orders
      ) {
        totalSold +=
          getOrderSoldQuantity(
            order,
          );
      }

      return totalSold;
    }, [
      orders,
    ]);

  /* ==========================================================
     PERFORMANCE
  ========================================================== */

  const performance =
    useMemo<WorkerProductPerformance>(
      () => {
        let activeProducts =
          0;

        let outOfStockProducts =
          0;

        let totalViews =
          0;

        let featuredProducts =
          0;

        for (
          const product of products
        ) {
          const stock =
            toSafeCount(
              product.stock,
            );

          const views =
            toSafeCount(
              product.views,
            );

          /*
           * Keep existing product status behavior.
           */
          const isOutOfStock =
            product.status ===
              "out_of_stock" ||
            stock <= 0;

          if (isOutOfStock) {
            outOfStockProducts +=
              1;
          } else {
            activeProducts +=
              1;
          }

          totalViews +=
            views;

          if (
            product.featured ===
            true
          ) {
            featuredProducts +=
              1;
          }
        }

        return {
          totalProducts:
            products.length,

          activeProducts,

          outOfStockProducts,

          productsSold,

          totalViews,

          featuredProducts,
        };
      },
      [
        products,
        productsSold,
      ],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    performance:
      loading
        ? EMPTY_PERFORMANCE
        : performance,

    loading,

    error,
  };
}