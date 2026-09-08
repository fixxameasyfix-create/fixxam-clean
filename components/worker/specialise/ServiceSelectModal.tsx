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

type ServiceItemProps = {
  item: ServiceOption;

  selected: boolean;

  onSelect: (
    item: ServiceOption,
  ) => void;
};

/* ============================================================
   SERVICE ITEM
============================================================ */

const ServiceItem =
  memo(
    function ServiceItem({
      item,
      selected,
      onSelect,
    }: ServiceItemProps) {
      const handlePress =
        useCallback(() => {
          onSelect(
            item,
          );
        }, [
          item,
          onSelect,
        ]);

      return (
        <Pressable
          onPress={
            handlePress
          }
          accessibilityRole="button"
          accessibilityLabel={`Select ${item.name}`}
          accessibilityState={{
            selected,
          }}
          style={({
            pressed,
          }) => [
            styles.serviceOption,

            selected
              ? styles.selectedOption
              : null,

            pressed
              ? styles.optionPressed
              : null,
          ]}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={[
              styles.serviceIcon,

              selected
                ? styles.selectedIcon
                : null,
            ]}
          >
            <AppIcon
              name="professional"
              role="worker"
              size="sm"
              color={
                selected
                  ? WorkerColors.primary
                  : Colors.textSecondary
              }
            />
          </View>

          {/* ==================================================
              NAME
          ================================================== */}

          <AppText
            variant="bodyMedium"
            weight={
              selected
                ? "bold"
                : "regular"
            }
            numberOfLines={2}
            style={[
              styles.serviceName,

              selected
                ? styles.selectedName
                : null,
            ]}
          >
            {item.name}
          </AppText>

          {/* ==================================================
              SELECTED
          ================================================== */}

          <View
            style={
              styles.checkContainer
            }
          >
            {selected ? (
              <View
                style={
                  styles.checkIcon
                }
              >
                <AppIcon
                  name="check"
                  role="worker"
                  size="xs"
                  color={
                    Colors.textInverse
                  }
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      );
    },
  );

ServiceItem.displayName =
  "ServiceSelectModalItem";

/* ============================================================
   COMPONENT
============================================================ */

function ServiceSelectModal({
  visible,
  services,
  selectedId,
  onSelect,
  onClose,
}: Props) {
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
          <ServiceItem
            item={
              item
            }
            selected={
              item.id ===
              selectedId
            }
            onSelect={
              onSelect
            }
          />
        );
      },
      [
        onSelect,
        selectedId,
      ],
    );

  /* ==========================================================
     KEY
  ========================================================== */

  const keyExtractor =
    useCallback(
      (
        item: ServiceOption,
      ) => item.id,
      [],
    );

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <Pressable
        style={
          styles.overlay
        }
        onPress={
          onClose
        }
        accessibilityRole="button"
        accessibilityLabel="Close service selection"
      >
        {/* ====================================================
            SHEET
        ==================================================== */}

        <Pressable
          onPress={
            event => {
              event.stopPropagation();
            }
          }
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
                numberOfLines={1}
                style={
                  styles.title
                }
              >
                Select Service
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={2}
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
              hitSlop={6}
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
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.list,

              services.length === 0
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
            initialNumToRender={10}
            maxToRenderPerBatch={12}
            windowSize={7}
          />
        </Pressable>
      </Pressable>
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
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      width: "100%",

      maxHeight: "78%",

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
      width: 42,

      height: 4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

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

    headerIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

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
      flex: 1,

      minWidth: 0,
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

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

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

    serviceOption: {
      minHeight: 60,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
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
        Colors.background,
    },

    selectedOption: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    serviceIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    selectedIcon: {
      backgroundColor:
        Colors.surface,
    },

    serviceName: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textSecondary,
    },

    selectedName: {
      color:
        WorkerColors.primary,
    },

    checkContainer: {
      width: 30,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    checkIcon: {
      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyList: {
      flexGrow: 1,

      justifyContent:
        "center",
    },

    empty: {
      minHeight: 200,

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

    optionPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });