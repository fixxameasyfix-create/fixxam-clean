import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

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
   SCREEN
============================================================ */

export default function AddProductScreen() {
  const addProduct =
    useAddProduct();

  /* ==========================================================
     PICKERS
  ========================================================== */

  const [
    categoryPickerVisible,
    setCategoryPickerVisible,
  ] =
    useState(false);

  const [
    servicesPickerVisible,
    setServicesPickerVisible,
  ] =
    useState(false);

  /* ==========================================================
     STATE
  ========================================================== */

  const isSaving =
    Boolean(
      addProduct.loading,
    );

  const selectedServiceCount =
    addProduct.serviceIds.length;

  const servicesSummary =
    useMemo(
      () =>
        selectedServiceCount > 0
          ? `${selectedServiceCount} service${
              selectedServiceCount === 1
                ? ""
                : "s"
            } selected`
          : "Select services",
      [
        selectedServiceCount,
      ],
    );

  /* ==========================================================
     CATEGORY PICKER
  ========================================================== */

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
        value: string,
      ) => {
        if (isSaving) {
          return;
        }

        const normalizedValue =
          value.trim();

        addProduct.setCategory(
          normalizedValue,
        );

        setCategoryPickerVisible(
          false,
        );
      },
      [
        addProduct.setCategory,
        isSaving,
      ],
    );

  /* ==========================================================
     SERVICES PICKER
  ========================================================== */

  const openServicesPicker =
    useCallback(() => {
      if (isSaving) {
        return;
      }

      setServicesPickerVisible(
        true,
      );
    }, [
      isSaving,
    ]);

  const closeServicesPicker =
    useCallback(() => {
      setServicesPickerVisible(
        false,
      );
    }, []);

  const handleServicesApply =
    useCallback(
      (
        serviceIds: string[],
      ) => {
        if (isSaving) {
          return;
        }

        /*
         * Normalize IDs before sending
         * them to useAddProduct.
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
                  serviceId =>
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
      },
      [
        addProduct.setServiceIds,
        isSaving,
      ],
    );

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
        ==================================================== */}

        <AddProductDiscount
          price={
            addProduct.price
          }
          discount={
            addProduct.discount
          }
          days={
            addProduct.discountDays
          }
          saving={
            addProduct.discountSaving
          }
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
          <View
            style={
              styles.servicesHeading
            }
          >
            <View
              style={
                styles.servicesHeadingIcon
              }
            >
              <AppIcon
                name="service"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.servicesHeadingContent
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                style={
                  styles.servicesTitle
                }
              >
                Services for this material
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.servicesDescription
                }
              >
                Select the services this material can be used for. This helps customers find it through Find Materials for Your Service.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SERVICE SELECTOR
          ================================================== */}

          <Pressable
            onPress={
              openServicesPicker
            }
            disabled={
              isSaving
            }
            accessibilityRole="button"
            accessibilityLabel="Select services for this material"
            accessibilityHint="Opens the service selector"
            accessibilityState={{
              disabled:
                isSaving,
            }}
            style={({
              pressed,
            }) => [
              styles.servicesButton,

              selectedServiceCount >
                0
                ? styles.servicesButtonSelected
                : null,

              isSaving
                ? styles.disabled
                : null,

              pressed &&
              !isSaving
                ? styles.pressed
                : null,
            ]}
          >
            <View
              style={
                styles.servicesButtonIcon
              }
            >
              <AppIcon
                name="service"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.servicesButtonContent
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.servicesButtonTitle
                }
              >
                {servicesSummary}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={2}
                style={
                  styles.servicesButtonDescription
                }
              >
                {selectedServiceCount >
                0
                  ? "Material will appear for the selected services."
                  : "Required — select at least one service."}
              </AppText>
            </View>

            <AppIcon
              name="next"
              role="worker"
              size="sm"
              color={
                Colors.textMuted
              }
            />
          </Pressable>

          {/* ==================================================
              SELECTED SUMMARY
          ================================================== */}

          {selectedServiceCount >
          0 ? (
            <View
              style={
                styles.selectedServices
              }
            >
              <AppIcon
                name="success"
                size="xs"
                color={
                  Colors.success
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.selectedServicesText
                }
              >
                {selectedServiceCount}{" "}
                service
                {selectedServiceCount ===
                1
                  ? ""
                  : "s"}{" "}
                selected
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            PUBLISH
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

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

    /* ========================================================
       SERVICES SECTION
    ======================================================== */

    servicesSection: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    servicesHeading: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,
    },

    servicesHeadingIcon: {
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

    servicesHeadingContent: {
      flex: 1,

      minWidth: 0,
    },

    servicesTitle: {
      color:
        Colors.textPrimary,
    },

    servicesDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SERVICES BUTTON
    ======================================================== */

    servicesButton: {
      minHeight: 78,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    servicesButtonSelected: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    servicesButtonIcon: {
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
        Colors.surface,
    },

    servicesButtonContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    servicesButtonTitle: {
      color:
        Colors.textPrimary,
    },

    servicesButtonDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SELECTED SERVICES
    ======================================================== */

    selectedServices: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    selectedServicesText: {
      color:
        Colors.success,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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