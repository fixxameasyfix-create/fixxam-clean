import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  type ListRenderItemInfo,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import CategoryCard from "@/components/categories/CategoryCard";

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

export type ServiceOption = {
  id: string;

  name: string;

  icon: string;

  iconColor: string;

  backgroundColor: string;
};

type Props = {
  visible: boolean;

  services: ServiceOption[];

  selectedId: string;

  onSelect: (
    item: ServiceOption,
  ) => void;

  onClose: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ServiceSelectModal(
  props: Props,
) {
  const {
    visible,
    services,
    onSelect,
    onClose,
  } = props;

  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<ServiceOption>) => {
        return (
          <CategoryCard
            icon={
              item.icon
            }
            iconColor={
              item.iconColor
            }
            backgroundColor={
              item.backgroundColor
            }
            title={
              item.name
            }
            onPress={() => {
              onSelect(
                item,
              );
            }}
          />
        );
      },
      [
        onSelect,
      ],
    );

  /* ==========================================================
     KEY
  ========================================================== */

  const keyExtractor =
    useCallback(
      (
        item: ServiceOption,
      ) =>
        item.id,
      [],
    );

  /* ==========================================================
     SEPARATOR
  ========================================================== */

  const renderSeparator =
    useCallback(
      () => (
        <View
          style={
            styles.separator
          }
        />
      ),
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        {/* ==================================================
            BACKDROP
        ================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close service selection"
          onPress={
            onClose
          }
          style={
            StyleSheet.absoluteFill
          }
        />

        {/* ==================================================
            SHEET
        ================================================== */}

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
                styles.headerIcon
              }
            >
              <AppIcon
                name="professional"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
                numberOfLines={
                  1
                }
                style={
                  styles.title
                }
              >
                Select Service
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={
                  1
                }
                style={
                  styles.subtitle
                }
              >
                Choose the service you provide.
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              accessibilityRole="button"
              accessibilityLabel="Close service selection"
              hitSlop={
                8
              }
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
              SERVICES
          ================================================== */}

          <FlatList
            data={
              services
            }
            renderItem={
              renderItem
            }
            keyExtractor={
              keyExtractor
            }
            ItemSeparatorComponent={
              renderSeparator
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.list,

              services.length ===
              0
                ? styles.emptyList
                : null,
            ]}
            ListEmptyComponent={
              <View
                style={
                  styles.empty
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <AppIcon
                    name="service"
                    role="worker"
                    size="lg"
                    color={
                      Colors.textMuted
                    }
                  />
                </View>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  center
                  style={
                    styles.emptyTitle
                  }
                >
                  No services available
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  center
                  style={
                    styles.emptyText
                  }
                >
                  Available services will appear here.
                </AppText>
              </View>
            }
            initialNumToRender={
              10
            }
            maxToRenderPerBatch={
              12
            }
            windowSize={
              7
            }
            removeClippedSubviews
          />
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

ServiceSelectModal.displayName =
  "ServiceSelectModal";

export default memo(
  ServiceSelectModal,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       MODAL
    ======================================================== */

    overlay: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      width:
        "100%",

      maxHeight:
        "78%",

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
    },

    handle: {
      width:
        42,

      height:
        4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        56,

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.md,
    },

    headerIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    headerText: {
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
        FixxamTokens.spacing.xxs,

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

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyList: {
      flexGrow:
        1,

      justifyContent:
        "center",
    },

    empty: {
      minHeight:
        220,

      paddingVertical:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });