import {
  useCallback,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import createProduct from "@/services/products/createProduct";

import uploadProductImages from "@/services/storage/uploadProductImages";

import createProductDeal from "@/services/deals/createProductDeal";

import useProductImages from "./useProductImages";

/* ============================================================
   CONSTANTS
============================================================ */

const WORKER_PUBLIC_PROFILES_COLLECTION =
  "workerPublicProfiles";

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

/* ============================================================
   HOOK
============================================================ */

export default function useAddProduct() {
  /* ==========================================================
     LOADING
  ========================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ==========================================================
     PRODUCT BASIC INFO
  ========================================================== */

  const [
    productName,
    setProductName,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    stock,
    setStock,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  /* ==========================================================
     SERVICES
  ========================================================== */

  const [
    serviceIds,
    setServiceIds,
  ] = useState<string[]>([]);

  /* ==========================================================
     PRODUCT OPTIONS
  ========================================================== */

  const [
    delivery,
    setDelivery,
  ] = useState(true);

  const [
    condition,
    setCondition,
  ] = useState<
    "new" | "used"
  >("new");

  const [
    featured,
    setFeatured,
  ] = useState(false);

  /* ==========================================================
     DISCOUNT
  ========================================================== */

  const [
    discount,
    setDiscount,
  ] = useState("");

  const [
    discountDays,
    setDiscountDays,
  ] = useState("");

  const [
    discountSaving,
    setDiscountSaving,
  ] = useState(false);

  /* ==========================================================
     PRODUCT IMAGES
  ========================================================== */

  const {
    images,
    setImages,
    pickImages,
    removeImage,
  } = useProductImages();

  /* ==========================================================
     SAVE / PUBLISH PRODUCT
  ========================================================== */

  const onSave =
    useCallback(
      async () => {
        /*
         * Prevent duplicate submissions.
         */
        if (loading) {
          return;
        }

        /* ====================================================
           AUTH
        ==================================================== */

        const worker =
          auth.currentUser;

        if (!worker) {
          Alert.alert(
            "Error",
            "Worker account not found. Please sign in again.",
          );

          return;
        }

        const workerId =
          normalizeString(
            worker.uid,
          );

        if (!workerId) {
          Alert.alert(
            "Error",
            "Invalid worker account. Please sign in again.",
          );

          return;
        }

        /* ====================================================
           VERIFY WORKER PROFILE
           
           Product publishing must come from an
           authenticated Worker account.
        ==================================================== */

        try {
          const workerProfileRef =
            doc(
              db,
              WORKER_PUBLIC_PROFILES_COLLECTION,
              workerId,
            );

          const workerProfileSnap =
            await getDoc(
              workerProfileRef,
            );

          if (
            !workerProfileSnap.exists()
          ) {
            console.error(
              "FIXXAM_WORKER_PROFILE_NOT_FOUND",
              {
                workerId,
              },
            );

            Alert.alert(
              "Worker Verification Required",
              "Your worker profile could not be verified. Please complete your worker profile and try again.",
            );

            return;
          }

          console.log(
            "FIXXAM_WORKER_PUBLISHER_VERIFIED",
            {
              workerId,
            },
          );
        } catch (error) {
          console.error(
            "FIXXAM_WORKER_PROFILE_VERIFY_ERROR:",
            error,
          );

          Alert.alert(
            "Verification Error",
            "We could not verify your worker account. Please try again.",
          );

          return;
        }

        /* ====================================================
           PRODUCT NAME
        ==================================================== */

        const normalizedProductName =
          productName.trim();

        if (
          !normalizedProductName
        ) {
          Alert.alert(
            "Validation",
            "Product name is required.",
          );

          return;
        }

        /* ====================================================
           CATEGORY
        ==================================================== */

        const normalizedCategory =
          category.trim();

        if (
          !normalizedCategory
        ) {
          Alert.alert(
            "Validation",
            "Category is required.",
          );

          return;
        }

        /* ====================================================
           PRICE
        ==================================================== */

        const normalizedPrice =
          price.trim();

        if (
          !normalizedPrice
        ) {
          Alert.alert(
            "Validation",
            "Price is required.",
          );

          return;
        }

        const parsedPrice =
          Number(
            normalizedPrice,
          );

        if (
          !Number.isFinite(
            parsedPrice,
          ) ||
          parsedPrice <= 0
        ) {
          Alert.alert(
            "Validation",
            "Enter a valid product price greater than zero.",
          );

          return;
        }

        /* ====================================================
           STOCK
        ==================================================== */

        const normalizedStock =
          stock.trim();

        const parsedStock =
          normalizedStock === ""
            ? 0
            : Number(
                normalizedStock,
              );

        if (
          !Number.isInteger(
            parsedStock,
          ) ||
          parsedStock < 0
        ) {
          Alert.alert(
            "Validation",
            "Enter a valid stock quantity.",
          );

          return;
        }

        /* ====================================================
           SERVICES
        ==================================================== */

        const normalizedServiceIds =
          Array.from(
            new Set(
              serviceIds
                .filter(
                  (
                    serviceId,
                  ): serviceId is string =>
                    typeof serviceId ===
                    "string",
                )
                .map(
                  (
                    serviceId,
                  ) =>
                    serviceId.trim(),
                )
                .filter(Boolean),
            ),
          );

        if (
          normalizedServiceIds.length ===
          0
        ) {
          Alert.alert(
            "Service Required",
            "Please select at least one service this material can be used for.",
          );

          return;
        }

        /* ====================================================
           DISCOUNT
        ==================================================== */

        const normalizedDiscount =
          discount.trim();

        const normalizedDiscountDays =
          discountDays.trim();

        const hasDiscount =
          normalizedDiscount.length >
            0 ||
          normalizedDiscountDays.length >
            0;

        let discountPercentage = 0;

        let discountDurationDays = 0;

        let discountedPrice =
          parsedPrice;

        let discountStartsAt:
          | Date
          | null = null;

        let discountExpiresAt:
          | Date
          | null = null;

        if (hasDiscount) {
          /* ------------------------------------------------
             BOTH FIELDS REQUIRED
          ------------------------------------------------ */

          if (
            !normalizedDiscount ||
            !normalizedDiscountDays
          ) {
            Alert.alert(
              "Discount Required",
              "Enter both the discount percentage and discount duration.",
            );

            return;
          }

          /* ------------------------------------------------
             PARSE
          ------------------------------------------------ */

          discountPercentage =
            Number(
              normalizedDiscount,
            );

          discountDurationDays =
            Number(
              normalizedDiscountDays,
            );

          /* ------------------------------------------------
             VALIDATE PERCENTAGE
          ------------------------------------------------ */

          if (
            !Number.isFinite(
              discountPercentage,
            ) ||
            discountPercentage <=
              0 ||
            discountPercentage >=
              100
          ) {
            Alert.alert(
              "Invalid Discount",
              "Discount must be between 1% and 99%.",
            );

            return;
          }

          /* ------------------------------------------------
             VALIDATE DURATION
          ------------------------------------------------ */

          if (
            !Number.isInteger(
              discountDurationDays,
            ) ||
            discountDurationDays <
              1 ||
            discountDurationDays >
              365
          ) {
            Alert.alert(
              "Invalid Duration",
              "Discount duration must be between 1 and 365 days.",
            );

            return;
          }

          /* ------------------------------------------------
             CALCULATE DISCOUNT
          ------------------------------------------------ */

          discountedPrice =
            Number(
              (
                parsedPrice -
                parsedPrice *
                  (discountPercentage /
                    100)
              ).toFixed(2),
            );

          if (
            !Number.isFinite(
              discountedPrice,
            ) ||
            discountedPrice <= 0 ||
            discountedPrice >=
              parsedPrice
          ) {
            Alert.alert(
              "Invalid Discount",
              "The calculated discounted price is invalid.",
            );

            return;
          }

          /* ------------------------------------------------
             START
          ------------------------------------------------ */

          discountStartsAt =
            new Date();

          /* ------------------------------------------------
             EXPIRATION
          ------------------------------------------------ */

          discountExpiresAt =
            new Date(
              discountStartsAt.getTime() +
                discountDurationDays *
                  24 *
                  60 *
                  60 *
                  1000,
            );
        }

        /* ====================================================
           SAVE
        ==================================================== */

        try {
          setLoading(true);

          /* ==================================================
             UPLOAD PRODUCT IMAGES
          ================================================== */

          let uploadedImages: {
            thumbnail: string;
            images: string[];
          } = {
            thumbnail: "",
            images: [],
          };

          if (
            images.length > 0
          ) {
            uploadedImages =
              await uploadProductImages(
                images,
                workerId,
              );
          }

          /* ==================================================
             FINAL WORKER OWNERSHIP CHECK
          ================================================== */

          const authenticatedWorkerId =
            normalizeString(
              auth.currentUser?.uid,
            );

          if (
            !authenticatedWorkerId ||
            authenticatedWorkerId !==
              workerId
          ) {
            throw new Error(
              "Worker authentication changed. Please try again.",
            );
          }

          /* ==================================================
             CREATE PRODUCT
          ================================================== */

          const productId =
            await createProduct({
              /*
               * CRITICAL:
               *
               * workerId ALWAYS comes from
               * Firebase Auth.
               */
              workerId:
                authenticatedWorkerId,

              storeId:
                "",

              name:
                normalizedProductName,

              description:
                description.trim(),

              category:
                normalizedCategory,

              price:
                parsedPrice,

              stock:
                parsedStock,

              thumbnail:
                uploadedImages.thumbnail,

              images:
                uploadedImages.images,

              delivery,

              condition,

              featured,

              serviceIds:
                normalizedServiceIds,
            });

          /* ==================================================
             PRODUCT ID VALIDATION
          ================================================== */

          const normalizedProductId =
            normalizeString(
              productId,
            );

          if (
            !normalizedProductId
          ) {
            throw new Error(
              "Product was created but no product ID was returned.",
            );
          }

          console.log(
            "FIXXAM_PRODUCT_CREATED",
            {
              productId:
                normalizedProductId,

              workerId:
                authenticatedWorkerId,

              productName:
                normalizedProductName,
            },
          );

          /* ==================================================
             CREATE ACTIVE PRODUCT DEAL
          ================================================== */

          if (
            hasDiscount &&
            discountStartsAt &&
            discountExpiresAt
          ) {
            setDiscountSaving(
              true,
            );

            try {
              await createProductDeal(
                {
                  productId:
                    normalizedProductId,

                  workerId:
                    authenticatedWorkerId,

                  originalPrice:
                    parsedPrice,

                  discountedPrice:
                    discountedPrice,

                  discountPercentage:
                    discountPercentage,

                  startsAt:
                    discountStartsAt,

                  expiresAt:
                    discountExpiresAt,
                },
              );

              console.log(
                "FIXXAM_PRODUCT_DEAL_CREATED",
                {
                  productId:
                    normalizedProductId,

                  workerId:
                    authenticatedWorkerId,

                  originalPrice:
                    parsedPrice,

                  discountedPrice:
                    discountedPrice,

                  discountPercentage:
                    discountPercentage,

                  startsAt:
                    discountStartsAt,

                  expiresAt:
                    discountExpiresAt,
                },
              );
            } finally {
              setDiscountSaving(
                false,
              );
            }
          }

          /* ==================================================
             SUCCESS
          ================================================== */

          const successMessage =
            hasDiscount
              ? `Product published with a ${discountPercentage}% discount.`
              : "Product added successfully.";

          Alert.alert(
            "Success",
            successMessage,
            [
              {
                text: "OK",
                onPress: () =>
                  router.back(),
              },
            ],
            {
              cancelable:
                false,
            },
          );
        } catch (
          error: unknown
        ) {
          console.error(
            "FIXXAM_ADD_PRODUCT_ERROR:",
            error,
          );

          const message =
            error instanceof Error
              ? error.message
              : "Unable to add product. Please try again.";

          Alert.alert(
            "Unable to Publish",
            message,
          );
        } finally {
          setLoading(false);
          setDiscountSaving(
            false,
          );
        }
      },
      [
        loading,
        productName,
        category,
        price,
        stock,
        description,
        serviceIds,
        images,
        delivery,
        condition,
        featured,
        discount,
        discountDays,
      ],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    /* ----------------------------------------------------------
       LOADING
    ---------------------------------------------------------- */

    loading,

    /* ----------------------------------------------------------
       PRODUCT
    ---------------------------------------------------------- */

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

    /* ----------------------------------------------------------
       SERVICES
    ---------------------------------------------------------- */

    serviceIds,
    setServiceIds,

    /* ----------------------------------------------------------
       IMAGES
    ---------------------------------------------------------- */

    images,
    setImages,

    pickImages,
    removeImage,

    /* ----------------------------------------------------------
       OPTIONS
    ---------------------------------------------------------- */

    delivery,
    setDelivery,

    condition,
    setCondition,

    featured,
    setFeatured,

    /* ----------------------------------------------------------
       DISCOUNT
    ---------------------------------------------------------- */

    discount,
    setDiscount,

    discountDays,
    setDiscountDays,

    discountSaving,

    /* ----------------------------------------------------------
       SAVE
    ---------------------------------------------------------- */

    onSave,
  };
}