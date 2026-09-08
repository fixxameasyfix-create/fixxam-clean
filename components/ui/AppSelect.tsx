import React, { memo, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "./AppIcon";
import AppText from "./AppText";

import {
  CustomerColors,
  FixxamTokens,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export type AppSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export interface AppSelectProps {
  label?: string;
  placeholder?: string;

  value?: string | null;
  options: AppSelectOption[];

  onChange: (value: string) => void;

  role?: FixxamRole;

  // Legacy compatibility
  variant?: "customer" | "worker";

  required?: boolean;
  disabled?: boolean;

  error?: string;
  helperText?: string;
}

function AppSelect({
  label,
  placeholder = "Select option",
  value,
  options,
  onChange,
  role = "customer",
  variant,
  required = false,
  disabled = false,
  error,
  helperText,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);

  const resolvedRole: FixxamRole =
    variant ?? role;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const selectedOption = useMemo(
    () =>
      options.find(
        (option) => option.value === value,
      ),
    [options, value],
  );

  const handleSelect = (
    option: AppSelectOption,
  ) => {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    setOpen(false);
  };

  const borderColor = error
    ? colors.error
    : open
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText
            variant="label"
            tone={disabled ? "muted" : "default"}
          >
            {label}
          </AppText>

          {required ? (
            <AppText
              variant="label"
              tone="error"
            >
              {" *"}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{
          disabled,
          expanded: open,
        }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor,
            backgroundColor: disabled
              ? colors.disabledBackground
              : colors.surface,
          },
          pressed && !disabled
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          variant="bodyLarge"
          tone={
            selectedOption
              ? "default"
              : "muted"
          }
          numberOfLines={1}
          style={styles.value}
        >
          {selectedOption?.label ??
            placeholder}
        </AppText>

        <AppIcon
          name="down"
          role={resolvedRole}
          size="sm"
          state={
            disabled
              ? "muted"
              : open
                ? "active"
                : "default"
          }
        />
      </Pressable>

      {error ? (
        <View style={styles.supportingRow}>
          <AppIcon
            name="error"
            role={resolvedRole}
            size="xs"
            state="error"
          />

          <AppText
            variant="caption"
            tone="error"
          >
            {error}
          </AppText>
        </View>
      ) : helperText ? (
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.helperText}
        >
          {helperText}
        </AppText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
            onPress={() => undefined}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor:
                    colors.borderStrong,
                },
              ]}
            />

            {label ? (
              <AppText
                variant="heading3"
                style={styles.sheetTitle}
              >
                {label}
              </AppText>
            ) : null}

            <FlatList
              data={options}
              keyExtractor={(item) =>
                item.value
              }
              showsVerticalScrollIndicator={
                false
              }
              renderItem={({ item }) => {
                const selected =
                  item.value === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                      disabled:
                        item.disabled,
                    }}
                    disabled={item.disabled}
                    onPress={() =>
                      handleSelect(item)
                    }
                    style={({ pressed }) => [
                      styles.option,

                      selected && {
                        backgroundColor:
                          colors.primarySoft,
                      },

                      pressed &&
                      !item.disabled
                        ? styles.pressed
                        : null,

                      item.disabled
                        ? styles.disabled
                        : null,
                    ]}
                  >
                    <AppText
                      variant="bodyLarge"
                      tone={
                        item.disabled
                          ? "muted"
                          : selected
                            ? "primary"
                            : "default"
                      }
                      role={resolvedRole}
                      style={styles.optionText}
                    >
                      {item.label}
                    </AppText>

                    {selected ? (
                      <AppIcon
                        name="check"
                        role={resolvedRole}
                        size="sm"
                        state="active"
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  trigger: {
    minHeight:
      FixxamTokens.size.inputHeight,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius:
      FixxamTokens.radius.input,

    paddingHorizontal:
      FixxamTokens.spacing.md,
  },

  value: {
    flex: 1,

    marginRight:
      FixxamTokens.spacing.sm,
  },

  supportingRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.xs,
  },

  helperText: {
    marginTop:
      FixxamTokens.spacing.xs,
  },

  overlay: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
  },

  sheet: {
    maxHeight: "70%",

    borderTopLeftRadius:
      FixxamTokens.radius.bottomSheet,

    borderTopRightRadius:
      FixxamTokens.radius.bottomSheet,

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    paddingTop:
      FixxamTokens.spacing.sm,

    paddingBottom:
      FixxamTokens.spacing.xxl,
  },

  handle: {
    width: 40,
    height: 4,

    alignSelf: "center",

    borderRadius:
      FixxamTokens.radius.full,

    marginBottom:
      FixxamTokens.spacing.lg,
  },

  sheetTitle: {
    marginBottom:
      FixxamTokens.spacing.md,
  },

  option: {
    minHeight:
      FixxamTokens.size.buttonHeight,

    flexDirection: "row",
    alignItems: "center",

    borderRadius:
      FixxamTokens.radius.md,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.xs,
  },

  optionText: {
    flex: 1,
  },

  pressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,
  },

  disabled: {
    opacity:
      FixxamTokens.motion.disabledOpacity,
  },
});

export default memo(AppSelect);