import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import AppIcon from "./AppIcon";

import {
  CustomerColors,
  FixxamTokens,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AppSearchBarProps
  extends Omit<
    TextInputProps,
    | "style"
    | "value"
    | "onChangeText"
    | "role"
  > {
  value: string;

  onChangeText: (text: string) => void;

  role?: FixxamRole;

  /*
   * Legacy compatibility.
   */
  variant?: "customer" | "worker";

  placeholder?: string;

  loading?: boolean;

  showClearButton?: boolean;

  showFilterButton?: boolean;

  filterActive?: boolean;

  onFilterPress?: () => void;

  onClear?: () => void;

  containerStyle?: StyleProp<ViewStyle>;
}

function AppSearchBar({
  value,
  onChangeText,
  role = "customer",
  variant,
  placeholder = "Search",
  loading = false,
  showClearButton = true,
  showFilterButton = false,
  filterActive = false,
  onFilterPress,
  onClear,
  containerStyle,
  editable = true,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...props
}: AppSearchBarProps) {
  const [focused, setFocused] =
    useState(false);

  const resolvedRole: FixxamRole =
    variant ?? role;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const disabled = editable === false;

  const handleFocus: NonNullable<
    TextInputProps["onFocus"]
  > = useCallback(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur: NonNullable<
    TextInputProps["onBlur"]
  > = useCallback(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleClear = useCallback(() => {
    onChangeText("");
    onClear?.();
  }, [onChangeText, onClear]);

  const borderColor = focused
    ? colors.primary
    : colors.border;

  const backgroundColor = disabled
    ? colors.disabledBackground
    : colors.surface;

  const hasValue = value.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        containerStyle,
      ]}
    >
      <AppIcon
        name="search"
        role={resolvedRole}
        size="sm"
        state={
          focused
            ? "active"
            : disabled
              ? "muted"
              : "default"
        }
      />

      <TextInput
        {...props}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={
          colors.textMuted
        }
        selectionColor={colors.primary}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={
          accessibilityLabel ??
          placeholder
        }
        accessibilityState={{
          disabled,
        }}
        style={[
          styles.input,
          Typography.styles.bodyLarge,
          {
            color: disabled
              ? colors.textMuted
              : colors.textPrimary,
          },
        ]}
      />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      ) : showClearButton &&
        hasValue ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={handleClear}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            name="close"
            role={resolvedRole}
            size="sm"
            state="muted"
          />
        </Pressable>
      ) : null}

      {showFilterButton ? (
        <>
          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.divider,
              },
            ]}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter search results"
            accessibilityState={{
              selected: filterActive,
            }}
            hitSlop={8}
            onPress={onFilterPress}
            style={({ pressed }) => [
              styles.filterButton,

              filterActive && {
                backgroundColor:
                  colors.primarySoft,
              },

              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name="filter"
              role={resolvedRole}
              size="sm"
              state={
                filterActive
                  ? "active"
                  : "default"
              }
            />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    minHeight:
      FixxamTokens.size.inputHeight,

    flexDirection: "row",
    alignItems: "center",

    gap: FixxamTokens.spacing.sm,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.search,
  },

  input: {
    flex: 1,

    minHeight:
      FixxamTokens.size.inputHeight,

    paddingVertical: 0,
  },

  iconButton: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    alignItems: "center",
    justifyContent: "center",
  },

  filterButton: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.iconButton,
  },

  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
  },

  pressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,
  },
});

export default memo(AppSearchBar);