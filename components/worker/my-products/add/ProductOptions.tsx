import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  Switch,
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

/* ============================================================
   TYPES
============================================================ */

type ProductCondition =
  | "new"
  | "used";

type Props = {
  delivery: boolean;

  featured: boolean;

  condition: ProductCondition;

  onToggleDelivery: (
    value: boolean,
  ) => void;

  onToggleFeatured: (
    value: boolean,
  ) => void;

  onChangeCondition: (
    value: ProductCondition,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProductOptions({
  delivery,
  featured,
  condition,
  onToggleDelivery,
  onToggleFeatured,
  onChangeCondition,
}: Props) {
  /* ==========================================================
     CONDITION
  ========================================================== */

  const handleNewCondition =
    useCallback(() => {
      if (
        condition === "new"
      ) {
        return;
      }

      onChangeCondition(
        "new",
      );
    }, [
      condition,
      onChangeCondition,
    ]);

  const handleUsedCondition =
    useCallback(() => {
      if (
        condition === "used"
      ) {
        return;
      }

      onChangeCondition(
        "used",
      );
    }, [
      condition,
      onChangeCondition,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          DELIVERY
      ====================================================== */}

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.row
          }
        >
          <View
            style={
              styles.optionIcon
            }
          >
            <AppIcon
              name="delivery"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.content
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.title
              }
            >
              Delivery Available
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Customers can request delivery.
            </AppText>
          </View>

          <Switch
            value={
              delivery
            }
            onValueChange={
              onToggleDelivery
            }
            trackColor={{
              false:
                Colors.disabled,

              true:
                WorkerColors.primary,
            }}
            thumbColor={
              Colors.surface
            }
            ios_backgroundColor={
              Colors.disabled
            }
            accessibilityLabel="Delivery available"
            accessibilityState={{
              checked:
                delivery,
            }}
          />
        </View>
      </View>

      {/* ======================================================
          FEATURED
      ====================================================== */}

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.row
          }
        >
          <View
            style={
              styles.optionIcon
            }
          >
            <AppIcon
              name="star"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.content
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.title
              }
            >
              Featured Product
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Highlight this product.
            </AppText>
          </View>

          <Switch
            value={
              featured
            }
            onValueChange={
              onToggleFeatured
            }
            trackColor={{
              false:
                Colors.disabled,

              true:
                WorkerColors.primary,
            }}
            thumbColor={
              Colors.surface
            }
            ios_backgroundColor={
              Colors.disabled
            }
            accessibilityLabel="Featured product"
            accessibilityState={{
              checked:
                featured,
            }}
          />
        </View>
      </View>

      {/* ======================================================
          CONDITION
      ====================================================== */}

      <View
        style={
          styles.conditionSection
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.label
          }
        >
          Condition
        </AppText>

        <View
          style={
            styles.conditionRow
          }
        >
          {/* ==================================================
              NEW
          ================================================== */}

          <Pressable
            onPress={
              handleNewCondition
            }
            accessibilityRole="button"
            accessibilityLabel="New product condition"
            accessibilityState={{
              selected:
                condition ===
                "new",
            }}
            style={({
              pressed,
            }) => [
              styles.conditionOption,

              condition ===
              "new"
                ? styles.activeCondition
                : null,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="package"
              role="worker"
              size="sm"
              color={
                condition ===
                "new"
                  ? Colors.textInverse
                  : Colors.textSecondary
              }
            />

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={[
                styles.conditionText,

                condition ===
                "new"
                  ? styles.activeConditionText
                  : null,
              ]}
            >
              New
            </AppText>
          </Pressable>

          {/* ==================================================
              USED
          ================================================== */}

          <Pressable
            onPress={
              handleUsedCondition
            }
            accessibilityRole="button"
            accessibilityLabel="Used product condition"
            accessibilityState={{
              selected:
                condition ===
                "used",
            }}
            style={({
              pressed,
            }) => [
              styles.conditionOption,

              condition ===
              "used"
                ? styles.activeCondition
                : null,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="refresh"
              role="worker"
              size="sm"
              color={
                condition ===
                "used"
                  ? Colors.textInverse
                  : Colors.textSecondary
              }
            />

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={[
                styles.conditionText,

                condition ===
                "used"
                  ? styles.activeConditionText
                  : null,
              ]}
            >
              Used
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductOptions =
  memo(
    ProductOptions,
  );

MemoizedProductOptions.displayName =
  "ProductOptions";

export default MemoizedProductOptions;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       CARDS
    ======================================================== */

    card: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    row: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.md,
    },

    optionIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CONDITION
    ======================================================== */

    conditionSection: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    conditionRow: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.md,
    },

    conditionOption: {
      flex: 1,

      minHeight:
        FixxamTokens.size.buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    activeCondition: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    conditionText: {
      color:
        Colors.textSecondary,
    },

    activeConditionText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
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
  });