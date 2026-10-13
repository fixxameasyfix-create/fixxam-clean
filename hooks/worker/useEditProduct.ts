import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  auth,
} from "@/firebase/config";

import useWorkerProduct from "./useWorkerProduct";

import useProductImages from "./useProductImages";

import updateProduct from "@/services/products/updateProduct";

import updateProductImages from "@/services/storage/uploadProductImages";

import createProductDeal from "@/services/deals/createProductDeal";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ============================================================
   CONSTANTS
============================================================ */

const DAY_MS =
  24 *
  60 *
  60 *
  1000;

/* ============================================================
   HELPERS
============================================================ */

function getRemainingDays(
  expiresAt: Date | null,
): string {
  if (!expiresAt) {
    return "";
  }

  const remainingMs =
    expiresAt.getTime() -
    Date.now();

  if (
    remainingMs <= 0
  ) {
    return "";
  }

  return String(
    Math.max(
      1,
      Math.ceil(
        remainingMs /
          DAY_MS,
      ),
    ),
  );
}

function calculateDiscountedPrice(
  originalPrice: number,
  percentage: number,
): number {
  return Number(
    (
      originalPrice -
      originalPrice *
        (
          percentage /
          100
        )
    ).toFixed(2),
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useEditProduct(
  productId: string,
) {
  const {
    product,
    loading,
  } =
    useWorkerProduct(
      productId,
    );

  /* ==========================================================
     PRODUCT FIELDS
  ========================================================== */

  const [
    productName,
    setProductName,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState("");

  const [
    price,
    setPrice,
  ] =
    useState("");

  const [
    stock,
    setStock,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    featured,
    setFeatured,
  ] =
    useState(false);

  const [
    delivery,
    setDelivery,
  ] =
    useState(true);

  const [
    condition,
    setCondition,
  ] =
    useState<
      "new" | "used"
    >("new");

  /* ==========================================================
     SAVE STATE
  ========================================================== */

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  /* ==========================================================
     DISCOUNT
  ========================================================== */

  const [
    discount,
    setDiscount,
  ] =
    useState("");

  const [
    discountDays,
    setDiscountDays,
  ] =
    useState("");

  const [
    discountSaving,
    setDiscountSaving,
  ] =
    useState(false);

  const [
    activeDeal,
    setActiveDeal,
  ] =
    useState<
      ActiveProductDeal | null
    >(null);

  const [
    initialDiscountDays,
    setInitialDiscountDays,
  ] =
    useState("");

  const loadedDealProductIdRef =
    useRef<
      string | null
    >(null);

  /* ==========================================================
     IMAGES
  ========================================================== */

  const {
    images,
    setImages,
    pickImages,
    removeImage,
  } =
    useProductImages();

  /* ==========================================================
     LOAD PRODUCT
  ========================================================== */

  useEffect(() => {
    if (!product) {
      return;
    }

    setProductName(
      product.name ?? "",
    );

    setCategory(
      product.category ?? "",
    );

    setPrice(
      String(
        product.price ?? "",
      ),
    );

    setStock(
      String(
        product.stock ?? 0,
      ),
    );

    setDescription(
      product.description ?? "",
    );

    setFeatured(
      product.featured ??
        false,
    );

    setDelivery(
      product.delivery ??
        true,
    );

    setCondition(
      product.condition ??
        "new",
    );

    setImages(
      product.images ?? [],
    );
  }, [
    product,
    setImages,
  ]);

  /* ==========================================================
     LOAD ACTIVE DISCOUNT
  ========================================================== */

  useEffect(() => {
    if (
      !product ||
      !productId ||
      loadedDealProductIdRef
        .current ===
        productId
    ) {
      return;
    }

    loadedDealProductIdRef.current =
      productId;

    let cancelled =
      false;

    async function loadDiscount() {
      try {
        const deals =
          await getActiveProductDeals(
            [
              productId,
            ],
          );

        if (cancelled) {
          return;
        }

        const deal =
          deals.get(
            productId,
          ) ??
          null;

        setActiveDeal(
          deal,
        );

        if (!deal) {
          setDiscount(
            "",
          );

          setDiscountDays(
            "",
          );

          setInitialDiscountDays(
            "",
          );

          return;
        }

        const remainingDays =
          getRemainingDays(
            deal.expiresAt,
          );

        setDiscount(
          String(
            deal.discountPercentage,
          ),
        );

        setDiscountDays(
          remainingDays,
        );

        setInitialDiscountDays(
          remainingDays,
        );
      } catch (error) {
        console.error(
          "ACTIVE_PRODUCT_DEAL_LOAD_ERROR:",
          error,
        );

        loadedDealProductIdRef.current =
          null;
      }
    }

    void loadDiscount();

    return () => {
      cancelled =
        true;
    };
  }, [
    product,
    productId,
  ]);

  /* ==========================================================
     UPDATE PRODUCT
  ========================================================== */

  const onSave =
    async () => {
      /*
       * Prevent duplicate taps while
       * an update is already running.
       */
      if (saving) {
        return;
      }

      const worker =
        auth.currentUser;

      if (!worker) {
        Alert.alert(
          "Error",
          "Worker account not found.",
        );

        return;
      }

      if (!productId.trim()) {
        Alert.alert(
          "Error",
          "Product ID is missing.",
        );

        return;
      }

      if (!productName.trim()) {
        Alert.alert(
          "Validation",
          "Product name is required.",
        );

        return;
      }

      if (!category.trim()) {
        Alert.alert(
          "Validation",
          "Category is required.",
        );

        return;
      }

      const numericPrice =
        Number(
          price,
        );

      if (
        !Number.isFinite(
          numericPrice,
        ) ||
        numericPrice <= 0
      ) {
        Alert.alert(
          "Validation",
          "Enter a valid product price.",
        );

        return;
      }

      const numericStock =
        Number(
          stock || 0,
        );

      if (
        !Number.isFinite(
          numericStock,
        ) ||
        numericStock < 0
      ) {
        Alert.alert(
          "Validation",
          "Enter a valid stock quantity.",
        );

        return;
      }

      /* ======================================================
         VALIDATE DISCOUNT BEFORE SAVE
      ====================================================== */

      const discountValue =
        discount.trim();

      const discountDaysValue =
        discountDays.trim();

      const hasDiscountInput =
        Boolean(
          discountValue ||
            discountDaysValue,
        );

      let percentage =
        0;

      let days =
        0;

      let discountedPrice =
        0;

      let dealStartsAt:
        Date | null =
        null;

      let dealExpiresAt:
        Date | null =
        null;

      if (
        hasDiscountInput
      ) {
        percentage =
          Number(
            discountValue,
          );

        days =
          Number(
            discountDaysValue,
          );

        if (
          !Number.isFinite(
            percentage,
          ) ||
          percentage <= 0 ||
          percentage >= 100
        ) {
          Alert.alert(
            "Validation",
            "Discount must be between 1% and 99%.",
          );

          return;
        }

        if (
          !Number.isInteger(
            days,
          ) ||
          days < 1 ||
          days > 365
        ) {
          Alert.alert(
            "Validation",
            "Discount duration must be between 1 and 365 days.",
          );

          return;
        }

        discountedPrice =
          calculateDiscountedPrice(
            numericPrice,
            percentage,
          );

        if (
          discountedPrice <= 0 ||
          discountedPrice >=
            numericPrice
        ) {
          Alert.alert(
            "Validation",
            "Discounted price is invalid.",
          );

          return;
        }

        /*
         * When only discount percentage
         * or product price changes,
         * preserve the existing expiry.
         *
         * When duration changes,
         * restart duration from now.
         */
        const durationUnchanged =
          Boolean(
            activeDeal,
          ) &&
          discountDaysValue ===
            initialDiscountDays &&
          Boolean(
            activeDeal?.expiresAt,
          );

        if (
          durationUnchanged &&
          activeDeal?.expiresAt
        ) {
          dealStartsAt =
            activeDeal.startsAt ??
            new Date();

          dealExpiresAt =
            activeDeal.expiresAt;
        } else {
          dealStartsAt =
            new Date();

          dealExpiresAt =
            new Date(
              dealStartsAt.getTime() +
                days *
                  DAY_MS,
            );
        }
      }

      /* ======================================================
         SAVE
      ====================================================== */

      try {
        setSaving(
          true,
        );

        if (
          hasDiscountInput
        ) {
          setDiscountSaving(
            true,
          );
        }

        /* ====================================================
           IMAGES
        ==================================================== */

        const uploaded =
          await updateProductImages(
            images,
            worker.uid,
          );

        /* ====================================================
           PRODUCT
        ==================================================== */

        await updateProduct(
          productId,
          {
            name:
              productName.trim(),

            category:
              category.trim(),

            description:
              description.trim(),

            price:
              numericPrice,

            stock:
              numericStock,

            thumbnail:
              uploaded.thumbnail,

            images:
              uploaded.images,

            featured,

            delivery,

            condition,
          },
        );

        /* ====================================================
           DISCOUNT DEAL
        ==================================================== */

        if (
          hasDiscountInput &&
          dealStartsAt &&
          dealExpiresAt
        ) {
          const dealReference =
            await createProductDeal(
              {
                productId,

                workerId:
                  worker.uid,

                originalPrice:
                  numericPrice,

                discountPercentage:
                  percentage,

                discountedPrice,

                startsAt:
                  dealStartsAt,

                expiresAt:
                  dealExpiresAt,
              },
            );

          /*
           * Keep local deal state synchronized
           * while the success dialog is visible.
           */
          setActiveDeal({
            id:
              dealReference.id,

            productId,

            workerId:
              worker.uid,

            originalPrice:
              numericPrice,

            discountedPrice,

            discountPercentage:
              percentage,

            status:
              "active",

            startsAt:
              dealStartsAt,

            expiresAt:
              dealExpiresAt,
          });

          setInitialDiscountDays(
            discountDaysValue,
          );
        }

        /* ====================================================
           IMPORTANT:
           Stop all loading states BEFORE
           opening native Alert/navigation.

           This prevents Fabric from handling:
           - Alert mount
           - route unmount
           - loading UI remount
           at the same time.
        ==================================================== */

        setDiscountSaving(
          false,
        );

        setSaving(
          false,
        );

        /* ====================================================
           SUCCESS
        ==================================================== */

        Alert.alert(
          "Success",
          "Product updated successfully.",
          [
            {
              text:
                "OK",

              onPress: () => {
                /*
                 * Navigation happens only after
                 * the native alert is dismissed
                 * by the user.
                 */
                router.back();
              },
            },
          ],
          {
            cancelable:
              false,
          },
        );
      } catch (error) {
        console.error(
          "PRODUCT_UPDATE_ERROR:",
          error,
        );

        /*
         * Do not use finally here.
         *
         * Success flow can navigate away,
         * therefore state updates must finish
         * before navigation starts.
         */
        setDiscountSaving(
          false,
        );

        setSaving(
          false,
        );

        Alert.alert(
          "Error",
          "Unable to update product. Please try again.",
        );
      }
    };

  /* ==========================================================
     ACTIVATE / UPDATE DISCOUNT
  ========================================================== */

  const activateDiscount =
    async () => {
      if (
        discountSaving ||
        saving
      ) {
        return;
      }

      const worker =
        auth.currentUser;

      if (!worker) {
        Alert.alert(
          "Error",
          "Worker account not found.",
        );

        return;
      }

      if (!product) {
        Alert.alert(
          "Error",
          "Product information is not available.",
        );

        return;
      }

      if (!productId.trim()) {
        Alert.alert(
          "Error",
          "Product ID is missing.",
        );

        return;
      }

      const originalPrice =
        Number(
          price,
        );

      const percentage =
        Number(
          discount,
        );

      const days =
        Number(
          discountDays,
        );

      if (
        !Number.isFinite(
          originalPrice,
        ) ||
        originalPrice <= 0
      ) {
        Alert.alert(
          "Validation",
          "Product price must be valid.",
        );

        return;
      }

      if (
        !Number.isFinite(
          percentage,
        ) ||
        percentage <= 0 ||
        percentage >= 100
      ) {
        Alert.alert(
          "Validation",
          "Discount must be between 1% and 99%.",
        );

        return;
      }

      if (
        !Number.isInteger(
          days,
        ) ||
        days < 1 ||
        days > 365
      ) {
        Alert.alert(
          "Validation",
          "Discount duration must be between 1 and 365 days.",
        );

        return;
      }

      const discountedPrice =
        calculateDiscountedPrice(
          originalPrice,
          percentage,
        );

      if (
        discountedPrice <= 0 ||
        discountedPrice >=
          originalPrice
      ) {
        Alert.alert(
          "Validation",
          "Discounted price is invalid.",
        );

        return;
      }

      const startsAt =
        new Date();

      const expiresAt =
        new Date(
          startsAt.getTime() +
            days *
              DAY_MS,
        );

      try {
        setDiscountSaving(
          true,
        );

        const dealReference =
          await createProductDeal(
            {
              productId,

              workerId:
                worker.uid,

              originalPrice,

              discountPercentage:
                percentage,

              discountedPrice,

              startsAt,

              expiresAt,
            },
          );

        /* ====================================================
           KEEP LOCAL DEAL STATE UPDATED
        ==================================================== */

        setActiveDeal({
          id:
            dealReference.id,

          productId,

          workerId:
            worker.uid,

          originalPrice,

          discountedPrice,

          discountPercentage:
            percentage,

          status:
            "active",

          startsAt,

          expiresAt,
        });

        setInitialDiscountDays(
          String(
            days,
          ),
        );

        setDiscountSaving(
          false,
        );

        Alert.alert(
          "Discount Updated",
          `Your product now has a ${percentage}% discount for ${days} day${
            days === 1
              ? ""
              : "s"
          }.`,
        );
      } catch (error) {
        console.error(
          "PRODUCT_DISCOUNT_UPDATE_ERROR:",
          error,
        );

        setDiscountSaving(
          false,
        );

        Alert.alert(
          "Error",
          "Unable to update product discount.",
        );
      }
    };

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    /* ========================================================
       PRODUCT
    ======================================================== */

    loading,

    saving,

    product,

    productName,

    setProductName,

    category,

    setCategory,

    price,

    setPrice,

    stock,

    setStock,

    description,

    setDescription,

    featured,

    setFeatured,

    delivery,

    setDelivery,

    condition,

    setCondition,

    /* ========================================================
       IMAGES
    ======================================================== */

    images,

    setImages,

    pickImages,

    removeImage,

    /* ========================================================
       SAVE
    ======================================================== */

    onSave,

    /* ========================================================
       DISCOUNT
    ======================================================== */

    discount,

    setDiscount,

    discountDays,

    setDiscountDays,

    discountSaving,

    activateDiscount,
  };
}