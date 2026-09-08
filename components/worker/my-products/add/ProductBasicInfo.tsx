import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppInput,
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

type Props = {
  productName: string;

  onChangeProductName: (
    value: string,
  ) => void;

  category: string;

  onSelectCategory: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductBasicInfo({
  productName,
  onChangeProductName,
  category,
  onSelectCategory,
}: Props) {
  const hasCategory =
    category.trim().length > 0;

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          PRODUCT NAME
      ====================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppInput
          role="worker"
          label="Product Name"
          placeholder="Enter product name"
          value={
            productName
          }
          onChangeText={
            onChangeProductName
          }
          autoCapitalize="sentences"
          autoCorrect={
            false
          }
          returnKeyType="next"
          accessibilityLabel="Product name"
        />
      </View>

      {/* ======================================================
          CATEGORY
      ====================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.label
          }
        >
          Category
        </AppText>

        <Pressable
          onPress={
            onSelectCategory
          }
          accessibilityRole="button"
          accessibilityLabel="Select product category"
          accessibilityHint="Opens the product category selector"
          style={({
            pressed,
          }) => [
            styles.categoryInput,

            pressed
              ? styles.categoryInputPressed
              : null,
          ]}
        >
          <AppText
            variant="body"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.categoryText,

              !hasCategory
                ? styles.placeholder
                : null,
            ]}
          >
            {hasCategory
              ? category
              : "Select Category"}
          </AppText>

          <View
            style={
              styles.categoryIcon
            }
          >
            <AppIcon
              name="down"
              role="worker"
              size="xs"
              color={
                hasCategory
                  ? WorkerColors.primary
                  : Colors.textMuted
              }
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    field: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CATEGORY
    ======================================================== */

    categoryInput: {
      minHeight:
        FixxamTokens.size.inputHeight,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    categoryText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    placeholder: {
      color:
        Colors.textMuted,
    },

    categoryIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       STATES
    ======================================================== */

    categoryInputPressed: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,

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