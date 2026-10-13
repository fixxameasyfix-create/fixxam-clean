import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type CartItem = {
  id: string;
  name: string;

  /**
   * Original product price before discount.
   */
  price: number;

  /**
   * Actual customer price per unit.
   */
  unitPrice: number;

  image: string;

  quantity: number;

  /**
   * Discount percentage captured
   * when product was added to cart.
   */
  discountPercentage?: number;

  /**
   * Discounted unit price.
   */
  discountedPrice?: number;

  /**
   * Deal responsible for discount.
   */
  dealId?: string;

  /**
   * Store containing the product.
   */
  storeId?: string;

  /**
   * Seller / store owner.
   *
   * IMPORTANT:
   * sellerId is NOT used as workerId.
   */
  sellerId?: string;

  /**
   * Worker responsible for the product.
   *
   * This must come directly from
   * product.workerId.
   */
  workerId?: string;
};

export type AddToCartResult =
  | "added"
  | "updated"
  | "worker-conflict"
  | "invalid";

type CartContextType = {
  items: CartItem[];

  addToCart: (
    item: CartItem,
  ) => AddToCartResult;

  removeFromCart: (
    id: string,
  ) => void;

  updateQuantity: (
    id: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  /**
   * Replace the entire cart with one
   * validated product in one state update.
   *
   * Used when the customer explicitly
   * agrees to switch to another worker.
   */
  replaceCartWithItem: (
    item: CartItem,
  ) => boolean;

  /**
   * Original total before discounts.
   */
  subtotal: number;

  /**
   * Total amount saved.
   */
  discountTotal: number;

  /**
   * Final customer payable amount.
   */
  total: number;

  cartWorkerId: string | null;

  cartSellerId: string | null;

  cartStoreId: string | null;

  cartReady: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */

const CART_STORAGE_KEY =
  "@fixxam/cart/v1";

/* ============================================================
   CONTEXT
============================================================ */

const CartContext =
  createContext<CartContextType | null>(
    null,
  );

/* ============================================================
   HELPERS
============================================================ */

function normalizeId(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   WORKER ID
============================================================ */

/**
 * IMPORTANT:
 *
 * workerId MUST come directly from
 * item.workerId.
 *
 * NEVER fallback to sellerId.
 *
 * Fixxam supports:
 *
 * customerId === workerId
 *
 * because one Firebase Auth account
 * can have both Customer and Worker roles.
 */
function getWorkerId(
  item: CartItem,
): string {
  return normalizeId(
    item.workerId,
  );
}

/* ============================================================
   SELLER ID
============================================================ */

function getSellerId(
  item: CartItem,
): string {
  return normalizeId(
    item.sellerId,
  );
}

/* ============================================================
   STORE ID
============================================================ */

function getStoreId(
  item: CartItem,
): string {
  return normalizeId(
    item.storeId,
  );
}

/* ============================================================
   UNIT PRICE
============================================================ */

/**
 * Resolve actual customer unit price.
 *
 * Priority:
 *
 * 1. Explicit unitPrice
 * 2. Valid discountedPrice
 * 3. Original price
 */
function resolveUnitPrice(
  item: Partial<CartItem>,
): number {
  const price =
    Number(item.price);

  const unitPrice =
    Number(item.unitPrice);

  const discountedPrice =
    Number(
      item.discountedPrice,
    );

  if (
    Number.isFinite(unitPrice) &&
    unitPrice >= 0 &&
    Number.isFinite(price) &&
    unitPrice <= price
  ) {
    return unitPrice;
  }

  if (
    Number.isFinite(
      discountedPrice,
    ) &&
    discountedPrice > 0 &&
    Number.isFinite(price) &&
    discountedPrice < price
  ) {
    return discountedPrice;
  }

  return Number.isFinite(price) &&
    price >= 0
    ? price
    : 0;
}

/* ============================================================
   NORMALIZE ITEM
============================================================ */

function normalizeCartItem(
  item: CartItem,
): CartItem {
  const id =
    normalizeId(item.id);

  const name =
    normalizeId(item.name);

  const image =
    normalizeId(item.image);

  const price =
    Number(item.price);

  const quantity =
    Number(item.quantity);

  const unitPrice =
    resolveUnitPrice(item);

  const storeId =
    getStoreId(item);

  const sellerId =
    getSellerId(item);

  /*
   * IMPORTANT:
   *
   * workerId ONLY comes from
   * item.workerId.
   */
  const workerId =
    getWorkerId(item);

  const discountPercentage =
    Number(
      item.discountPercentage,
    );

  const discountedPrice =
    Number(
      item.discountedPrice,
    );

  const dealId =
    normalizeId(
      item.dealId,
    );

  const hasDiscount =
    Number.isFinite(
      discountPercentage,
    ) &&
    discountPercentage > 0 &&
    discountPercentage < 100 &&
    Number.isFinite(
      discountedPrice,
    ) &&
    discountedPrice > 0 &&
    Number.isFinite(price) &&
    discountedPrice < price &&
    Math.abs(
      discountedPrice -
        unitPrice,
    ) <= 0.01;

  return {
    id,

    name,

    price:
      Number.isFinite(price) &&
      price >= 0
        ? price
        : 0,

    unitPrice,

    image,

    quantity:
      Number.isInteger(quantity) &&
      quantity > 0
        ? quantity
        : 1,

    ...(hasDiscount
      ? {
          discountPercentage,

          discountedPrice,

          ...(dealId
            ? {
                dealId,
              }
            : {}),
        }
      : {}),

    storeId:
      storeId || undefined,

    sellerId:
      sellerId || undefined,

    workerId:
      workerId || undefined,
  };
}

/* ============================================================
   VALIDATE ITEM
============================================================ */

function validateCartItem(
  item: CartItem,
): boolean {
  const id =
    normalizeId(item.id);

  const name =
    normalizeId(item.name);

  const price =
    Number(item.price);

  const unitPrice =
    Number(item.unitPrice);

  const quantity =
    Number(item.quantity);

  const workerId =
    getWorkerId(item);

  const sellerId =
    getSellerId(item);

  /* ----------------------------------------------------------
     BASIC
  ---------------------------------------------------------- */

  if (!id) {
    return false;
  }

  if (!name) {
    return false;
  }

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    return false;
  }

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice < 0 ||
    unitPrice > price
  ) {
    return false;
  }

  /* ----------------------------------------------------------
     QUANTITY
  ---------------------------------------------------------- */

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return false;
  }

  /* ----------------------------------------------------------
     WORKER
  ---------------------------------------------------------- */

  /*
   * Every market product must have
   * a real workerId.
   */
  if (!workerId) {
    return false;
  }

  /* ----------------------------------------------------------
     SELLER
  ---------------------------------------------------------- */

  if (!sellerId) {
    return false;
  }

  /*
   * workerId === sellerId is VALID.
   *
   * A worker can own their own store.
   */

  /* ----------------------------------------------------------
     DISCOUNT
  ---------------------------------------------------------- */

  const hasDiscount =
    unitPrice < price;

  if (hasDiscount) {
    const discountPercentage =
      Number(
        item.discountPercentage,
      );

    const discountedPrice =
      Number(
        item.discountedPrice,
      );

    const dealId =
      normalizeId(
        item.dealId,
      );

    if (
      !Number.isFinite(
        discountPercentage,
      ) ||
      discountPercentage <= 0 ||
      discountPercentage >= 100
    ) {
      return false;
    }

    if (
      !Number.isFinite(
        discountedPrice,
      ) ||
      discountedPrice <= 0 ||
      discountedPrice >= price
    ) {
      return false;
    }

    if (
      Math.abs(
        discountedPrice -
          unitPrice,
      ) > 0.01
    ) {
      return false;
    }

    if (!dealId) {
      return false;
    }
  }

  return true;
}

