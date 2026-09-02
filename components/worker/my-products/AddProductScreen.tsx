import React, {
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import CategoryPicker from "./CategoryPicker";

import ProductImages from "./add/ProductImages";
import ProductBasicInfo from "./add/ProductBasicInfo";
import ProductPricing from "./add/ProductPricing";
import ProductDescription from "./add/ProductDescription";
import ProductOptions from "./add/ProductOptions";
import ProductFooter from "./add/ProductFooter";
import AddProductDiscount from "./AddProductDiscount";

import ProductServicesPicker from "@/components/worker/products/ProductServicesPicker";

import useAddProduct from "@/hooks/worker/useAddProduct";

/* ============================================================
   ADD PRODUCT SCREEN
============================================================ */

export default function AddProductScreen() {
  const addProduct =
    useAddProduct();

  /* ==========================================================
     CATEGORY PICKER
  ========================================================== */

  const [
    categoryPickerVisible,
    setCategoryPickerVisible,
  ] = useState(false);

  /* ==========================================================
     SERVICES PICKER
  ========================================================== */

  const [
    servicesPickerVisible,
    setServicesPickerVisible,
  ] = useState(false);

  /* ==========================================================
     LOADING
  ========================================================== */

  const isSaving =
    Boolean(addProduct.loading);

  /* ==========================================================
     OPEN CATEGORY PICKER
  ========================================================== */

  const openCategoryPicker =
    () => {
      if (isSaving) {
        return;
      }

      setCategoryPickerVisible(
        true,
      );
    };

  /* ==========================================================
     OPEN SERVICES PICKER
  ========================================================== */

  const openServicesPicker =
    () => {
      if (isSaving) {
        return;
      }

      setServicesPickerVisible(
        true,
      );
    };

  /* ==========================================================
     CLOSE CATEGORY PICKER
  ========================================================== */

  const closeCategoryPicker =
    () => {
      if (isSaving) {
        return;
      }

      setCategoryPickerVisible(
        false,
      );
    };

  /* ==========================================================
     CLOSE SERVICES PICKER
  ========================================================== */

  const closeServicesPicker =
    () => {
      if (isSaving) {
        return;
      }

      setServicesPickerVisible(
        false,
      );
    };

  /* ==========================================================
     SELECT CATEGORY
  ========================================================== */

  const handleCategorySelect =
    (value: string) => {
      if (isSaving) {
        return;
      }

      addProduct.setCategory(
        value,
      );

      setCategoryPickerVisible(
        false,
      );
    };

  /* ==========================================================
     APPLY SERVICES
  ========================================================== */

  const handleServicesApply =
    (
      serviceIds: string[],
    ) => {
      if (isSaving) {
        return;
      }

      /*
       * Remove duplicates and
       * empty service IDs before
       * sending them to the hook.
       */
      const normalizedServiceIds =
        Array.from(
          new Set(
            serviceIds
              .filter(
                (
                  serviceId,
                ): serviceId is string =>
                  typeof serviceId ===
                  "string",
              )
              .map(
                (
                  serviceId,
                ) =>
                  serviceId.trim(),
              )
              .filter(Boolean),
          ),
        );

      addProduct.setServiceIds(
        normalizedServiceIds,
      );

      setServicesPickerVisible(
        false,
      );
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ====================================================
            PRODUCT IMAGES
        ==================================================== */}

        <ProductImages
          images={
            addProduct.images
          }
          onPickImages={
            addProduct.pickImages
          }
          onRemoveImage={
            addProduct.removeImage
          }
        />

        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <ProductBasicInfo
          productName={
            addProduct.productName
          }
          onChangeProductName={
            addProduct.setProductName
          }
          category={
            addProduct.category
          }
          onSelectCategory={
            openCategoryPicker
          }
        />

        {/* ====================================================
            PRICE + STOCK
        ==================================================== */}

        <ProductPricing
          price={
            addProduct.price
          }
          stock={
            addProduct.stock
          }
          onChangePrice={
            addProduct.setPrice
          }
          onChangeStock={
            addProduct.setStock
          }
        />

        {/* ====================================================
            DISCOUNT
        ====================================================

            Discount is optional.

            Example:

            Original price: ₦2,000
            Discount:       5%
            Duration:       7 days

            The actual deal should be created
            by useAddProduct during product
            publishing, after a valid productId
            has been created.

        ==================================================== */}

       {/* ====================================================
    DISCOUNT
==================================================== */}

<AddProductDiscount
  price={addProduct.price}
  discount={addProduct.discount}
  days={addProduct.discountDays}
  saving={addProduct.discountSaving}
  onChangeDiscount={
    addProduct.setDiscount
  }
  onChangeDays={
    addProduct.setDiscountDays
  }
/>

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <ProductDescription
          description={
            addProduct.description
          }
          onChangeDescription={
            addProduct.setDescription
          }
        />

        {/* ====================================================
            PRODUCT OPTIONS
        ==================================================== */}

        <ProductOptions
          delivery={
            addProduct.delivery
          }
          featured={
            addProduct.featured
          }
          condition={
            addProduct.condition
          }
          onToggleDelivery={
            addProduct.setDelivery
          }
          onToggleFeatured={
            addProduct.setFeatured
          }
          onChangeCondition={
            addProduct.setCondition
          }
        />

        {/* ====================================================
            SERVICES FOR MATERIAL
        ==================================================== */}

        <View
          style={
            styles.servicesSection
          }
        >
          <AppText
            weight="bold"
            style={
              styles.servicesTitle
            }
          >
            Services for this material
          </AppText>

          <AppText
            style={
              styles.servicesDescription
            }
          >
            Select the services this
            material can be used for.
            This helps customers find it
            through "Find Materials for
            Your Service".
          </AppText>

          {/* ==================================================
              SERVICE SELECTOR
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select services for this material"
            accessibilityState={{
              disabled: isSaving,
            }}
            disabled={
              isSaving
            }
            onPress={
              openServicesPicker
            }
            style={({ pressed }) => [
              styles.servicesButton,

              isSaving &&
                styles.servicesButtonDisabled,

              pressed &&
                !isSaving &&
                styles.servicesButtonPressed,
            ]}
          >
            {/* ==================================================
                ICON
            ================================================== */}

            <View
              style={
                styles.servicesButtonIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={21}
                color="#0891B2"
              />
            </View>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <View
              style={
                styles.servicesButtonContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.servicesButtonTitle
                }
              >
                {addProduct
                  .serviceIds
                  .length > 0
                  ? `${addProduct.serviceIds.length} service${
                      addProduct
                        .serviceIds
                        .length ===
                      1
                        ? ""
                        : "s"
                    } selected`
                  : "Select services"}
              </AppText>

              <AppText
                style={
                  styles.servicesButtonDescription
                }
              >
                {addProduct
                  .serviceIds
                  .length > 0
                  ? "Material will appear for the selected services."
                  : "Required — select at least one service."}
              </AppText>
            </View>

            {/* ==================================================
                ARROW
            ================================================== */}

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </Pressable>

          {/* ==================================================
              SELECTED SERVICE SUMMARY
          ================================================== */}

          {addProduct
            .serviceIds
            .length > 0 && (
            <View
              style={
                styles.selectedServices
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#16A34A"
              />

              <AppText
                style={
                  styles.selectedServicesText
                }
              >
                {
                  addProduct
                    .serviceIds
                    .length
                }{" "}
                service
                {addProduct
                  .serviceIds
                  .length ===
                1
                  ? ""
                  : "s"}{" "}
                selected
              </AppText>
            </View>
          )}
        </View>

        {/* ====================================================
            PUBLISH PRODUCT
        ==================================================== */}

        <ProductFooter
          loading={
            addProduct.loading
          }
          onSave={
            addProduct.onSave
          }
          buttonText="Publish Product"
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
          addProduct.category
        }
        onClose={
          closeCategoryPicker
        }
        onSelect={
          handleCategorySelect
        }
      />

      {/* ======================================================
          SERVICES PICKER
      ====================================================== */}

      <ProductServicesPicker
        visible={
          servicesPickerVisible
        }
        value={
          addProduct.serviceIds
        }
        onClose={
          closeServicesPicker
        }
        onApply={
          handleServicesApply
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      flexGrow: 1,

      paddingHorizontal: 16,

      paddingTop: 16,

      paddingBottom: 40,

      backgroundColor:
        "#F8FAFC",
    },

    /* ==========================================================
       SERVICES SECTION
    ========================================================== */

    servicesSection: {
      marginTop: 20,

      marginBottom: 8,
    },

    servicesTitle: {
      fontSize: 17,

      lineHeight: 22,

      color:
        "#0F172A",
    },

    servicesDescription: {
      marginTop: 5,

      fontSize: 13,

      lineHeight: 19,

      color:
        "#64748B",
    },

    /* ==========================================================
       SERVICES BUTTON
    ========================================================== */

    servicesButton: {
      minHeight: 72,

      marginTop: 12,

      paddingHorizontal: 12,

      paddingVertical: 12,

      borderRadius: 16,

      backgroundColor:
        "#FFFFFF",

      flexDirection:
        "row",

      alignItems:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        7,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 2,
    },

    servicesButtonDisabled: {
      opacity: 0.6,
    },

    servicesButtonPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* ==========================================================
       SERVICES ICON
    ========================================================== */

    servicesButtonIcon: {
      width: 46,

      height: 46,

      borderRadius: 14,

      backgroundColor:
        "#ECFEFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ==========================================================
       SERVICES CONTENT
    ========================================================== */

    servicesButtonContent: {
      flex: 1,

      marginLeft: 11,

      paddingRight: 8,
    },

    servicesButtonTitle: {
      fontSize: 14,

      lineHeight: 19,

      color:
        "#0F172A",
    },

    servicesButtonDescription: {
      marginTop: 3,

      fontSize: 12,

      lineHeight: 17,

      color:
        "#64748B",
    },

    /* ==========================================================
       SELECTED SERVICES
    ========================================================== */

    selectedServices: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 9,

      paddingHorizontal: 3,
    },

    selectedServicesText: {
      marginLeft: 6,

      fontSize: 12,

      color:
        "#16A34A",
    },
  });