import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import {
  Pressable,
  View,
} from "react-native";

import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  WorkerColors,
} from "@/theme";

import styles from "./ProductActionSheet.styles";

import type {
  ProductActionSheetProps,
  ProductActionSheetRef,
} from "./ProductActionSheet.types";

/* ============================================================
   COMPONENT
============================================================ */

const ProductActionSheet =
  forwardRef<
    ProductActionSheetRef,
    ProductActionSheetProps
  >(
    (
      {
        onEdit,
        onDuplicate,
        onShare,
        onDelete,
      },
      ref,
    ) => {
      const bottomSheetRef =
        useRef<BottomSheet>(
          null,
        );

      const snapPoints =
        useMemo(
          () => ["50%"],
          [],
        );

      /* ======================================================
         IMPERATIVE API
      ====================================================== */

      useImperativeHandle(
        ref,
        () => ({
          present() {
            bottomSheetRef.current?.snapToIndex(
              0,
            );
          },

          dismiss() {
            bottomSheetRef.current?.close();
          },
        }),
        [],
      );

      /* ======================================================
         RENDER
      ====================================================== */

      return (
        <BottomSheet
          ref={
            bottomSheetRef
          }
          index={-1}
          snapPoints={
            snapPoints
          }
          enablePanDownToClose
          enableDynamicSizing={
            false
          }
          handleComponent={
            null
          }
        >
          <BottomSheetView
            style={
              styles.content
            }
          >
            {/* ==================================================
                HANDLE
            ================================================== */}

            <View
              style={
                styles.handle
              }
            />

            {/* ==================================================
                TITLE
            ================================================== */}

            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.title
              }
            >
              Product Actions
            </AppText>

            {/* ==================================================
                EDIT
            ================================================== */}

            <Pressable
              onPress={
                onEdit
              }
              accessibilityRole="button"
              accessibilityLabel="Edit product"
              style={
                styles.action
              }
            >
              <AppIcon
                name="settings"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="medium"
                style={
                  styles.actionText
                }
              >
                Edit Product
              </AppText>
            </Pressable>

            {/* ==================================================
                DUPLICATE
            ================================================== */}

            <Pressable
              onPress={
                onDuplicate
              }
              accessibilityRole="button"
              accessibilityLabel="Duplicate product"
              style={
                styles.action
              }
            >
              <AppIcon
                name="file"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="medium"
                style={
                  styles.actionText
                }
              >
                Duplicate Product
              </AppText>
            </Pressable>

            {/* ==================================================
                SHARE
            ================================================== */}

            <Pressable
              onPress={
                onShare
              }
              accessibilityRole="button"
              accessibilityLabel="Share product"
              style={
                styles.action
              }
            >
              <AppIcon
                name="upload"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="medium"
                style={
                  styles.actionText
                }
              >
                Share Product
              </AppText>
            </Pressable>

            {/* ==================================================
                DELETE
            ================================================== */}

            <Pressable
              onPress={
                onDelete
              }
              accessibilityRole="button"
              accessibilityLabel="Delete product"
              style={
                styles.action
              }
            >
              <AppIcon
                name="delete"
                size="sm"
                color={
                  Colors.error
                }
              />

              <AppText
                variant="bodyMedium"
                weight="medium"
                style={[
                  styles.actionText,
                  styles.deleteText,
                ]}
              >
                Delete Product
              </AppText>
            </Pressable>

            {/* ==================================================
                CANCEL
            ================================================== */}

            <Pressable
              onPress={() => {
                bottomSheetRef.current?.close();
              }}
              accessibilityRole="button"
              accessibilityLabel="Close product actions"
              style={
                styles.cancel
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.cancelText
                }
              >
                Cancel
              </AppText>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      );
    },
  );

/* ============================================================
   DISPLAY NAME
============================================================ */

ProductActionSheet.displayName =
  "ProductActionSheet";

export default ProductActionSheet;