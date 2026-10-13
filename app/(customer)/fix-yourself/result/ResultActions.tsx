import React, {
  useCallback,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import Toast from "react-native-toast-message";

import {
  AppButton,
  AppCard,
  AppText,
} from "@/components/ui";

import {
  db,
} from "@/firebase/config";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface ResultActionsProps {
  problem: string;

  serviceId?: string;

  serviceName?: string;

  serviceIcon?: string;

  serviceColor?: string;

  serviceBackgroundColor?: string;

  categoryId?: string;

  professionalRequired: boolean;
}

type ServiceDocument = {
  name?: unknown;

  icon?: unknown;

  color?: unknown;

  backgroundColor?: unknown;

  categoryId?: unknown;

  fulfillmentMode?: unknown;
};

/* ==============================================================
   DEFAULTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  CustomerColors.primary;

const DEFAULT_SERVICE_BACKGROUND =
  CustomerColors.primarySoft;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function ResultActions({
  problem,
  serviceId,
  serviceName,
  serviceIcon,
  serviceColor,
  serviceBackgroundColor,
  categoryId,
  professionalRequired,
}: ResultActionsProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ============================================================
     BOOK PROFESSIONAL
  ============================================================ */

  const handleBookProfessional =
    useCallback(async () => {
      if (loading) {
        return;
      }

      const resolvedServiceId =
        cleanString(
          serviceId,
        );

      if (!resolvedServiceId) {
        Toast.show({
          type: "error",

          text1:
            "Service unavailable",

          text2:
            "The selected service could not be identified.",
        });

        return;
      }

      setLoading(true);

      try {
        /* ======================================================
           FALLBACK DISPLAY DATA FROM AI RESULT
        ====================================================== */

        let resolvedServiceName =
          cleanString(
            serviceName,
          );

        let resolvedServiceIcon =
          cleanString(
            serviceIcon,
          ) ||
          DEFAULT_SERVICE_ICON;

        let resolvedServiceColor =
          cleanString(
            serviceColor,
          ) ||
          DEFAULT_SERVICE_COLOR;

        let resolvedServiceBackgroundColor =
          cleanString(
            serviceBackgroundColor,
          ) ||
          DEFAULT_SERVICE_BACKGROUND;

        let resolvedCategoryId =
          cleanString(
            categoryId,
          );

        /*
         * IMPORTANT:
         * Fulfillment mode must come from
         * the authoritative service document.
         *
         * Do not infer it from the AI result.
         */
        let resolvedFulfillmentMode:
          ServiceFulfillmentMode | null =
          null;

        /* ======================================================
           LOAD AUTHORITATIVE SERVICE METADATA
        ====================================================== */

        const serviceRef =
          doc(
            db,
            "services",
            resolvedServiceId,
          );

        let serviceSnapshot;

        try {
          serviceSnapshot =
            await getDoc(
              serviceRef,
            );
        } catch (
          metadataError
        ) {
          console.error(
            "LOAD_SERVICE_METADATA_ERROR:",
            metadataError,
          );

          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "We could not verify this service. Please try again.",
          });

          return;
        }

        /* ======================================================
           AUTHORITATIVE SERVICE MUST EXIST
        ====================================================== */

        if (
          !serviceSnapshot.exists()
        ) {
          console.error(
            "SERVICE_DOCUMENT_NOT_FOUND:",
            resolvedServiceId,
          );

          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "This service is no longer available for booking.",
          });

          return;
        }

        const serviceData =
          serviceSnapshot.data() as ServiceDocument;

        /* ======================================================
           DISPLAY METADATA
        ====================================================== */

        const firestoreName =
          cleanString(
            serviceData.name,
          );

        const firestoreIcon =
          cleanString(
            serviceData.icon,
          );

        const firestoreColor =
          cleanString(
            serviceData.color,
          );

        const firestoreBackground =
          cleanString(
            serviceData.backgroundColor,
          );

        const firestoreCategoryId =
          cleanString(
            serviceData.categoryId,
          );

        if (firestoreName) {
          resolvedServiceName =
            firestoreName;
        }

        if (firestoreIcon) {
          resolvedServiceIcon =
            firestoreIcon;
        }

        if (firestoreColor) {
          resolvedServiceColor =
            firestoreColor;
        }

        if (
          firestoreBackground
        ) {
          resolvedServiceBackgroundColor =
            firestoreBackground;
        }

        if (
          firestoreCategoryId
        ) {
          resolvedCategoryId =
            firestoreCategoryId;
        }

        /* ======================================================
           AUTHORITATIVE FULFILLMENT MODE
        ====================================================== */

        if (
          isServiceFulfillmentMode(
            serviceData.fulfillmentMode,
          )
        ) {
          resolvedFulfillmentMode =
            serviceData.fulfillmentMode;
        }

        /* ======================================================
           FINAL VALIDATION
        ====================================================== */

        if (
          !resolvedServiceName
        ) {
          Toast.show({
            type: "error",

            text1:
              "Service unavailable",

            text2:
              "The selected service name could not be identified.",
          });

          return;
        }

        if (
          !resolvedFulfillmentMode ||
          resolvedFulfillmentMode ===
            "needs_review"
        ) {
          console.error(
            "SERVICE_FULFILLMENT_MODE_UNAVAILABLE:",
            {
              serviceId:
                resolvedServiceId,

              fulfillmentMode:
                serviceData.fulfillmentMode,
            },
          );

          Toast.show({
            type: "error",

            text1:
              "Booking unavailable",

            text2:
              "This service is not configured for booking yet.",
          });

          return;
        }

        /* ======================================================
           NAVIGATION
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            id:
              resolvedServiceId,

            serviceId:
              resolvedServiceId,

            serviceName:
              resolvedServiceName,

            service:
              resolvedServiceName,

            serviceIcon:
              resolvedServiceIcon,

            serviceColor:
              resolvedServiceColor,

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            fulfillmentMode:
              resolvedFulfillmentMode,

            ...(resolvedCategoryId
              ? {
                  categoryId:
                    resolvedCategoryId,
                }
              : {}),
          },
        });
      } catch (error) {
        console.error(
          "BOOK_PROFESSIONAL_NAVIGATION_ERROR:",
          error,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to continue",

          text2:
            "We could not open the professional list. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }, [
      categoryId,
      loading,
      serviceBackgroundColor,
      serviceColor,
      serviceIcon,
      serviceId,
      serviceName,
    ]);

  /* ============================================================
     ANALYZE AGAIN
  ============================================================ */

  const handleTryAgain =
    useCallback(() => {
      if (loading) {
        return;
      }

      router.replace({
        pathname:
          "/(customer)/fix-yourself",

        params: {
          problem,
        },
      });
    }, [
      loading,
      problem,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard
      style={styles.card}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={18}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={styles.title}
        >
          Next Action
        </AppText>
      </View>

      {/* ========================================================
          ACTIONS
      ======================================================== */}

      <View
        style={styles.buttons}
      >
        {Boolean(
          cleanString(
            serviceId,
          ),
        ) ? (
          <AppButton
            title={
              professionalRequired
                ? "Book Professional"
                : "Find Professionals"
            }
            role="customer"
            variant="primary"
            loading={loading}
            disabled={loading}
            onPress={
              handleBookProfessional
            }
            style={
              styles.button
            }
          />
        ) : null}

        <AppButton
          title="Analyze Again"
          role="customer"
          variant="outline"
          disabled={loading}
          onPress={
            handleTryAgain
          }
          style={
            styles.button
          }
        />
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.md,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconContainer: {
      width: 36,

      height: 36,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    buttons: {
      gap:
        FixxamTokens.spacing.sm,
    },

    button: {
      width:
        "100%",
    },
  });