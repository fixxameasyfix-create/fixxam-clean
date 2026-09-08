import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  type TextInputKeyPressEventData,
  type NativeSyntheticEvent,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";

import {
  CustomerColors,
  FixxamTokens,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

const OTP_LENGTH = 6;

export interface OtpBoxesProps {
  value: string;

  onChange: (value: string) => void;

  onComplete?: (value: string) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  editable?: boolean;

  error?: string;

  helperText?: string;

  autoFocus?: boolean;
}

function OtpBoxes({
  value,
  onChange,
  onComplete,

  role = "customer",
  variant,

  editable = true,

  error,
  helperText,

  autoFocus = false,
}: OtpBoxesProps) {
  const inputs =
    useRef<Array<TextInput | null>>([]);

  const [focusedIndex, setFocusedIndex] =
    useState<number | null>(null);

  const resolvedRole: FixxamRole =
    variant ?? role;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const sanitizedValue = useMemo(
    () =>
      value
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH),
    [value],
  );

  const digits = useMemo(
    () =>
      Array.from(
        { length: OTP_LENGTH },
        (_, index) =>
          sanitizedValue[index] ?? "",
      ),
    [sanitizedValue],
  );

  const emitValue = useCallback(
    (nextValue: string) => {
      const sanitized = nextValue
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);

      onChange(sanitized);

      if (sanitized.length === OTP_LENGTH) {
        onComplete?.(sanitized);
      }
    },
    [onChange, onComplete],
  );

  const handleChange = useCallback(
    (text: string, index: number) => {
      const incoming = text.replace(
        /\D/g,
        "",
      );

      if (!incoming) {
        const next =
          sanitizedValue.split("");

        next.splice(index, 1);

        emitValue(next.join(""));
        return;
      }

      /*
       * Supports typing a single digit
       * and pasting multiple OTP digits.
       */
      if (incoming.length > 1) {
        const prefix =
          sanitizedValue.slice(0, index);

        const suffix =
          sanitizedValue.slice(
            index + incoming.length,
          );

        const next = (
          prefix +
          incoming +
          suffix
        ).slice(0, OTP_LENGTH);

        emitValue(next);

        const nextFocusIndex = Math.min(
          index + incoming.length,
          OTP_LENGTH - 1,
        );

        inputs.current[
          next.length >= OTP_LENGTH
            ? OTP_LENGTH - 1
            : nextFocusIndex
        ]?.focus();

        return;
      }

      const next =
        sanitizedValue
          .padEnd(OTP_LENGTH, " ")
          .split("");

      next[index] = incoming;

      const nextValue = next
        .join("")
        .replace(/\s/g, "");

      emitValue(nextValue);

      if (index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }
    },
    [emitValue, sanitizedValue],
  );

  const handleKeyPress = useCallback(
    (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number,
    ) => {
      if (
        event.nativeEvent.key ===
          "Backspace" &&
        !digits[index] &&
        index > 0
      ) {
        inputs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  return (
    <View style={styles.wrapper}>
      <View
        accessibilityLabel="One-time verification code"
        style={styles.container}
      >
        {digits.map((digit, index) => {
          const focused =
            focusedIndex === index;

          const borderColor = error
            ? colors.error
            : focused
              ? colors.primary
              : digit
                ? colors.borderStrong
                : colors.border;

          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              editable={editable}
              autoFocus={
                autoFocus && index === 0
              }
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              importantForAutofill="yes"
              selectTextOnFocus
              textAlign="center"
              cursorColor={colors.primary}
              selectionColor={colors.primary}
              accessibilityLabel={`OTP digit ${
                index + 1
              } of ${OTP_LENGTH}`}
              accessibilityState={{
                disabled: !editable,
              }}
              onFocus={() =>
                setFocusedIndex(index)
              }
              onBlur={() =>
                setFocusedIndex((current) =>
                  current === index
                    ? null
                    : current,
                )
              }
              onChangeText={(text) =>
                handleChange(text, index)
              }
              onKeyPress={(event) =>
                handleKeyPress(event, index)
              }
              style={[
                styles.box,
                Typography.styles.heading3,
                {
                  borderColor,
                  color: editable
                    ? colors.textPrimary
                    : colors.textMuted,
                  backgroundColor: editable
                    ? colors.surface
                    : colors.disabledBackground,
                },
              ]}
            />
          );
        })}
      </View>

      {error ? (
        <AppText
          variant="caption"
          tone="error"
          style={styles.supportingText}
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.supportingText}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  container: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: FixxamTokens.spacing.sm,
  },

  box: {
    flex: 1,

    minWidth: 0,

    height: FixxamTokens.size.otpBox,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.input,

    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  supportingText: {
    marginTop:
      FixxamTokens.spacing.sm,
  },
});

export default memo(OtpBoxes);