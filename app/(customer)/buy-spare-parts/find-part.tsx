import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  identifySparePart,
} from "@/services/ai-booking/identifySpareParts";

import {
  getSparePartErrorPresentation,
  getSparePartRejectionPresentation,
  type SparePartErrorPresentation,
} from "@/services/spare-parts/sparePartErrors";

import {
  imageToBase64,
} from "@/utils/aiBooking/imageToBase64";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type FindPartParams = {
  photoUri?: string;

  description?: string;

  source?: string;

  equipmentId?: string;

  equipmentName?: string;

  brandId?: string;

  brandName?: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanParam(
  value: unknown,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return String(
      value[0] ?? "",
    ).trim();
  }

  return String(
    value ?? "",
  ).trim();
}

/* ==============================================================
   SCREEN
============================================================== */

export default function FindPartScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<
      FindPartParams
    >();

  /* ============================================================
     PARAMS
  ============================================================ */

  const photoUri =
    useMemo(
      () =>
        cleanParam(
          params.photoUri,
        ),
      [
        params.photoUri,
      ],
    );

  const description =
    useMemo(
      () =>
        cleanParam(
          params.description,
        ),
      [
        params.description,
      ],
    );

  const source =
    useMemo(
      () =>
        cleanParam(
          params.source,
        ),
      [
        params.source,
      ],
    );

  const equipmentId =
    useMemo(
      () =>
        cleanParam(
          params.equipmentId,
        ),
      [
        params.equipmentId,
      ],
    );

  const equipmentName =
    useMemo(
      () =>
        cleanParam(
          params.equipmentName,
        ),
      [
        params.equipmentName,
      ],
    );

  const brandId =
    useMemo(
      () =>
        cleanParam(
          params.brandId,
        ),
      [
        params.brandId,
      ],
    );

  const brandName =
    useMemo(
      () =>
        cleanParam(
          params.brandName,
        ),
      [
        params.brandName,
      ],
    );

  /* ============================================================
     INPUT TYPES
  ============================================================ */

  const hasPhoto =
    Boolean(
      photoUri,
    );

  const hasDescription =
    Boolean(
      description,
    );

  const hasEquipment =
    Boolean(
      equipmentId ||
      equipmentName ||
      brandId ||
      brandName,
    );

  const inputCount =
    [
      hasPhoto,
      hasDescription,
      hasEquipment,
    ].filter(
      Boolean,
    ).length;

  const isCombinedSearch =
    inputCount > 1;

  const isPhotoSearch =
    hasPhoto &&
    !isCombinedSearch;

  const isDescriptionSearch =
    hasDescription &&
    !isCombinedSearch;

  const isEquipmentSearch =
    hasEquipment &&
    !isCombinedSearch;

  const hasSearchInput =
    hasPhoto ||
    hasDescription ||
    hasEquipment;

  /* ============================================================
     STATE
  ============================================================ */

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      SparePartErrorPresentation | null
    >(
      null,
    );

  /*
   * Prevent old asynchronous requests from
   * modifying state after navigation/retry.
   */
  const requestIdRef =
    useRef(
      0,
    );

  /* ============================================================
     OPEN PRODUCTS
  ============================================================ */

  const openProducts =
    useCallback(
      ({
        partName,
        resolvedEquipmentId,
        resolvedEquipmentName,
        resolvedBrandId,
        resolvedBrandName,
        category,
        searchQuery,
        keywords,
        confidence,
        mode,
      }: {
        partName: string;

        resolvedEquipmentId: string;

        resolvedEquipmentName: string;

        resolvedBrandId: string;

        resolvedBrandName: string;

        category: string;

        searchQuery: string;

        keywords: string[];

        confidence: number;

        mode: string;
      }) => {
        router.replace({
          pathname:
            "/(customer)/buy-spare-parts/spare-products",

          params: {
            /* ----------------------------------------------
               ORIGINAL INPUT
            ---------------------------------------------- */

            ...(photoUri
              ? {
                  photoUri,
                }
              : {}),

            ...(description
              ? {
                  description,
                }
              : {}),

            ...(source
              ? {
                  source,
                }
              : {}),

            /* ----------------------------------------------
               EQUIPMENT
            ---------------------------------------------- */

            ...(resolvedEquipmentId
              ? {
                  equipmentId:
                    resolvedEquipmentId,
                }
              : {}),

            ...(resolvedEquipmentName
              ? {
                  equipmentName:
                    resolvedEquipmentName,
                }
              : {}),

            /* ----------------------------------------------
               BRAND
            ---------------------------------------------- */

            ...(resolvedBrandId
              ? {
                  brandId:
                    resolvedBrandId,
                }
              : {}),

            ...(resolvedBrandName
              ? {
                  brandName:
                    resolvedBrandName,
                }
              : {}),

            /* ----------------------------------------------
               AI RESULT
            ---------------------------------------------- */

            ...(partName
              ? {
                  aiPartName:
                    partName,
                }
              : {}),

            ...(category
              ? {
                  aiCategory:
                    category,
                }
              : {}),

            ...(searchQuery
              ? {
                  aiSearchQuery:
                    searchQuery,
                }
              : {}),

            ...(keywords.length >
            0
              ? {
                  aiKeywords:
                    JSON.stringify(
                      keywords,
                    ),
                }
              : {}),

            aiConfidence:
              String(
                confidence,
              ),

            aiMode:
              mode,
          },
        });
      },
      [
        description,
        photoUri,
        source,
      ],
    );

  /* ============================================================
     RUN SEARCH
  ============================================================ */

  const runSearch =
    useCallback(
      async () => {
        const requestId =
          ++requestIdRef.current;

        /* ======================================================
           INPUT VALIDATION
        ====================================================== */

        if (
          !hasSearchInput
        ) {
          setIsProcessing(
            false,
          );

          setError({
            title:
              "Add search information",

            message:
              "Please add a photo, describe the spare part, or select your equipment.",

            retryable:
              false,
          });

          return;
        }

        setError(
          null,
        );

        setIsProcessing(
          true,
        );

        try {
          /* ====================================================
             PREPARE PHOTO
          ==================================================== */

          let imageBase64:
            string | undefined;

          let mimeType:
            string | undefined;

          if (
            hasPhoto
          ) {
            const preparedImage =
              await imageToBase64(
                photoUri,
              );

            if (
              requestId !==
              requestIdRef.current
            ) {
              return;
            }

            imageBase64 =
              preparedImage.base64;

            mimeType =
              preparedImage.mimeType;
          }

          /* ====================================================
             AI / EQUIPMENT RESOLUTION
          ==================================================== */

          const result =
            await identifySparePart({
              imageBase64,

              mimeType,

              description:
                description ||
                undefined,

              equipmentId:
                equipmentId ||
                undefined,

              equipmentName:
                equipmentName ||
                undefined,

              brandId:
                brandId ||
                undefined,

              brandName:
                brandName ||
                undefined,
            });

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          /* ====================================================
             AI REJECTION
          ==================================================== */

          if (
            !result.success ||
            result.rejected ||
            !result.completed
          ) {
            setIsProcessing(
              false,
            );

            setError(
              getSparePartRejectionPresentation(
                result.reason,
                result.message,
              ),
            );

            return;
          }

          /* ====================================================
             SUCCESS
          ==================================================== */

          setIsProcessing(
            false,
          );

          openProducts({
            partName:
              result.partName,

            resolvedEquipmentId:
              result.equipmentId ||
              equipmentId,

            resolvedEquipmentName:
              result.equipmentName ||
              equipmentName,

            resolvedBrandId:
              result.brandId ||
              brandId,

            resolvedBrandName:
              result.brandName ||
              brandName,

            category:
              result.category,

            searchQuery:
              result.searchQuery,

            keywords:
              result.keywords,

            confidence:
              result.confidence,

            mode:
              result.mode,
          });
        } catch (
          searchError: unknown
        ) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          if (__DEV__) {
            console.warn(
              "[FIND_SPARE_PART] Search failed",
              {
                name:
                  searchError instanceof
                  Error
                    ? searchError.name
                    : "",

                message:
                  searchError instanceof
                  Error
                    ? searchError.message
                    : "Unknown spare-part search error.",
              },
            );
          }

          setIsProcessing(
            false,
          );

          setError(
            getSparePartErrorPresentation(
              searchError,
            ),
          );
        }
      },
      [
        brandId,
        brandName,
        description,
        equipmentId,
        equipmentName,
        hasPhoto,
        hasSearchInput,
        openProducts,
        photoUri,
      ],
    );

  /* ============================================================
     INITIAL SEARCH
  ============================================================ */

  useEffect(() => {
    void runSearch();

    return () => {
      requestIdRef.current +=
        1;
    };
  }, [
    runSearch,
  ]);

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      if (
        isProcessing
      ) {
        return;
      }

      void runSearch();
    }, [
      isProcessing,
      runSearch,
    ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      requestIdRef.current +=
        1;

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/buy-spare-parts/spare-products",
      );
    }, []);

  /* ============================================================
     TITLE
  ============================================================ */

  const title =
    useMemo(() => {
      if (error) {
        return error.title;
      }

      if (
        isCombinedSearch
      ) {
        return "Fixxam is finding your spare part";
      }

      if (
        isEquipmentSearch
      ) {
        return "Finding parts for your equipment";
      }

      if (
        isDescriptionSearch
      ) {
        return "Fixxam is understanding your spare part";
      }

      return "Fixxam is finding your spare part";
    }, [
      error,
      isCombinedSearch,
      isDescriptionSearch,
      isEquipmentSearch,
    ]);

  /* ============================================================
     SUBTITLE
  ============================================================ */

  const subtitle =
    useMemo(() => {
      if (error) {
        return error.message;
      }

      if (
        isCombinedSearch
      ) {
        return "Analyzing your information and finding the best matching spare parts...";
      }

      if (
        isEquipmentSearch
      ) {
        const equipment =
          equipmentName ||
          "selected equipment";

        if (
          brandName
        ) {
          return `Finding compatible ${brandName} parts for your ${equipment}...`;
        }

        return `Finding compatible parts for your ${equipment}...`;
      }

      if (
        isDescriptionSearch
      ) {
        return "Understanding your description and finding matching spare parts...";
      }

      if (
        isPhotoSearch
      ) {
        return "Analyzing your photo and finding compatible spare parts...";
      }

      return "Preparing your spare-part search...";
    }, [
      brandName,
      equipmentName,
      error,
      isCombinedSearch,
      isDescriptionSearch,
      isEquipmentSearch,
      isPhotoSearch,
    ]);

  /* ============================================================
     STATUS
  ============================================================ */

  const statusText =
    useMemo(() => {
      if (
        isEquipmentSearch
      ) {
        return "Checking compatible parts...";
      }

      if (
        hasPhoto &&
        hasDescription
      ) {
        return "Analyzing photo and description...";
      }

      if (
        hasPhoto
      ) {
        return "Analyzing photo...";
      }

      if (
        hasDescription
      ) {
        return "Understanding description...";
      }

      return "Preparing results...";
    }, [
      hasDescription,
      hasPhoto,
      isEquipmentSearch,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            BACK
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to the previous screen"
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            {
              top:
                Math.max(
                  insets.top,
                  FixxamTokens
                    .spacing.sm,
                ),
            },

            pressed
              ? styles.backButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="sm"
            state="default"
          />
        </Pressable>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.content
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={[
              styles.searchCircle,

              error
                ? styles.searchCircleError
                : null,
            ]}
          >
            <View
              style={
                styles.searchIconInner
              }
            >
              <AppIcon
                name={
                  error
                    ? "warning"
                    : "search"
                }
                role="customer"
                size="xl"
                state={
                  error
                    ? "error"
                    : "active"
                }
              />
            </View>
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading1"
            weight="bold"
            center
            style={
              styles.title
            }
          >
            {title}
          </AppText>

          {/* ==================================================
              SUBTITLE
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.subtitle
            }
          >
            {subtitle}
          </AppText>

          {/* ==================================================
              PROCESSING
          ================================================== */}

          {!error ? (
            <View
              style={
                styles.statusContainer
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.statusText
                }
              >
                {statusText}
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              ERROR ACTION
          ================================================== */}

          {error?.retryable ? (
            <AppButton
              title="Try Again"
              role="customer"
              leftIconName="refresh"
              disabled={
                isProcessing
              }
              onPress={
                handleRetry
              }
              style={
                styles.retryButton
              }
            />
          ) : null}

          {/* ==================================================
              REASSURANCE
          ================================================== */}

          <View
            style={
              styles.infoCard
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="shield"
                role="customer"
                size="sm"
                state="success"
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.infoTitle
                }
              >
                You're still in control
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.infoText
                }
              >
                Fixxam will only prepare
                matching spare parts.
                Nothing is ordered until
                you choose a product.
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        Colors.surface,

      alignItems:
        "center",
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.lg,

      zIndex: 10,

      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      width: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchCircle: {
      width: 92,

      height: 92,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    searchCircleError: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    searchIconInner: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    title: {
      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    subtitle: {
      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusContainer: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    statusText: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    retryButton: {
      minWidth: 180,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      width: "100%",

      maxWidth: 420,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    infoIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.success,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });