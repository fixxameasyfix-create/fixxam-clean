import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  useLocalSearchParams,
} from "expo-router";

import {
  AppScreen,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import useEditProduct from "@/hooks/worker/useEditProduct";

import CategoryPicker from "./CategoryPicker";

import ProductImages from "./add/ProductImages";
import ProductBasicInfo from "./add/ProductBasicInfo";
import ProductPricing from "./add/ProductPricing";
import ProductDescription from "./add/ProductDescription";
import ProductOptions from "./add/ProductOptions";
import ProductFooter from "./add/ProductFooter";

import AddProductDiscount from "./AddProductDiscount";

/* ============================================================
   TYPES
============================================================ */

type EditProductParams = {
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
   EDIT PRODUCT SCREEN
============================================================ */

export default function EditProductScreen() {
  /* ==========================================================
     ROUTE PARAMS
  ========================================================== */

  const params =
    useLocalSearchParams<EditProductParams>();

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
     PRODUCT HOOK
  ========================================================== */

  const product =
    useEditProduct(
      productId,
    );

  const isSaving =
    Boolean(
      product.saving,
    );

  /* ==========================================================
     CATEGORY PICKER
  ========================================================== */

  const [
    categoryPickerVisible,
    setCategoryPickerVisible,
  ] =
    useState(false);

  const openCategoryPicker =
    useCallback(() => {
      if (isSaving) {
        return;
      }

      setCategoryPickerVisible(
        true,
      );
    }, [
      isSaving,
    ]);

  const closeCategoryPicker =
    useCallback(() => {
      setCategoryPickerVisible(
        false,
      );
    }, []);

  const handleCategorySelect =
    useCallback(
      (
        selectedCategory: string,
      ) => {
        if (isSaving) {
          return;
        }

        const normalizedCategory =
          selectedCategory.trim();

        if (
          !normalizedCategory
        ) {
          return;
        }

        product.setCategory(
          normalizedCategory,
        );

        setCategoryPickerVisible(
          false,
        );
      },
      [
        isSaving,
        product.setCategory,
      ],
    );

  /* ==========================================================
     WAIT FOR PRODUCT ID
  ========================================================== */

  if (!productId) {
    return null;
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={
          styles.container
        }
      >
        {/* ====================================================
            PRODUCT IMAGES
        ==================================================== */}

        <ProductImages
          images={
            product.images
          }
          onPickImages={
            product.pickImages
          }
          onRemoveImage={
            product.removeImage
          }
        />

        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <ProductBasicInfo
          productName={
            product.productName
          }
          onChangeProductName={
            product.setProductName
          }
          category={
            product.category
          }
          onSelectCategory={
            openCategoryPicker
          }
        />

        {/* ====================================================
            PRICING
        ==================================================== */}

        <ProductPricing
          price={
            product.price
          }
          stock={
            product.stock
          }
          onChangePrice={
            product.setPrice
          }
          onChangeStock={
            product.setStock
          }
        />

        {/* ====================================================
            DISCOUNT
        ==================================================== */}

        <AddProductDiscount
          price={
            product.price
          }
          discount={
            product.discount
          }
          days={
            product.discountDays
          }
          saving={
            product.discountSaving
          }
          onChangeDiscount={
            product.setDiscount
          }
          onChangeDays={
            product.setDiscountDays
          }
        />

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <ProductDescription
          description={
            product.description
          }
          onChangeDescription={
            product.setDescription
          }
        />

        {/* ====================================================
            PRODUCT OPTIONS
        ==================================================== */}

        <ProductOptions
          delivery={
            product.delivery
          }
          featured={
            product.featured
          }
          condition={
            product.condition
          }
          onToggleDelivery={
            product.setDelivery
          }
          onToggleFeatured={
            product.setFeatured
          }
          onChangeCondition={
            product.setCondition
          }
        />

        {/* ====================================================
            SAVE PRODUCT
        ==================================================== */}

        <ProductFooter
          loading={
            product.saving
          }
          onSave={
            product.onSave
          }
          buttonText="Update Product"
        />
      </ScrollView>

      {/* ======================================================
          CATEGORY PICKER
      ====================================================== */}

      <CategoryPicker
        visible={
          categoryPickerVisible
        }
        value={
          product.category
        }
        onClose={
          closeCategoryPicker
        }
        onSelect={
          handleCategorySelect
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

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },
  });