import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  safety: string;

  emergency: boolean;

  professionalRequired: boolean;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultSafetyCard({
  safety,
  emergency,
  professionalRequired,
}: Props) {
  const safetyText =
    useMemo(() => {
      const value =
        typeof safety === "string"
          ? safety.trim()
          : "";

      return (
        value ||
        "No additional safety information is available."
      );
    }, [
      safety,
    ]);

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
            name="shield-check-outline"
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
          Safety Information
        </AppText>
      </View>

      {/* ========================================================
          SAFETY INFORMATION
      ======================================================== */}

      <View
        style={styles.safetyBox}
      >
        <MaterialCommunityIcons
          name="shield-check"
          size={18}
          color={
            Colors.success
          }
          style={
            styles.safetyIcon
          }
        />

        <AppText
          variant="body"
          style={
            styles.safetyText
          }
        >
          {safetyText}
        </AppText>
      </View>

      {/* ========================================================
          EMERGENCY
      ======================================================== */}

      {emergency ? (
        <View
          style={[
            styles.notice,
            styles.emergencyNotice,
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={
              Colors.error
            }
            style={
              styles.noticeIcon
            }
          />

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.emergencyTitle
              }
            >
              Emergency
            </AppText>

            <AppText
              variant="body"
              style={
                styles.description
              }
            >
              Stop using the equipment immediately and make the area safe.
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ========================================================
          PROFESSIONAL REQUIRED
      ======================================================== */}

      {professionalRequired ? (
        <View
          style={[
            styles.notice,
            styles.professionalNotice,
          ]}
        >
          <MaterialCommunityIcons
            name="account-hard-hat"
            size={20}
            color={
              Colors.warning
            }
            style={
              styles.noticeIcon
            }
          />

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.professionalTitle
              }
            >
              Professional Required
            </AppText>

            <AppText
              variant="body"
              style={
                styles.description
              }
            >
              Professional tools or technical experience are required for this repair.
            </AppText>
          </View>
        </View>
      ) : null}
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
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",
    },

    iconContainer: {
      width: 34,

      height: 34,

      alignItems: "center",

      justifyContent: "center",

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

    /* ========================================================
       SAFETY
    ======================================================== */

    safetyBox: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    safetyIcon: {
      marginTop: 2,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    safetyText: {
      flex: 1,

      color:
        Colors.textPrimary,

      lineHeight: 22,
    },

    /* ========================================================
       NOTICE
    ======================================================== */

    notice: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.md,
    },

    emergencyNotice: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    professionalNotice: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    noticeIcon: {
      marginTop: 2,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    noticeContent: {
      flex: 1,

      minWidth: 0,
    },

    emergencyTitle: {
      color:
        Colors.error,
    },

    professionalTitle: {
      color:
        Colors.warning,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,

      lineHeight: 20,
    },
  });

export default memo(
  ResultSafetyCard,
);