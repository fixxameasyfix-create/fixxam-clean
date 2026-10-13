import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  customerName?: string | null;

  customerPhone?: string | null;

  /**
   * Kept temporarily for compatibility with the
   * existing parent screen.
   *
   * Order metadata is already shown in the header.
   */
  orderId?: string | null;

  createdDate?: string | null;

  /**
   * Kept temporarily for compatibility.
   * Contact actions are handled by the bottom action section.
   */
  onChat?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return (
    normalized ||
    fallback
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketCustomer({
  customerName,
  customerPhone,
}: Props) {
  const name =
    useMemo(
      () =>
        safeString(
          customerName,
          "Customer",
        ),
      [
        customerName,
      ],
    );

  const phone =
    useMemo(
      () =>
        safeString(
          customerPhone,
          "Phone unavailable",
        ),
      [
        customerPhone,
      ],
    );

  const phoneAvailable =
    phone !==
    "Phone unavailable";

  return (
    <View
      accessible
      accessibilityLabel={
        phoneAvailable
          ? `Customer ${name}. Phone ${phone}.`
          : `Customer ${name}. Phone unavailable.`
      }
      style={
        styles.card
      }
    >
      {/* ======================================================
          CUSTOMER ICON
      ====================================================== */}

      <View
        style={
          styles.iconBox
        }
      >
        <AppIcon
          name="profile"
          size="sm"
          color={
            Colors.info
          }
        />
      </View>

      {/* ======================================================
          CUSTOMER INFO
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.name
          }
        >
          {name}
        </AppText>

        <AppText
          variant="caption"
          numberOfLines={1}
          style={[
            styles.phone,

            !phoneAvailable
              ? styles.phoneUnavailable
              : null,
          ]}
        >
          {phone}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketCustomer.displayName =
  "WorkerMarketCustomer";

export default memo(
  WorkerMarketCustomer,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      minHeight:
        64,

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    name: {
      color:
        Colors.textPrimary,
    },

    phone: {
      marginTop:
        2,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    phoneUnavailable: {
      color:
        Colors.textMuted,
    },
  });