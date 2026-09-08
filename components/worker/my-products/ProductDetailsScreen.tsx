import React, {
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import ProductDeleteDialog from "../products/ProductDeleteDialog";

import useProductDetails from "@/hooks/worker/useProductDetails";

import ProductGallery from "./details/ProductGallery";
import ProductInfoCard from "./details/ProductInfoCard";
import ProductActionBar from "./details/ProductActionBar";

/* ============================================================
   TYPES
============================================================ */

type ProductDetailsParams = {
  id?:
    | string
    | string[];
};

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

/* ============================================================
   SCREEN
============================================================ */

export default function ProductDetailsScreen() {
  /* ==========================================================
     ROUTE
  ========================================================== */

  const params =
    useLocalSearchParams<ProductDetailsParams>();

  const productId =
    useMemo(
      () =>
        getParamString(
          params.id,
        ),
      [
        params.id,
      ],
    );

  /* ==========================================================
     PRODUCT
  ========================================================== */

  const {
    loading,
    deleting,
    product,

    onDelete,

    showDeleteDialog,
    setShowDeleteDialog,
    confirmDelete,
  } =
    useProductDetails(
      productId,
    );

  /* ==========================================================
     EDIT
  ========================================================== */

  const handleEdit =
    useCallback(() => {
      if (!productId) {
        return;
      }

      router.push({
        pathname:
          "/(worker)/products/edit/[id]",

        params: {
          id:
            productId,
        },
      });
    }, [
      productId,
    ]);

  /* ==========================================================
     CLOSE DELETE DIALOG
  ========================================================== */

  const handleCancelDelete =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setShowDeleteDialog(
        false,
      );
    }, [
      deleting,
      setShowDeleteDialog,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          Loading product...
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (
    !productId ||
    !product
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <AppIcon
            name="package"
            size="xl"
            color={
              Colors.textMuted
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.emptyTitle
          }
        >
          Product not found
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyText
          }
        >
          This product may no longer be available.
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* ====================================================
            GALLERY
        ==================================================== */}

        <ProductGallery
          images={
            product.images ??
            []
          }
        />

        {/* ====================================================
            INFORMATION
        ==================================================== */}

        <ProductInfoCard
          product={
            product
          }
        />

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <ProductActionBar
          loading={
            deleting
          }
          onEdit={
            handleEdit
          }
          onDelete={
            onDelete
          }
        />
      </ScrollView>

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <ProductDeleteDialog
        visible={
          showDeleteDialog
        }
        loading={
          deleting
        }
        onCancel={
          handleCancelDelete
        }
        onConfirm={
          confirmDelete
        }
      />
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    container: {
      flexGrow: 1,

      padding:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       STATES
    ======================================================== */

    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });