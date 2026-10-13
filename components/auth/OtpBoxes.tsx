import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

interface OtpBoxesProps {
  value: string;

  onChange: (
    value: string,
  ) => void;

  onComplete?: (
    value: string,
  ) => void;

  role?: FixxamRole;

  editable?: boolean;

  error?: string;
}

const OTP_LENGTH = 6;

function OtpBoxes({
  value,
  onChange,
  onComplete,
  editable = true,
  error,
}: OtpBoxesProps) {
  const inputRefs =
    useRef<
      Array<
        TextInput | null
      >
    >([]);

  const focusTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const previousValueRef =
    useRef(value);

  const [focusedIndex, setFocusedIndex] =
    useState<number | null>(null);

  /* ============================================================
     FOCUS FIRST BOX
  ============================================================ */

  const focusFirstBox =
    useCallback(() => {
      if (!editable) {
        return;
      }

      if (
        focusTimerRef.current
      ) {
        clearTimeout(
          focusTimerRef.current,
        );
      }

      focusTimerRef.current =
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 120);
    }, [editable]);

  /* ============================================================
     INITIAL AUTOFOCUS
  ============================================================ */

  useEffect(() => {
    focusFirstBox();

    return () => {
      if (
        focusTimerRef.current
      ) {
        clearTimeout(
          focusTimerRef.current,
        );
      }
    };
  }, [focusFirstBox]);

  /* ============================================================
     REFOCUS AFTER OTP CLEAR
  ============================================================ */

  useEffect(() => {
    const previousValue =
      previousValueRef.current;

    previousValueRef.current =
      value;

    if (
      previousValue.length > 0 &&
      value.length === 0 &&
      editable
    ) {
      focusFirstBox();
    }
  }, [
    editable,
    focusFirstBox,
    value,
  ]);

  /* ============================================================
     RESET FOCUS STATE WHEN DISABLED
  ============================================================ */

  useEffect(() => {
    if (!editable) {
      setFocusedIndex(null);
    }
  }, [editable]);

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      if (
        focusTimerRef.current
      ) {
        clearTimeout(
          focusTimerRef.current,
        );
      }
    };
  }, []);

  /* ============================================================
     COMPLETE OTP

     Pass the completed value directly to onComplete()
     instead of waiting for React state.
  ============================================================ */

  const completeOtp =
    useCallback(
      (nextValue: string) => {
        const sanitized =
          nextValue
            .replace(/\D/g, "")
            .slice(
              0,
              OTP_LENGTH,
            );

        onChange(
          sanitized,
        );

        if (
          sanitized.length ===
          OTP_LENGTH
        ) {
          requestAnimationFrame(
            () => {
              onComplete?.(
                sanitized,
              );
            },
          );
        }
      },
      [
        onChange,
        onComplete,
      ],
    );

  /* ============================================================
     BUILD VALUE
  ============================================================ */

  const buildNextValue =
    useCallback(
      (
        index: number,
        digit: string,
      ): string => {
        const current =
          value
            .replace(/\D/g, "")
            .slice(
              0,
              OTP_LENGTH,
            )
            .split("");

        while (
          current.length <
          OTP_LENGTH
        ) {
          current.push("");
        }

        current[index] =
          digit;

        return current
          .join("")
          .slice(
            0,
            OTP_LENGTH,
          );
      },
      [value],
    );

  /* ============================================================
     CHANGE DIGIT
  ============================================================ */

  const handleChange =
    useCallback(
      (
        index: number,
        text: string,
      ) => {
        if (!editable) {
          return;
        }

        const digits =
          text.replace(
            /\D/g,
            "",
          );

        if (!digits) {
          return;
        }

        /* ------------------------------------------------------
           PASTE / AUTOFILL
        ------------------------------------------------------ */

        if (
          digits.length > 1
        ) {
          const pasted =
            digits.slice(
              0,
              OTP_LENGTH,
            );

          completeOtp(
            pasted,
          );

          const lastIndex =
            Math.min(
              pasted.length,
              OTP_LENGTH,
            ) - 1;

          if (
            lastIndex >= 0 &&
            pasted.length <
              OTP_LENGTH
          ) {
            inputRefs.current[
              lastIndex
            ]?.focus();
          }

          return;
        }

        /* ------------------------------------------------------
           SINGLE DIGIT
        ------------------------------------------------------ */

        const nextValue =
          buildNextValue(
            index,
            digits,
          );

        completeOtp(
          nextValue,
        );

        if (
          index <
          OTP_LENGTH - 1
        ) {
          inputRefs.current[
            index + 1
          ]?.focus();
        }
      },
      [
        buildNextValue,
        completeOtp,
        editable,
      ],
    );

  /* ============================================================
     BACKSPACE
  ============================================================ */

  const handleKeyPress =
    useCallback(
      (
        index: number,
        key: string,
      ) => {
        if (
          !editable ||
          key !== "Backspace"
        ) {
          return;
        }

        const digits =
          value
            .replace(/\D/g, "")
            .slice(
              0,
              OTP_LENGTH,
            );

        /* ------------------------------------------------------
           CURRENT BOX HAS A DIGIT
        ------------------------------------------------------ */

        if (
          digits[index]
        ) {
          const current =
            digits.split("");

          current[index] =
            "";

          onChange(
            current
              .join("")
              .slice(
                0,
                OTP_LENGTH,
              ),
          );

          return;
        }

        /* ------------------------------------------------------
           CURRENT BOX EMPTY
        ------------------------------------------------------ */

        if (
          index > 0
        ) {
          const previousIndex =
            index - 1;

          const current =
            digits.split("");

          current[
            previousIndex
          ] = "";

          onChange(
            current
              .join("")
              .slice(
                0,
                OTP_LENGTH,
              ),
          );

          inputRefs.current[
            previousIndex
          ]?.focus();
        }
      },
      [
        editable,
        onChange,
        value,
      ],
    );

  /* ============================================================
     CURRENT DIGITS
  ============================================================ */

  const digits =
    value
      .replace(/\D/g, "")
      .slice(
        0,
        OTP_LENGTH,
      );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={styles.container}
      accessibilityLabel="One-time verification code"
    >
      <View style={styles.boxRow}>
        {Array.from(
          {
            length:
              OTP_LENGTH,
          },
          (_, index) => {
            const digit =
              digits[index] ??
              "";

            const isFocused =
              focusedIndex ===
              index;

            return (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[
                    index
                  ] = ref;
                }}
                value={digit}
                onChangeText={text =>
                  handleChange(
                    index,
                    text,
                  )
                }
                onKeyPress={({
                  nativeEvent,
                }) =>
                  handleKeyPress(
                    index,
                    nativeEvent.key,
                  )
                }
                onFocus={() =>
                  setFocusedIndex(
                    index,
                  )
                }
                onBlur={() =>
                  setFocusedIndex(
                    current =>
                      current ===
                      index
                        ? null
                        : current,
                  )
                }
                keyboardType="number-pad"
                inputMode="numeric"
                textContentType={
                  index === 0
                    ? "oneTimeCode"
                    : "none"
                }
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                autoFocus={
                  index === 0
                }
                maxLength={1}
                editable={
                  editable
                }
                selectTextOnFocus
                returnKeyType="done"
                blurOnSubmit={false}
                importantForAutofill={
                  index === 0
                    ? "yes"
                    : "no"
                }
                style={[
                  styles.box,

                  isFocused &&
                    editable
                    ? styles.boxFocused
                    : null,

                  error
                    ? styles.boxError
                    : null,

                  !editable
                    ? styles.boxDisabled
                    : null,

                  digit
                    ? styles.boxFilled
                    : null,
                ]}
                accessibilityLabel={`Verification digit ${
                  index + 1
                }`}
              />
            );
          },
        )}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    boxRow: {
      width: "100%",

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    box: {
      flex: 1,

      minWidth: 0,

      height: 64,

      borderWidth: 1,

      borderColor:
        "#D5DDE8",

      borderRadius: 16,

      backgroundColor:
        "#F4F7FB",

      textAlign: "center",

      fontSize: 24,

      fontWeight: "600",

      color: "#172033",

      paddingVertical: 0,

      ...(Platform.OS ===
      "android"
        ? {
            includeFontPadding:
              false,
          }
        : {}),
    },

    boxFocused: {
      borderColor:
        "#2563EB",

      borderWidth: 2,

      backgroundColor:
        "#FFFFFF",
    },

    boxFilled: {
      borderColor:
        "#B8C5D6",

      backgroundColor:
        "#F0F4F9",
    },

    boxError: {
      borderColor:
        "#DC2626",

      borderWidth: 1.5,
    },

    boxDisabled: {
      opacity: 0.65,
    },
  });

export default memo(
  OtpBoxes,
);