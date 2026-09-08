import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type BookingLocationSuggestion = {
  id: string;

  title: string;

  subtitle?: string;

  latitude: number;

  longitude: number;
};

type Props = {
  value: string;

  onChange: (
    text: string,
  ) => void;

  disabled?: boolean;

  /**
   * true:
   * Search + suggestions are enabled.
   *
   * false:
   * Customer manually enters the
   * complete address without search.
   */
  searchEnabled?: boolean;

  suggestions?: BookingLocationSuggestion[];

  suggestionsLoading?: boolean;

  onSearchLocation?: (
    query: string,
  ) => void;

  onSuggestionSelected?: (
    suggestion: BookingLocationSuggestion,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MIN_SEARCH_LENGTH = 2;

const MAX_ADDRESS_LENGTH = 200;

const BLUR_DELAY = 150;

/* ==============================================================
   COMPONENT
============================================================== */

function BookingManualLocation({
  value,
  onChange,
  disabled = false,
  searchEnabled = true,
  suggestions = [],
  suggestionsLoading = false,
  onSearchLocation,
  onSuggestionSelected,
}: Props) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  const blurTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ============================================================
     DERIVED STATE
  ============================================================ */

  const cleanValue =
    value.trim();

  const hasValue =
    cleanValue.length >
    0;

  const canSearch =
    cleanValue.length >=
    MIN_SEARCH_LENGTH;

  const searchLoading =
    searchEnabled &&
    suggestionsLoading;

  const showSuggestions =
    searchEnabled &&
    focused &&
    canSearch &&
    (
      suggestionsLoading ||
      suggestions.length > 0
    );

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      if (
        blurTimerRef.current
      ) {
        clearTimeout(
          blurTimerRef.current,
        );

        blurTimerRef.current =
          null;
      }
    };
  }, []);

  /* ============================================================
     CHANGE
  ============================================================ */

  const handleChange =
    useCallback(
      (
        text: string,
      ) => {
        const nextValue =
          text.slice(
            0,
            MAX_ADDRESS_LENGTH,
          );

        onChange(
          nextValue,
        );

        if (
          searchEnabled
        ) {
          onSearchLocation?.(
            nextValue,
          );
        }
      },
      [
        onChange,
        onSearchLocation,
        searchEnabled,
      ],
    );

  /* ============================================================
     CLEAR
  ============================================================ */

  const handleClear =
    useCallback(() => {
      if (
        disabled
      ) {
        return;
      }

      onChange(
        "",
      );

      if (
        searchEnabled
      ) {
        onSearchLocation?.(
          "",
        );
      }
    }, [
      disabled,
      onChange,
      onSearchLocation,
      searchEnabled,
    ]);

  /* ============================================================
     FOCUS
  ============================================================ */

  const handleFocus =
    useCallback(() => {
      if (
        blurTimerRef.current
      ) {
        clearTimeout(
          blurTimerRef.current,
        );

        blurTimerRef.current =
          null;
      }

      setFocused(
        true,
      );
    }, []);

  /* ============================================================
     BLUR
  ============================================================ */

  const handleBlur =
    useCallback(() => {
      if (
        blurTimerRef.current
      ) {
        clearTimeout(
          blurTimerRef.current,
        );
      }

      /*
       * Search mode needs a small delay
       * so tapping a suggestion still
       * works before the list disappears.
       *
       * Manual-only mode does not need
       * the delay.
       */
      if (
        !searchEnabled
      ) {
        setFocused(
          false,
        );

        return;
      }

      blurTimerRef.current =
        setTimeout(
          () => {
            setFocused(
              false,
            );

            blurTimerRef.current =
              null;
          },
          BLUR_DELAY,
        );
    }, [
      searchEnabled,
    ]);

  /* ============================================================
     SELECT SUGGESTION
  ============================================================ */

  const handleSuggestionPress =
    useCallback(
      (
        suggestion:
          BookingLocationSuggestion,
      ) => {
        if (
          disabled ||
          !searchEnabled
        ) {
          return;
        }

        if (
          blurTimerRef.current
        ) {
          clearTimeout(
            blurTimerRef.current,
          );

          blurTimerRef.current =
            null;
        }

        onChange(
          suggestion.title,
        );

        onSuggestionSelected?.(
          suggestion,
        );

        onSearchLocation?.(
          "",
        );

        setFocused(
          false,
        );
      },
      [
        disabled,
        onChange,
        onSearchLocation,
        onSuggestionSelected,
        searchEnabled,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          LABEL
      ====================================================== */}

      <View
        style={
          styles.labelRow
        }
      >
        <View
          style={
            styles.labelIcon
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="xs"
            state="active"
          />
        </View>

        <View
          style={
            styles.labelContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            Service address
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.labelHint
            }
          >
            {searchEnabled
              ? "Search for where the worker should come."
              : "Enter the complete address where the worker should come."}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          INPUT
      ====================================================== */}

      <View
        style={[
          styles.inputContainer,

          focused &&
          !disabled
            ? styles.inputFocused
            : null,

          disabled
            ? styles.inputDisabled
            : null,
        ]}
      >
        {/* ====================================================
            INPUT ICON
        ==================================================== */}

        <View
          style={[
            styles.inputIcon,

            focused &&
            !disabled
              ? styles.inputIconFocused
              : null,
          ]}
        >
          <AppIcon
            name={
              searchEnabled
                ? "search"
                : "location"
            }
            role="customer"
            size="sm"
            state={
              focused
                ? "active"
                : "muted"
            }
          />
        </View>

        {/* ====================================================
            TEXT INPUT
        ==================================================== */}

        <TextInput
          value={
            value
          }
          onChangeText={
            handleChange
          }
          onFocus={
            handleFocus
          }
          onBlur={
            handleBlur
          }
          editable={
            !disabled
          }
          placeholder={
            searchEnabled
              ? "House number, street, area..."
              : "Enter full service address..."
          }
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          maxLength={
            MAX_ADDRESS_LENGTH
          }
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType={
            searchEnabled
              ? "search"
              : "done"
          }
          accessibilityLabel="Service address"
          accessibilityHint={
            searchEnabled
              ? "Search for the address where the worker should come"
              : "Enter the complete address where the worker should come"
          }
          style={
            styles.input
          }
        />

        {/* ====================================================
            LOADING / CLEAR
        ==================================================== */}

        {searchLoading ? (
          <View
            style={
              styles.trailingButton
            }
          >
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
            />
          </View>
        ) : hasValue &&
          !disabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear service address"
            hitSlop={8}
            onPress={
              handleClear
            }
            style={({
              pressed,
            }) => [
              styles.trailingButton,

              pressed
                ? styles.clearPressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              role="customer"
              size="xs"
              state="muted"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          SUGGESTIONS
      ====================================================== */}

      {showSuggestions ? (
        <View
          style={
            styles.suggestionsCard
          }
        >
          {suggestionsLoading ? (
            <View
              style={
                styles.loadingRow
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
              >
                Finding locations...
              </AppText>
            </View>
          ) : (
            suggestions.map(
              (
                suggestion,
                index,
              ) => {
                const isLast =
                  index ===
                  suggestions.length -
                    1;

                return (
                  <Pressable
                    key={
                      suggestion.id
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${suggestion.title}`}
                    disabled={
                      disabled
                    }
                    onPress={() =>
                      handleSuggestionPress(
                        suggestion,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.suggestionRow,

                      !isLast
                        ? styles.suggestionBorder
                        : null,

                      pressed &&
                      !disabled
                        ? styles.suggestionPressed
                        : null,
                    ]}
                  >
                    <View
                      style={
                        styles.suggestionIcon
                      }
                    >
                      <AppIcon
                        name="location"
                        role="customer"
                        size="xs"
                        state="active"
                      />
                    </View>

                    <View
                      style={
                        styles.suggestionContent
                      }
                    >
                      <AppText
                        variant="bodyMedium"
                        weight="semibold"
                        numberOfLines={1}
                      >
                        {
                          suggestion.title
                        }
                      </AppText>

                      {suggestion.subtitle ? (
                        <AppText
                          variant="caption"
                          tone="secondary"
                          numberOfLines={2}
                          style={
                            styles.suggestionSubtitle
                          }
                        >
                          {
                            suggestion.subtitle
                          }
                        </AppText>
                      ) : null}
                    </View>

                    <AppIcon
                      name="next"
                      role="customer"
                      size="xs"
                      state="muted"
                    />
                  </Pressable>
                );
              },
            )
          )}
        </View>
      ) : null}

      {/* ======================================================
          HELPER
      ====================================================== */}

      <View
        style={
          styles.helperRow
        }
      >
        <AppIcon
          name="info"
          role="customer"
          size="xs"
          state="muted"
        />

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.helperText
          }
        >
          {searchEnabled
            ? "Select a suggested location for the most accurate directions."
            : "Enter the full address clearly so the worker can find the service location."}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       LABEL
    ======================================================== */

    labelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    labelIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    labelContent: {
      flex: 1,

      minWidth: 0,
    },

    labelHint: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputContainer: {
      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    inputFocused: {
      borderColor:
        CustomerColors.primary,
    },

    inputDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,

      backgroundColor:
        Colors.disabledBackground,
    },

    inputIcon: {
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

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.background,
    },

    inputIconFocused: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    input: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      paddingVertical: 0,

      paddingHorizontal: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    trailingButton: {
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
        FixxamTokens.radius
          .iconButton,
    },

    clearPressed: {
      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       SUGGESTIONS
    ======================================================== */

    suggestionsCard: {
      overflow:
        "hidden",

      marginTop:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    loadingRow: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    suggestionRow: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,
    },

    suggestionBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    suggestionPressed: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    suggestionIcon: {
      width: 38,

      height: 38,

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

    suggestionContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    suggestionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       HELPER
    ======================================================== */

    helperRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xxs,
    },

    helperText: {
      flex: 1,

      minWidth: 0,
    },
  });

export default memo(
  BookingManualLocation,
);