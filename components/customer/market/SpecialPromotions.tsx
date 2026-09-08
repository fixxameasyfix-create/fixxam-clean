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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  onSeeAll?: () => void;

  onClaimOffer?: () => void;

  onShopNow?: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function SpecialPromotions({
  onSeeAll,
  onClaimOffer,
  onShopNow,
}: Props) {
  return (
    <View style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.title}
        >
          Special Promotions
        </AppText>

        {onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all special promotions"
            hitSlop={8}
            onPress={onSeeAll}
            style={({ pressed }) => [
              styles.seeAllButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={styles.seeAll}
            >
              See All
            </AppText>

            <AppIcon
              name="next"
              role="customer"
              size="xs"
              state="active"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          PROMOTIONS
      ====================================================== */}

      <View style={styles.row}>
        {/* ====================================================
            CEMENT OFFER
        ==================================================== */}

        <View
          style={[
            styles.card,
            styles.greenCard,
          ]}
        >
          <View
            style={[
              styles.iconBox,
              styles.greenIconBox,
            ]}
          >
            <AppIcon
              name="package"
              role="customer"
              size="md"
              state="success"
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={styles.heading}
          >
            Buy 2 Bags of Cement
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sub}
          >
            Get 5% OFF
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Claim cement promotion"
            accessibilityState={{
              disabled: !onClaimOffer,
            }}
            disabled={!onClaimOffer}
            onPress={onClaimOffer}
            style={({ pressed }) => [
              styles.actionButton,

              !onClaimOffer
                ? styles.actionDisabled
                : null,

              pressed &&
              onClaimOffer
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={styles.buttonText}
            >
              Claim Offer
            </AppText>
          </Pressable>
        </View>

        {/* ====================================================
            DELIVERY OFFER
        ==================================================== */}

        <View
          style={[
            styles.card,
            styles.deliveryCard,
          ]}
        >
          <View
            style={[
              styles.iconBox,
              styles.deliveryIconBox,
            ]}
          >
            <AppIcon
              name="delivery"
              role="customer"
              size="md"
              color={Colors.warning}
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={styles.heading}
          >
            Free Delivery
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={styles.sub}
          >
            Orders above ₦20,000
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shop free delivery promotion"
            accessibilityState={{
              disabled: !onShopNow,
            }}
            disabled={!onShopNow}
            onPress={onShopNow}
            style={({ pressed }) => [
              styles.actionButton,

              !onShopNow
                ? styles.actionDisabled
                : null,

              pressed &&
              onShopNow
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={styles.buttonText}
            >
              Shop Now
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    marginTop:
      FixxamTokens.spacing.xl,

    marginBottom:
      FixxamTokens.spacing.xl,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.md,
  },

  title: {
    flex: 1,

    minWidth: 0,

    color:
      Colors.textPrimary,
  },

  seeAllButton: {
    minHeight:
      FixxamTokens.size.minimumTouchTarget,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap:
      FixxamTokens.spacing.xs,
  },

  seeAll: {
    color:
      CustomerColors.primary,
  },

  /* ==========================================================
     CARDS
  ========================================================== */

  row: {
    flexDirection: "row",

    gap:
      FixxamTokens.spacing.md,
  },

  card: {
    flex: 1,

    minWidth: 0,

    minHeight: 190,

    padding:
      FixxamTokens.spacing.md,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.lg,
  },

  greenCard: {
    borderColor:
      Colors.success,

    backgroundColor:
      Colors.successSoft,
  },

  deliveryCard: {
    borderColor:
      Colors.warning,

    backgroundColor:
      Colors.warningSoft,
  },

  /* ==========================================================
     ICON
  ========================================================== */

  iconBox: {
    width: 44,

    height: 44,

    alignItems: "center",

    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.md,

    backgroundColor:
      Colors.surface,
  },

  greenIconBox: {
    borderWidth: 1,

    borderColor:
      Colors.success,
  },

  deliveryIconBox: {
    borderWidth: 1,

    borderColor:
      Colors.warning,
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  heading: {
    marginTop:
      FixxamTokens.spacing.md,

    color:
      Colors.textPrimary,
  },

  sub: {
    marginTop:
      FixxamTokens.spacing.xs,

    lineHeight: 18,
  },

  /* ==========================================================
     ACTION
  ========================================================== */

  actionButton: {
    minHeight:
      FixxamTokens.size.buttonSmallHeight,

    alignItems: "center",

    justifyContent: "center",

    marginTop: "auto",

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    borderRadius:
      FixxamTokens.radius.button,

    backgroundColor:
      CustomerColors.primary,
  },

  buttonText: {
    color:
      Colors.textInverse,
  },

  actionDisabled: {
    backgroundColor:
      Colors.disabled,

    opacity:
      FixxamTokens.motion.disabledOpacity,
  },

  /* ==========================================================
     PRESSED
  ========================================================== */

  pressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion.scalePressed,
      },
    ],
  },
});

export default memo(
  SpecialPromotions,
);