/* ============================================================
   PROVIDER
============================================================ */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    items,
    setItems,
  ] = useState<CartItem[]>([]);

  const [
    cartReady,
    setCartReady,
  ] = useState(false);

  /* ==========================================================
     LOAD CART
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCart =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              CART_STORAGE_KEY,
            );

          if (!stored) {
            return;
          }

          const parsed =
            JSON.parse(stored);

          if (
            !Array.isArray(parsed)
          ) {
            return;
          }

          const normalizedItems =
            parsed
              .filter(
                (
                  item,
                ): item is CartItem =>
                  Boolean(item) &&
                  typeof item ===
                    "object" &&
                  typeof item.id ===
                    "string" &&
                  typeof item.name ===
                    "string" &&
                  typeof item.price ===
                    "number" &&
                  typeof item.quantity ===
                    "number",
              )
              .map(
                (item) =>
                  normalizeCartItem(
                    item,
                  ),
              )
              .filter(
                validateCartItem,
              );

          /*
           * Invalid/stale items are
           * automatically discarded.
           */
          if (
            normalizedItems.length ===
            0
          ) {
            return;
          }

          /* ----------------------------------------------------
             ONE WORKER PER CART
          ---------------------------------------------------- */

          const workerId =
            getWorkerId(
              normalizedItems[0],
            );

          if (!workerId) {
            console.warn(
              "FIXXAM_CART_LOAD_WORKER_MISSING",
              {
                productId:
                  normalizedItems[0]
                    ?.id ?? null,
              },
            );

            return;
          }

          const consistentItems =
            normalizedItems.filter(
              (item) =>
                getWorkerId(item) ===
                workerId,
            );

          if (
            consistentItems.length !==
            normalizedItems.length
          ) {
            console.warn(
              "FIXXAM_CART_LOAD_WORKER_CONFLICT",
              {
                workerId,

                totalItems:
                  normalizedItems.length,

                keptItems:
                  consistentItems.length,
              },
            );
          }

          if (mounted) {
            setItems(
              consistentItems,
            );
          }
        } catch (error) {
          console.error(
            "FIXXAM_LOAD_CART_ERROR:",
            error,
          );

          if (mounted) {
            setItems([]);
          }
        } finally {
          if (mounted) {
            setCartReady(true);
          }
        }
      };

    void loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     SAVE CART
  ========================================================== */

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    const saveCart =
      async () => {
        try {
          await AsyncStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(items),
          );
        } catch (error) {
          console.error(
            "FIXXAM_SAVE_CART_ERROR:",
            error,
          );
        }
      };

    void saveCart();
  }, [
    items,
    cartReady,
  ]);

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const addToCart =
    useCallback(
      (
        rawItem: CartItem,
      ): AddToCartResult => {
        const item =
          normalizeCartItem(
            rawItem,
          );

        /* ------------------------------------------------------
           VALIDATE
        ------------------------------------------------------ */

        if (
          !validateCartItem(item)
        ) {
          console.error(
            "FIXXAM_INVALID_CART_ITEM",
            {
              productId:
                item.id,

              productName:
                item.name,

              workerId:
                item.workerId ??
                null,

              sellerId:
                item.sellerId ??
                null,

              storeId:
                item.storeId ??
                null,

              currentUserId:
                auth.currentUser
                  ?.uid ?? null,
            },
          );

          return "invalid";
        }

        /* ------------------------------------------------------
           WORKER
        ------------------------------------------------------ */

        const newWorkerId =
          getWorkerId(item);

        if (!newWorkerId) {
          console.error(
            "FIXXAM_CART_WORKER_MISSING",
            {
              productId:
                item.id,

              productName:
                item.name,

              sellerId:
                item.sellerId ??
                null,
            },
          );

          return "invalid";
        }

        /* ------------------------------------------------------
           DEBUG
        ------------------------------------------------------ */

        console.log(
          "FIXXAM_CART_WORKER_DEBUG",
          {
            productId:
              item.id,

            productName:
              item.name,

            itemWorkerId:
              newWorkerId,

            itemSellerId:
              item.sellerId ??
              null,

            itemStoreId:
              item.storeId ??
              null,

            currentUserId:
              auth.currentUser
                ?.uid ?? null,

            sameAccount:
              normalizeId(
                auth.currentUser
                  ?.uid,
              ) ===
              newWorkerId,
          },
        );

        /*
         * IMPORTANT:
         *
         * We intentionally DO NOT block:
         *
         * currentUserId === workerId
         *
         * because Fixxam supports a multi-role
         * Firebase account.
         */

        /* ------------------------------------------------------
           STATE UPDATE
        ------------------------------------------------------ */

        let result:
          | AddToCartResult
          | null = null;

        setItems(
          (currentItems) => {
            /* --------------------------------------------------
               EMPTY CART
            -------------------------------------------------- */

            if (
              currentItems.length ===
              0
            ) {
              result =
                "added";

              return [
                item,
              ];
            }

            /* --------------------------------------------------
               CURRENT WORKER
            -------------------------------------------------- */

            const currentWorkerId =
              getWorkerId(
                currentItems[0],
              );

            if (!currentWorkerId) {
              console.error(
                "FIXXAM_EXISTING_CART_WORKER_MISSING",
                {
                  productId:
                    currentItems[0]
                      ?.id ?? null,
                },
              );

              result =
                "worker-conflict";

              return currentItems;
            }

            /* --------------------------------------------------
               DIFFERENT WORKER
            -------------------------------------------------- */

            if (
              currentWorkerId !==
              newWorkerId
            ) {
              console.warn(
                "FIXXAM_CART_WORKER_CONFLICT",
                {
                  currentWorkerId,

                  newWorkerId,

                  currentProductId:
                    currentItems[0]
                      ?.id ?? null,

                  newProductId:
                    item.id,
                },
              );

              result =
                "worker-conflict";

              return currentItems;
            }

            /* --------------------------------------------------
               EXISTING PRODUCT
            -------------------------------------------------- */

            const existingIndex =
              currentItems.findIndex(
                (existing) =>
                  existing.id ===
                  item.id,
              );

            if (
              existingIndex !==
              -1
            ) {
              const existing =
                currentItems[
                  existingIndex
                ];

              const updatedItems =
                currentItems.map(
                  (
                    current,
                    index,
                  ) => {
                    if (
                      index !==
                      existingIndex
                    ) {
                      return current;
                    }

                    return {
                      ...current,

                      /* pricing */
                      price:
                        item.price,

                      unitPrice:
                        item.unitPrice,

                      discountPercentage:
                        item.discountPercentage,

                      discountedPrice:
                        item.discountedPrice,

                      dealId:
                        item.dealId,

                      /* ownership */
                      storeId:
                        item.storeId,

                      sellerId:
                        item.sellerId,

                      workerId:
                        item.workerId,

                      /* product */
                      image:
                        item.image,

                      name:
                        item.name,

                      quantity:
                        existing.quantity +
                        item.quantity,
                    };
                  },
                );

              result =
                "updated";

              return updatedItems;
            }

            /* --------------------------------------------------
               NEW PRODUCT
            -------------------------------------------------- */

            result =
              "added";

            return [
              ...currentItems,
              item,
            ];
          },
        );

        return (
          result ??
          "invalid"
        );
      },
      [],
    );

  /* ==========================================================
     REMOVE
  ========================================================== */

  const removeFromCart =
    useCallback(
      (id: string) => {
        const normalizedId =
          normalizeId(id);

        if (!normalizedId) {
          return;
        }

        setItems(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                normalizedId,
            ),
        );
      },
      [],
    );

  /* ==========================================================
     UPDATE QUANTITY
  ========================================================== */

  const updateQuantity =
    useCallback(
      (
        id: string,
        quantity: number,
      ) => {
        const normalizedId =
          normalizeId(id);

        if (!normalizedId) {
          return;
        }

        if (
          !Number.isFinite(
            quantity,
          )
        ) {
          return;
        }

        const normalizedQuantity =
          Math.floor(quantity);

        if (
          normalizedQuantity < 1
        ) {
          return;
        }

        setItems(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                normalizedId
                  ? {
                      ...item,

                      quantity:
                        normalizedQuantity,
                    }
                  : item,
            ),
        );
      },
      [],
    );

  /* ==========================================================
     CLEAR CART
  ========================================================== */

  const clearCart =
    useCallback(() => {
      setItems([]);
    }, []);

  /* ==========================================================
     REPLACE CART WITH ITEM
  ========================================================== */

  const replaceCartWithItem =
    useCallback(
      (
        rawItem: CartItem,
      ): boolean => {
        /*
         * Normalize exactly the same way
         * as addToCart.
         */
        const item =
          normalizeCartItem(
            rawItem,
          );

        /*
         * Never replace the current cart
         * with invalid product data.
         */
        if (
          !validateCartItem(
            item,
          )
        ) {
          console.error(
            "FIXXAM_INVALID_REPLACEMENT_CART_ITEM",
            {
              productId:
                item.id,

              productName:
                item.name,

              workerId:
                item.workerId ??
                null,

              sellerId:
                item.sellerId ??
                null,

              storeId:
                item.storeId ??
                null,

              currentUserId:
                auth.currentUser
                  ?.uid ?? null,
            },
          );

          return false;
        }

        const workerId =
          getWorkerId(
            item,
          );

        if (!workerId) {
          console.error(
            "FIXXAM_REPLACEMENT_CART_WORKER_MISSING",
            {
              productId:
                item.id,

              productName:
                item.name,
            },
          );

          return false;
        }

        /*
         * IMPORTANT:
         *
         * This is intentionally ONE state
         * update.
         *
         * Do not change this back to:
         *
         * clearCart();
         * addToCart(item);
         *
         * because those are two separate
         * React state updates and can cause
         * the previous worker to be detected
         * by addToCart.
         */
        setItems([
          item,
        ]);

        return true;
      },
      [],
    );

  /* ==========================================================
     SUBTOTAL
  ========================================================== */

  const subtotal =
    useMemo(() => {
      return items.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0,
      );
    }, [
      items,
    ]);

  /* ==========================================================
     DISCOUNT TOTAL
  ========================================================== */

  const discountTotal =
    useMemo(() => {
      return items.reduce(
        (sum, item) => {
          const original =
            Number(
              item.price,
            );

          const actual =
            Number(
              item.unitPrice,
            );

          const quantity =
            Number(
              item.quantity,
            );

          if (
            !Number.isFinite(
              original,
            ) ||
            !Number.isFinite(
              actual,
            ) ||
            !Number.isFinite(
              quantity,
            )
          ) {
            return sum;
          }

          return (
            sum +
            Math.max(
              0,
              original -
                actual,
            ) *
              quantity
          );
        },
        0,
      );
    }, [
      items,
    ]);

  /* ==========================================================
     FINAL TOTAL
  ========================================================== */

  const total =
    useMemo(() => {
      return items.reduce(
        (sum, item) =>
          sum +
          item.unitPrice *
            item.quantity,
        0,
      );
    }, [
      items,
    ]);

  /* ==========================================================
     CART WORKER
  ========================================================== */

  const cartWorkerId =
    useMemo(() => {
      if (
        !items.length
      ) {
        return null;
      }

      return (
        getWorkerId(
          items[0],
        ) || null
      );
    }, [
      items,
    ]);

  /* ==========================================================
     CART SELLER
  ========================================================== */

  const cartSellerId =
    useMemo(() => {
      if (
        !items.length
      ) {
        return null;
      }

      return (
        getSellerId(
          items[0],
        ) || null
      );
    }, [
      items,
    ]);

  /* ==========================================================
     CART STORE
  ========================================================== */

  const cartStoreId =
    useMemo(() => {
      if (
        !items.length
      ) {
        return null;
      }

      return (
        getStoreId(
          items[0],
        ) || null
      );
    }, [
      items,
    ]);

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const value =
    useMemo<CartContextType>(
      () => ({
        items,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        replaceCartWithItem,

        subtotal,

        discountTotal,

        total,

        cartWorkerId,

        cartSellerId,

        cartStoreId,

        cartReady,
      }),
      [
        items,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        replaceCartWithItem,

        subtotal,

        discountTotal,

        total,

        cartWorkerId,

        cartSellerId,

        cartStoreId,

        cartReady,
      ],
    );

  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <CartContext.Provider
      value={
        value
      }
    >
      {children}
    </CartContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useCart() {
  const context =
    useContext(
      CartContext,
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider.",
    );
  }

  return context;
}