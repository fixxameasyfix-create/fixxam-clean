import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

function AllProductsEmpty() {
  const handleAddProduct =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
      );
    }, []);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name="package"
          role="worker"
          size="xl"
          color={
            WorkerColors.primary
          }
        />
      </View>

      {/* ======================================================
          TEXT
      ====================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        No Products Found
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.description
        }
      >
        You haven't added any products yet. Add your first product to start selling.
      </AppText>

      {/* ======================================================
          ACTION
      ====================================================== */}

      <View
        style={
          styles.action
        }
      >
        <AppButton
          title="Add Product"
          role="worker"
          variant="primary"
          leftIconName="add"
          onPress={
            handleAddProduct
          }
          style={
            styles.button
          }
        />
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

AllProductsEmpty.displayName =
  "AllProductsEmpty";

export default memo(
  AllProductsEmpty,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    iconContainer: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    action: {
      width: "100%",

      maxWidth: 260,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    button: {
      width: "100%",
    },
  });