import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  PRODUCT_CATEGORIES,
} from "@/constants/productCategories";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  value: string;

  onClose: () => void;

  onSelect: (
    category: string,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function CategoryPicker({
  visible,
  value,
  onClose,
  onSelect,
}: Props) {
  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     SELECT
  ========================================================== */

  const handleSelect =
    useCallback(
      (
        category: string,
      ) => {
        onSelect(
          category,
        );

        onClose();
      },
      [
        onClose,
        onSelect,
      ],
    );

  /* ==========================================================
     RENDER CATEGORY
  ========================================================== */

  const renderItem =
    useCallback<
      ListRenderItem<string>
    >(
      ({
        item: category,
      }) => {
        const active =
          value ===
          category;

        return (
          <Pressable
            onPress={() => {
              handleSelect(
                category,
              );
            }}
            accessibilityRole="button"
            accessibilityLabel={`${category} category`}
            accessibilityState={{
              selected:
                active,
            }}
            style={({
              pressed,
            }) => [
              styles.item,

              active
                ? styles.activeItem
                : null,

              pressed
                ? styles.itemPressed
                : null,
            ]}
          >
            <AppText
              variant="body"
              weight={
                active
                  ? "bold"
                  : undefined
              }
              numberOfLines={
                2
              }
              style={[
                styles.text,

                active
                  ? styles.activeText
                  : null,
              ]}
            >
              {category}
            </AppText>

            {active ? (
              <View
                style={
                  styles.checkContainer
                }
              >
                <AppIcon
                  name="check"
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>
            ) : null}
          </Pressable>
        );
      },
      [
        handleSelect,
        value,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          onPress={
            onClose
          }
          accessibilityRole="button"
          accessibilityLabel="Close category picker"
          style={
            StyleSheet.absoluteFill
          }
        />

        {/* ====================================================
            SHEET
        ==================================================== */}

        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.lg,
                ),
            },
          ]}
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
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                style={
                  styles.title
                }
              >
                Select Category
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Choose the category that best matches your product.
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              hitSlop={
                8
              }
              accessibilityRole="button"
              accessibilityLabel="Close category picker"
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              CATEGORIES
          ================================================== */}

          <FlatList
            data={[
              ...PRODUCT_CATEGORIES,
            ]}
            keyExtractor={(
              category,
            ) =>
              category
            }
            renderItem={
              renderItem
            }
            extraData={
              value
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            initialNumToRender={
              16
            }
            maxToRenderPerBatch={
              16
            }
            windowSize={
              7
            }
            contentContainerStyle={
              styles.listContent
            }
          />
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedCategoryPicker =
  memo(
    CategoryPicker,
  );

MemoizedCategoryPicker.displayName =
  "CategoryPicker";

export default MemoizedCategoryPicker;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    overlay: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      maxHeight:
        "70%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    handle: {
      width:
        40,

      height:
        4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.border,
    },

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.md,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    listContent: {
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    item: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      borderBottomWidth:
        1,

      borderBottomColor:
        Colors.divider,

      borderRadius:
        FixxamTokens.radius.md,
    },

    activeItem: {
      borderBottomColor:
        "transparent",

      backgroundColor:
        WorkerColors.primarySoft,
    },

    text: {
      flex:
        1,

      color:
        Colors.textPrimary,
    },

    activeText: {
      color:
        WorkerColors.primary,
    },

    checkContainer: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    itemPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },
  });