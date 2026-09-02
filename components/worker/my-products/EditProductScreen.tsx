import React, {
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
   EDIT PRODUCT SCREEN
============================================================ */

export default function EditProductScreen() {
  /* ==========================================================
     ROUTE PARAMS
  ========================================================== */

  const {
    id,
  } =
    useLocalSearchParams<{
      id: string;
    }>();

  /* ==========================================================
     PRODUCT HOOK
  ========================================================== */

  const product =
    useEditProduct(id);

  /* ==========================================================
     CATEGORY PICKER
  ========================================================== */

  const [
    categoryPickerVisible,
    setCategoryPickerVisible,
  ] = useState(false);

  /* ==========================================================
     WAIT FOR PRODUCT ID
  ========================================================== */

  if (!id) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
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
          onSelectCategory={() => {
            setCategoryPickerVisible(
              true,
            );
          }}
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
          onActivate={
            product.activateDiscount
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
        onClose={() => {
          setCategoryPickerVisible(
            false,
          );
        }}
        onSelect={(
          category,
        ) => {
          product.setCategory(
            category,
          );

          setCategoryPickerVisible(
            false,
          );
        }}
      />
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,

      paddingHorizontal: 16,

      paddingTop: 16,

      paddingBottom: 40,

      backgroundColor:
        "#F8FAFC",
    },
  });