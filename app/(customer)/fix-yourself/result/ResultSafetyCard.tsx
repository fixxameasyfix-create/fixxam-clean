import React from "react";

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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  safety: string;

  emergency: boolean;

  professionalRequired: boolean;
}

export default function ResultSafetyCard({
  safety,
  emergency,
  professionalRequired,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={18}
            color={CustomerColors.primary}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Safety Information
        </AppText>
      </View>

      <View style={styles.safetyBox}>
        <AppText style={styles.safetyText}>
          {safety}
        </AppText>
      </View>

      {emergency && (
        <View
          style={[
            styles.notice,
            styles.emergencyNotice,
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={18}
            color={CustomerColors.error}
            style={styles.noticeIcon}
          />

          <View style={styles.content}>
            <AppText
              weight="bold"
              color={CustomerColors.error}
            >
              Emergency
            </AppText>

            <AppText
              style={styles.description}
            >
              Stop using the equipment
              immediately and make the
              area safe.
            </AppText>
          </View>
        </View>
      )}

      {professionalRequired && (
        <View
          style={[
            styles.notice,
            styles.professionalNotice,
          ]}
        >
          <MaterialCommunityIcons
            name="account-hard-hat"
            size={18}
            color={
              CustomerColors.warning
            }
            style={styles.noticeIcon}
          />

          <View style={styles.content}>
            <AppText
              weight="bold"
              color={
                CustomerColors.warning
              }
            >
              Professional Required
            </AppText>

            <AppText
              style={styles.description}
            >
              Professional tools or
              technical experience are
              required for this repair.
            </AppText>
          </View>
        </View>
      )}
    </AppCard>
  );
}

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 2,
    },

    iconContainer: {
      width: 34,

      height: 34,

      borderRadius: 17,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        CustomerColors.diagnosisBackground,
    },

    title: {
      marginLeft: 10,
    },

    safetyBox: {
      padding: 12,

      borderRadius: 12,

      backgroundColor:
        CustomerColors.safetyBackground,

      borderWidth: 1,

      borderColor:
        CustomerColors.border,
    },

    safetyText: {
      fontSize: 14,

      lineHeight: 22,

      color:
        CustomerColors.primaryText,
    },

    notice: {
      flexDirection: "row",

      alignItems: "flex-start",

      padding: 12,

      borderRadius: 12,

      borderWidth: 1,
    },

    emergencyNotice: {
      backgroundColor:
        CustomerColors.emergencyBackground,

      borderColor:
        CustomerColors.error,
    },

    professionalNotice: {
      backgroundColor:
        CustomerColors.professionalBackground,

      borderColor:
        CustomerColors.warning,
    },

    noticeIcon: {
      marginTop: 2,

      marginRight: 10,
    },

    content: {
      flex: 1,
    },

    description: {
      marginTop: 2,

      fontSize: 14,

      lineHeight: 20,

      color:
        CustomerColors.primaryText,
    },
  });