import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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

import {
  AppButton,
  AppCard,
  AppText,
} from "@/components/ui";

import {
  db,
} from "@/firebase/config";

import {
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
};

/* ==============================================================
   DEFAULTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  "#2563EB";

const DEFAULT_SERVICE_BACKGROUND =
  "#EFF6FF";

/* ==============================================================
   STRING HELPER
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
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
      /* ========================================================
         SERVICE ID
      ======================================================== */

      const resolvedServiceId =
        cleanString(
          serviceId,
        );

      if (!resolvedServiceId) {
        Alert.alert(
          "Service unavailable",
          "The selected service could not be identified.",
        );

        console.error(
          "RESULT_ACTIONS_MISSING_SERVICE_ID",
          {
            serviceId,
            serviceName,
          },
        );

        return;
      }

      if (loading) {
        return;
      }

      setLoading(true);

      try {
        /* ======================================================
           START WITH PASSED VALUES
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

        /* ======================================================
           LOAD EXACT SERVICE DOCUMENT
           
           This is the important fix.
           
           services/{serviceId}
           
           gives us the exact:
           - name
           - icon
           - color
           - backgroundColor
           - categoryId
        ====================================================== */

        try {
          const serviceRef =
            doc(
              db,
              "services",
              resolvedServiceId,
            );

          const serviceSnapshot =
            await getDoc(
              serviceRef,
            );

          if (
            serviceSnapshot.exists()
          ) {
            const serviceData =
              serviceSnapshot.data() as ServiceDocument;

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

            /*
             * Firestore is authoritative.
             *
             * This guarantees the same icon
             * used by CategoryCard / ServicesGrid.
             */

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
          } else {
            console.warn(
              "SERVICE_DOCUMENT_NOT_FOUND",
              {
                serviceId:
                  resolvedServiceId,
              },
            );
          }
        } catch (
          serviceError
        ) {
          /*
           * Do not break navigation just
           * because service metadata read failed.
           *
           * We keep the values supplied by
           * the AI result as fallback.
           */

          console.error(
            "LOAD_SERVICE_METADATA_ERROR",
            serviceError,
          );
        }

        /* ======================================================
           FINAL VALIDATION
        ====================================================== */

        if (
          !resolvedServiceName
        ) {
          Alert.alert(
            "Service unavailable",
            "The selected service name could not be identified.",
          );

          console.error(
            "RESULT_ACTIONS_MISSING_SERVICE_NAME",
            {
              serviceId:
                resolvedServiceId,
              serviceName,
            },
          );

          return;
        }

        /* ======================================================
           DEBUG
        ====================================================== */

        console.log(
          "BOOK_PROFESSIONAL_RESOLVED_SERVICE",
          {
            serviceId:
              resolvedServiceId,

            serviceName:
              resolvedServiceName,

            serviceIcon:
              resolvedServiceIcon,

            serviceColor:
              resolvedServiceColor,

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            categoryId:
              resolvedCategoryId,
          },
        );

        /* ======================================================
           NAVIGATE TO WORKERS
        ====================================================== */

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /* --------------------------------------------------
               ROUTE ID
            -------------------------------------------------- */

            id:
              resolvedServiceId,

            /* --------------------------------------------------
               SERVICE ID
            -------------------------------------------------- */

            serviceId:
              resolvedServiceId,

            /* --------------------------------------------------
               SERVICE NAME
            -------------------------------------------------- */

            serviceName:
              resolvedServiceName,

            /* --------------------------------------------------
               BACKWARD COMPATIBILITY
            -------------------------------------------------- */

            service:
              resolvedServiceName,

            /* --------------------------------------------------
               EXACT SERVICE ICON
            -------------------------------------------------- */

            serviceIcon:
              resolvedServiceIcon,

            /* --------------------------------------------------
               EXACT SERVICE COLOR
            -------------------------------------------------- */

            serviceColor:
              resolvedServiceColor,

            /* --------------------------------------------------
               EXACT SERVICE BACKGROUND
            -------------------------------------------------- */

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            /* --------------------------------------------------
               CATEGORY
            -------------------------------------------------- */

            ...(resolvedCategoryId
              ? {
                  categoryId:
                    resolvedCategoryId,
                }
              : {}),
          },
        });
      } catch (
        error
      ) {
        console.error(
          "BOOK_PROFESSIONAL_NAVIGATION_ERROR",
          error,
        );

        Alert.alert(
          "Unable to continue",
          "We could not open the professional list. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      serviceId,
      serviceName,
      serviceIcon,
      serviceColor,
      serviceBackgroundColor,
      categoryId,
      loading,
    ]);

  /* ============================================================
     TRY AGAIN
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
      problem,
      loading,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard
      style={
        styles.card
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={16}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={
            styles.title
          }
        >
          Next Action
        </AppText>
      </View>

      {/* ========================================================
          BUTTONS
      ======================================================== */}

      <View
        style={
          styles.buttons
        }
      >
        {!!serviceId && (
          <AppButton
            title={
              loading
                ? "Opening..."
                : professionalRequired
                ? "Book Professional"
                : "Find Professionals"
            }
            onPress={
              handleBookProfessional
            }
            disabled={
              loading
            }
            style={
              styles.primaryButton
            }
            leftIcon={
              loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : undefined
            }
          />
        )}

        <AppButton
          title="Analyze Again"
          onPress={
            handleTryAgain
          }
          disabled={
            loading
          }
          variant="outline"
          style={
            styles.secondaryButton
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

      gap: 10,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconContainer: {
      width: 30,

      height: 30,

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        CustomerColors.diagnosisBackground,
    },

    title: {
      marginLeft: 8,

      fontSize: 17,
    },

    buttons: {
      gap: 8,
    },

    primaryButton: {
      width: "100%",

      minHeight: 44,

      borderRadius: 12,
    },

    secondaryButton: {
      width: "100%",

      minHeight: 44,

      borderRadius: 12,
    },
  });