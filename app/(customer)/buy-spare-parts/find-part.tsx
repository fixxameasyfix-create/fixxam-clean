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
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const PROCESSING_DURATION = 5400;

const COMPLETION_DELAY =
  FixxamTokens.motion.normal;

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
   SCREEN
============================================================== */

export default function FindPartScreen() {
  const insets =
    useSafeAreaInsets();

  /* ============================================================
     PARAMS
  ============================================================ */

  const params =
    useLocalSearchParams<FindPartParams>();

  const photoUri =
    useMemo(
      () =>
        String(
          params.photoUri ??
            "",
        ).trim(),
      [
        params.photoUri,
      ],
    );

  const description =
    useMemo(
      () =>
        String(
          params.description ??
            "",
        ).trim(),
      [
        params.description,
      ],
    );

  const source =
    useMemo(
      () =>
        String(
          params.source ??
            "",
        ).trim(),
      [
        params.source,
      ],
    );

  const equipmentId =
    useMemo(
      () =>
        String(
          params.equipmentId ??
            "",
        ).trim(),
      [
        params.equipmentId,
      ],
    );

  const equipmentName =
    useMemo(
      () =>
        String(
          params.equipmentName ??
            "",
        ).trim(),
      [
        params.equipmentName,
      ],
    );

  const brandId =
    useMemo(
      () =>
        String(
          params.brandId ??
            "",
        ).trim(),
      [
        params.brandId,
      ],
    );

  const brandName =
    useMemo(
      () =>
        String(
          params.brandName ??
            "",
        ).trim(),
      [
        params.brandName,
      ],
    );

  /* ============================================================
     SEARCH TYPE
  ============================================================ */

  const isPhotoSearch =
    source === "photo" ||
    Boolean(
      photoUri,
    );

  const isDescriptionSearch =
    source ===
      "description" ||
    Boolean(
      description,
    );

  const isEquipmentSearch =
    source ===
      "equipment" ||
    Boolean(
      equipmentId,
    ) ||
    Boolean(
      brandId,
    );

  const hasSearchInput =
    isPhotoSearch ||
    isDescriptionSearch ||
    isEquipmentSearch;

  /* ============================================================
     STATE
  ============================================================ */

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(true);

  /* ============================================================
     TIMER
  ============================================================ */

  const processingTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const completionTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ============================================================
     CLEANUP
  ============================================================ */

  const cleanupTimers =
    useCallback(() => {
      if (
        processingTimerRef.current
      ) {
        clearTimeout(
          processingTimerRef.current,
        );

        processingTimerRef.current =
          null;
      }

      if (
        completionTimerRef.current
      ) {
        clearTimeout(
          completionTimerRef.current,
        );

        completionTimerRef.current =
          null;
      }
    }, []);

  /* ============================================================
     OPEN PRODUCTS
  ============================================================ */

  const openProducts =
    useCallback(() => {
      if (
        !hasSearchInput
      ) {
        if (
          router.canGoBack()
        ) {
          router.back();

          return;
        }

        router.replace(
          "/(customer)/buy-spare-parts/spare-products",
        );

        return;
      }

      router.replace({
        pathname:
          "/(customer)/buy-spare-parts/spare-products",

        params: {
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

          ...(equipmentId
            ? {
                equipmentId,
              }
            : {}),

          ...(equipmentName
            ? {
                equipmentName,
              }
            : {}),

          ...(brandId
            ? {
                brandId,
              }
            : {}),

          ...(brandName
            ? {
                brandName,
              }
            : {}),
        },
      });
    }, [
      brandId,
      brandName,
      description,
      equipmentId,
      equipmentName,
      hasSearchInput,
      photoUri,
      source,
    ]);

  /* ============================================================
     PROCESSING
  ============================================================ */

  useEffect(() => {
    if (
      !hasSearchInput
    ) {
      openProducts();

      return;
    }

    let cancelled =
      false;

    setIsProcessing(
      true,
    );

    processingTimerRef.current =
      setTimeout(
        () => {
          if (
            cancelled
          ) {
            return;
          }

          setIsProcessing(
            false,
          );

          completionTimerRef.current =
            setTimeout(
              () => {
                if (
                  cancelled
                ) {
                  return;
                }

                openProducts();
              },
              COMPLETION_DELAY,
            );
        },
        PROCESSING_DURATION,
      );

    return () => {
      cancelled =
        true;

      cleanupTimers();
    };
  }, [
    cleanupTimers,
    hasSearchInput,
    openProducts,
  ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      cleanupTimers();

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/buy-spare-parts/spare-products",
      );
    }, [
      cleanupTimers,
    ]);

  /* ============================================================
     TEXT
  ============================================================ */

  const title =
    isEquipmentSearch
      ? "Finding your spare part"
      : "Fixxam is finding your spare part";

  const subtitle =
    useMemo(() => {
      if (
        isEquipmentSearch
      ) {
        const equipment =
          equipmentName ||
          "equipment";

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
        return "Understanding your description and finding compatible parts...";
      }

      return "Analyzing your photo and finding compatible parts...";
    }, [
      brandName,
      equipmentName,
      isDescriptionSearch,
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
              SEARCH ICON
          ================================================== */}

          <View
            style={
              styles.searchCircle
            }
          >
            <View
              style={
                styles.searchIconInner
              }
            >
              <AppIcon
                name="search"
                role="customer"
                size="xl"
                state="active"
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
              STATUS
          ================================================== */}

          <View
            style={
              styles.statusContainer
            }
          >
            {isProcessing ? (
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />
            ) : (
              <View
                style={
                  styles.completedIcon
                }
              >
                <AppIcon
                  name="check"
                  role="customer"
                  size="sm"
                  state="success"
                />
              </View>
            )}

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.statusText
              }
            >
              {isProcessing
                ? "Preparing results..."
                : "Results ready"}
            </AppText>
          </View>

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
                compatible spare parts.
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
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    subtitle: {
      maxWidth: 340,

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

    completedIcon: {
      width: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
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