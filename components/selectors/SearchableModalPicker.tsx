import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  label: string;

  placeholder: string;

  value: string;

  data: string[];

  onSelect: (
    value: string,
  ) => void;

  icon?: React.ComponentProps<
    typeof Ionicons
  >["name"];
};

/* ============================================================
   COMPONENT
============================================================ */

function SearchableModalPicker({
  label,
  placeholder,
  value,
  data,
  onSelect,
  icon,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const {
    height: screenHeight,
  } =
    useWindowDimensions();

  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredData =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return data;
      }

      return data.filter(
        (item) =>
          item
            .toLowerCase()
            .includes(keyword),
      );
    }, [
      data,
      search,
    ]);

  /* ==========================================================
     SHEET HEIGHT
  ========================================================== */

  const sheetMaxHeight =
    useMemo(() => {
      const preferredHeight =
        screenHeight * 0.7;

      const availableHeight =
        screenHeight -
        insets.top -
        FixxamTokens.spacing.xl;

      return Math.min(
        preferredHeight,
        availableHeight,
      );
    }, [
      insets.top,
      screenHeight,
    ]);

  /* ==========================================================
     OPEN
  ========================================================== */

  const handleOpen =
    useCallback(() => {
      setSearch("");
      setVisible(true);
    }, []);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      setVisible(false);
      setSearch("");
    }, []);

  /* ==========================================================
     SELECT
  ========================================================== */

  const handleSelect =
    useCallback(
      (item: string) => {
        onSelect(item);

        setVisible(false);
        setSearch("");
      },
      [onSelect],
    );

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item: string;
      }) => {
        const selected =
          value === item;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item}
            accessibilityState={{
              selected,
            }}
            onPress={() =>
              handleSelect(item)
            }
            style={({
              pressed,
            }) => [
              styles.item,

              selected
                ? styles.selectedItem
                : null,

              pressed
                ? styles.itemPressed
                : null,
            ]}
          >
            <AppText
              variant="bodyMedium"
              weight={
                selected
                  ? "bold"
                  : "medium"
              }
              numberOfLines={1}
              style={[
                styles.itemText,

                selected
                  ? styles.selectedText
                  : null,
              ]}
            >
              {item}
            </AppText>

            {selected ? (
              <View
                style={
                  styles.checkIcon
                }
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={
                    Colors.textInverse
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
     UI
  ========================================================== */

  return (
    <>
      {/* ======================================================
          LABEL
      ====================================================== */}

      <AppText
        variant="caption"
        weight="bold"
        style={styles.label}
      >
        {label}
      </AppText>

      {/* ======================================================
          COMPACT SELECTOR
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${
          value || placeholder
        }`}
        accessibilityHint={`Opens ${label} selection`}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.selector,

          pressed
            ? styles.selectorPressed
            : null,
        ]}
      >
        {/* LEADING ICON */}

        {icon ? (
          <View
            style={
              styles.leadingIconBox
            }
          >
            <Ionicons
              name={icon}
              size={24}
              color={
                Colors.textSecondary
              }
            />
          </View>
        ) : null}

        {/* VALUE */}

        <AppText
          variant="body"
          numberOfLines={1}
          style={[
            styles.selectorText,

            !value
              ? styles.placeholderText
              : null,
          ]}
        >
          {value || placeholder}
        </AppText>

        {/* CHEVRON */}

        <View
          style={
            styles.chevronBox
          }
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={
              WorkerColors.primary
            }
          />
        </View>
      </Pressable>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={
          handleClose
        }
      >
        <View
          style={
            styles.modalRoot
          }
        >
          {/* BACKDROP */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close picker"
            onPress={
              handleClose
            }
            style={
              styles.backdrop
            }
          />

          {/* BOTTOM SHEET */}

          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,

              {
                maxHeight:
                  sheetMaxHeight,

                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens.spacing.md,
                  ),
              },
            ]}
          >
            {/* HANDLE */}

            <View
              style={
                styles.handle
              }
            />

            {/* HEADER */}

            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  variant="heading3"
                  weight="bold"
                  style={
                    styles.headerTitle
                  }
                >
                  Select {label}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.headerSubtitle
                  }
                >
                  Search and choose an option below.
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                onPress={
                  handleClose
                }
                style={({ pressed }) => [
                  styles.closeButton,

                  pressed
                    ? styles.closeButtonPressed
                    : null,
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={
                    WorkerColors.primary
                  }
                />
              </Pressable>
            </View>

            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={
                  Colors.textMuted
                }
              />

              <TextInput
                value={search}
                onChangeText={
                  setSearch
                }
                placeholder={`Search ${label}`}
                placeholderTextColor={
                  Colors.textMuted
                }
                selectionColor={
                  WorkerColors.primary
                }
                cursorColor={
                  WorkerColors.primary
                }
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="search"
                accessibilityLabel={`Search ${label}`}
                style={
                  styles.searchInput
                }
              />

              {search ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={8}
                  onPress={() =>
                    setSearch("")
                  }
                  style={
                    styles.clearSearch
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={
                      Colors.textMuted
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            {/* LIST */}

            <FlatList
              data={filteredData}
              keyExtractor={(item) =>
                item
              }
              renderItem={
                renderItem
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.listContent
              }
              ListEmptyComponent={
                <View
                  style={
                    styles.emptyContainer
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Ionicons
                      name="search-outline"
                      size={22}
                      color={
                        WorkerColors.primary
                      }
                    />
                  </View>

                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.emptyTitle
                    }
                  >
                    No results found
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    center
                  >
                    Try a different search.
                  </AppText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

export default memo(
  SearchableModalPicker,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       LABEL
    ======================================================== */

    label: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,

      fontSize: 12,
      lineHeight: 16,
    },

    /* ========================================================
       COMPACT SELECTOR
    ======================================================== */

    selector: {
      width: "100%",

      minHeight: 54,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingLeft:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius: 12,

      backgroundColor:
        Colors.surface,
    },

    selectorPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    leadingIconBox: {
      width: 32,

      height: 36,

      marginRight: 6,

      alignItems: "center",

      justifyContent:
        "center",

      flexShrink: 0,
    },

    selectorText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,

      fontSize: 15,

      lineHeight: 19,
    },

    placeholderText: {
      color:
        Colors.textMuted,
    },

    chevronBox: {
      width: 36,

      height: 36,

      marginLeft: 6,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius: 18,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       SHEET
    ======================================================== */

    sheet: {
      width: "100%",

      minHeight: 360,

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
      width: 42,

      height: 4,

      alignSelf: "center",

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
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop: 2,

      color:
        Colors.textSecondary,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    closeButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      minHeight: 48,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight: 46,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,

      includeFontPadding:
        false,
    },

    clearSearch: {
      width: 34,

      height: 34,

      marginLeft:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      paddingBottom:
        FixxamTokens.spacing.md,
    },

    item: {
      minHeight: 50,

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    itemPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    itemText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    selectedItem: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    selectedText: {
      color:
        Colors.textInverse,
    },

    checkIcon: {
      width: 28,

      height: 28,

      marginLeft:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      minHeight: 180,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width: 48,

      height: 48,

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },
  });