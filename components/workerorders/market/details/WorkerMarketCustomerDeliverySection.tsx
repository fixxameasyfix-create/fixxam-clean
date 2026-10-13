import React, {
  memo,
} from "react";

import {
  Pressable,
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
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  customerName: string;
  address: string;
  hasGps: boolean;
  onCallCustomer: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanValue(
  value: string | undefined,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketCustomerDeliverySection({
  customerName,
  address,
  hasGps,
  onCallCustomer,
}: Props) {
  const displayCustomerName =
    cleanValue(customerName) ||
    "Customer";

  const displayAddress =
    cleanValue(address) ||
    "Address unavailable";

  return (
    <View style={styles.section}>
      {/* ========================================================
          CUSTOMER HEADER
      ======================================================== */}

      <View style={styles.sectionHeader}>
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.sectionTitle}
        >
          Customer
        </AppText>
      </View>

      {/* ========================================================
          CUSTOMER ROW
      ======================================================== */}

      <View style={styles.customerRow}>
        {/* CUSTOMER ICON */}

        <View style={styles.customerIcon}>
          <AppIcon
            name="profile"
            size="md"
            color={WorkerColors.primary}
          />
        </View>

        {/* CUSTOMER INFO */}

        <View style={styles.customerInfo}>
          <AppText
            variant="bodyLarge"
            weight="medium"
            numberOfLines={1}
            style={styles.customerName}
          >
            {displayCustomerName}
          </AppText>

          <AppText
            variant="caption"
            numberOfLines={1}
            style={styles.secondaryText}
          >
            Contact customer through Fixxam
          </AppText>
        </View>

        {/* CALL CUSTOMER */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${displayCustomerName}`}
          accessibilityHint="Start a Fixxam voice call with this customer"
          hitSlop={8}
          onPress={onCallCustomer}
          style={({ pressed }) => [
            styles.callButton,
            pressed && styles.callButtonPressed,
          ]}
        >
          <AppIcon
            name="phone"
            size="sm"
            color={Colors.white}
          />
        </Pressable>
      </View>

      {/* ========================================================
          DIVIDER
      ======================================================== */}

      <View style={styles.divider} />

      {/* ========================================================
          DELIVERY HEADER
      ======================================================== */}

      <View style={styles.deliveryHeader}>
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.sectionTitle}
        >
          Delivery
        </AppText>

        {hasGps ? (
          <View style={styles.gpsBadge}>
            <AppIcon
              name="location"
              size="xs"
              color={Colors.success}
            />

            <AppText
              variant="caption"
              weight="medium"
              style={styles.gpsText}
            >
              GPS
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ========================================================
          DELIVERY LOCATION
      ======================================================== */}

      <View style={styles.deliveryRow}>
        <View style={styles.locationIcon}>
          <AppIcon
            name="location"
            size="md"
            color={WorkerColors.primary}
          />
        </View>

        <View style={styles.addressContent}>
          <AppText
            variant="caption"
            numberOfLines={1}
            style={styles.addressLabel}
          >
            DELIVERY ADDRESS
          </AppText>

          <AppText
            variant="body"
            numberOfLines={3}
            style={styles.addressText}
          >
            {displayAddress}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(
  WorkerMarketCustomerDeliverySection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ============================================================
     SECTION
  ============================================================ */

  section: {
    width: "100%",

    marginBottom:
      FixxamTokens.spacing.lg,

    paddingVertical:
      FixxamTokens.spacing.sm,
  },

  sectionHeader: {
    marginBottom:
      FixxamTokens.spacing.md,
  },

  sectionTitle: {
    color:
      Colors.textPrimary,
  },

  /* ============================================================
     CUSTOMER
  ============================================================ */

  customerRow: {
    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",
  },

  customerIcon: {
    width: 44,

    height: 44,

    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      WorkerColors.primarySoft,
  },

  customerInfo: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },

  customerName: {
    color:
      Colors.textPrimary,
  },

  secondaryText: {
    marginTop:
      FixxamTokens.spacing.xxs,

    color:
      Colors.textSecondary,
  },

  /* ============================================================
     CALL BUTTON
  ============================================================ */

  callButton: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    marginLeft:
      FixxamTokens.spacing.sm,

    alignItems: "center",

    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      WorkerColors.primary,

    shadowColor:
      WorkerColors.primary,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.18,

    shadowRadius: 4,

    elevation: 2,
  },

  callButtonPressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion.scalePressed,
      },
    ],
  },

  /* ============================================================
     DIVIDER
  ============================================================ */

  divider: {
    height:
      StyleSheet.hairlineWidth,

    marginVertical:
      FixxamTokens.spacing.lg,

    marginLeft: 56,

    backgroundColor:
      Colors.border,
  },

  /* ============================================================
     DELIVERY HEADER
  ============================================================ */

  deliveryHeader: {
    marginBottom:
      FixxamTokens.spacing.md,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap:
      FixxamTokens.spacing.md,
  },

  /* ============================================================
     DELIVERY ROW
  ============================================================ */

  deliveryRow: {
    flexDirection: "row",

    alignItems: "flex-start",
  },

  locationIcon: {
    width: 44,

    height: 44,

    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      WorkerColors.primarySoft,
  },

  addressContent: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.md,
  },

  addressLabel: {
    letterSpacing: 0.5,

    color:
      Colors.textMuted,
  },

  addressText: {
    marginTop:
      FixxamTokens.spacing.xs,

    lineHeight: 21,

    color:
      Colors.textPrimary,
  },

  /* ============================================================
     GPS
  ============================================================ */

  gpsBadge: {
    minHeight: 26,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    paddingVertical:
      FixxamTokens.spacing.xxs,

    flexDirection: "row",

    alignItems: "center",

    gap:
      FixxamTokens.spacing.xxs,

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.successSoft,
  },

  gpsText: {
    color:
      Colors.success,
  },
});