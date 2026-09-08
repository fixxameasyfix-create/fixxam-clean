import React, {
  memo,
  useCallback,
} from "react";

import {
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type SortType =
  | "latest"
  | "rating"
  | "nearest"
  | "priceLow"
  | "priceHigh";

type Props = {
  visible: boolean;

  value: SortType;

  onClose: () => void;

  onChange: (
    value: SortType,
  ) => void;
};

type SortOption = {
  label: string;

  value: SortType;

  icon:
    | "clock"
    | "star"
    | "navigation"
    | "down"
    | "arrow-up";
};

/* ==============================================================
   OPTIONS
============================================================== */

const OPTIONS: readonly SortOption[] =
  [
    {
      label: "Latest",
      value: "latest",
      icon: "clock",
    },
    {
      label: "Highest Rated",
      value: "rating",
      icon: "star",
    },
    {
      label: "Nearest",
      value: "nearest",
      icon: "navigation",
    },
    {
      label: "Lowest Price",
      value: "priceLow",
      icon: "down",
    },
    {
      label: "Highest Price",
      value: "priceHigh",
      icon: "arrow-up",
    },
  ];

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerSortPopup({
  visible,
  value,
  onClose,
  onChange,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const handleChange =
    useCallback(
      (
        sortValue:
          SortType,
      ) => {
        onChange(
          sortValue,
        );
      },
      [
        onChange,
      ],
    );

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      {/* ======================================================
          BACKDROP
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close sort options"
        onPress={
          onClose
        }
        style={[
          styles.overlay,
          {
            paddingTop:
              insets.top +
              FixxamTokens.size
                .headerHeight +
              FixxamTokens.spacing.xl,
          },
        ]}
      >
        {/* ====================================================
            POPUP
        ==================================================== */}

        <Pressable
          accessibilityRole="none"
          onPress={(
            event,
          ) => {
            event.stopPropagation();
          }}
          style={
            styles.popup
          }
        >
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
                name="filter"
                role="customer"
                size="sm"
                state="active"
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
              style={
                styles.title
              }
            >
              Sort Workers
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close sort options"
              hitSlop={8}
              onPress={
                onClose
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
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>
          </View>

          {/* ==================================================
              OPTIONS
          ================================================== */}

          <View
            accessibilityRole="radiogroup"
            style={
              styles.options
            }
          >
            {OPTIONS.map(
              (
                item,
              ) => {
                const selected =
                  value ===
                  item.value;

                return (
                  <Pressable
                    key={
                      item.value
                    }
                    accessibilityRole="radio"
                    accessibilityLabel={`Sort by ${item.label}`}
                    accessibilityState={{
                      selected,
                    }}
                    onPress={() =>
                      handleChange(
                        item.value,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.item,

                      selected
                        ? styles.selectedItem
                        : null,

                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    {/* ========================================
                        LEFT
                    ======================================== */}

                    <View
                      style={
                        styles.left
                      }
                    >
                      <View
                        style={[
                          styles.iconBox,

                          selected
                            ? styles.selectedIconBox
                            : null,
                        ]}
                      >
                        <AppIcon
                          name={
                            item.icon
                          }
                          role="customer"
                          size="sm"
                          state={
                            selected
                              ? "active"
                              : "muted"
                          }
                        />
                      </View>

                      <AppText
                        variant="bodyMedium"
                        weight={
                          selected
                            ? "bold"
                            : "medium"
                        }
                        numberOfLines={1}
                        style={[
                          styles.label,

                          selected
                            ? styles.selectedLabel
                            : null,
                        ]}
                      >
                        {item.label}
                      </AppText>
                    </View>

                    {/* ========================================
                        SELECTION
                    ======================================== */}

                    <View
                      style={[
                        styles.radio,

                        selected
                          ? styles.radioSelected
                          : null,
                      ]}
                    >
                      {selected ? (
                        <AppIcon
                          name="check"
                          role="customer"
                          size="xs"
                          color={
                            Colors.textInverse
                          }
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.overlayLight,
    },

    /* ========================================================
       POPUP
    ======================================================== */

    popup: {
      width: "100%",

      maxWidth: 420,

      alignSelf:
        "center",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       OPTIONS
    ======================================================== */

    options: {
      marginTop:
        FixxamTokens.spacing.xs,

      gap:
        FixxamTokens.spacing.xs,
    },

    item: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        "transparent",

      borderRadius:
        FixxamTokens.radius.md,
    },

    selectedItem: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       LEFT
    ======================================================== */

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    iconBox: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    selectedIconBox: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    label: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    selectedLabel: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       RADIO
    ======================================================== */

    radio: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    radioSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       PRESSED
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
  });

export default memo(
  WorkerSortPopup,
);