import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type BookingLocationSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
};

type Props = {
  value: string;

  onChange: (text: string) => void;

  disabled?: boolean;

  suggestions?: BookingLocationSuggestion[];

  suggestionsLoading?: boolean;

  onSearchLocation?: (query: string) => void;

  onSuggestionSelected?: (
    suggestion: BookingLocationSuggestion,
  ) => void;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

function BookingManualLocation({
  value,
  onChange,
  disabled = false,
  suggestions = [],
  suggestionsLoading = false,
  onSearchLocation,
  onSuggestionSelected,
}: Props) {
  const [focused, setFocused] =
    useState(false);

  const hasValue =
    value.trim().length > 0;

  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const handleChange = useCallback(
    (text: string) => {
      onChange(text);

      onSearchLocation?.(text);
    },
    [
      onChange,
      onSearchLocation,
    ],
  );

  /*
   * ==========================================================
   * CLEAR
   * ==========================================================
   */

  const handleClear = useCallback(() => {
    if (disabled) {
      return;
    }

    onChange("");
    onSearchLocation?.("");
  }, [
    disabled,
    onChange,
    onSearchLocation,
  ]);

  /*
   * ==========================================================
   * SELECT SUGGESTION
   * ==========================================================
   */

  const handleSuggestionPress =
    useCallback(
      (
        suggestion: BookingLocationSuggestion,
      ) => {
        if (disabled) {
          return;
        }

        onChange(suggestion.title);

        onSuggestionSelected?.(
          suggestion,
        );
      },
      [
        disabled,
        onChange,
        onSuggestionSelected,
      ],
    );

  /*
   * ==========================================================
   * SHOW SUGGESTIONS
   * ==========================================================
   */

  const showSuggestions =
    focused &&
    value.trim().length >= 2 &&
    (suggestionsLoading ||
      suggestions.length > 0);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.labelRow}>
        <View style={styles.labelIcon}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#2563EB"
          />
        </View>

        <View style={styles.labelContent}>
          <AppText
            weight="bold"
            style={styles.label}
          >
            Service address
          </AppText>

          <AppText
            style={styles.labelHint}
          >
            Search for the place where the
            worker should come
          </AppText>
        </View>
      </View>

      {/* INPUT */}

      <View
        style={[
          styles.inputContainer,

          focused &&
            !disabled &&
            styles.inputFocused,

          disabled &&
            styles.inputDisabled,
        ]}
      >
        <View
          style={[
            styles.inputIcon,

            focused &&
              !disabled &&
              styles.inputIconFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={
              focused
                ? "#2563EB"
                : "#64748B"
            }
          />
        </View>

        <TextInput
          value={value}
          onChangeText={handleChange}
          editable={!disabled}
          placeholder="House number, street, area..."
          placeholderTextColor="#94A3B8"
          multiline
          maxLength={200}
          autoCorrect={false}
          autoCapitalize="words"
          textAlignVertical="top"
          style={styles.input}
          accessibilityRole="text"
          accessibilityLabel="Service address"
          accessibilityHint="Search for the address where the worker should come"
          onFocus={() =>
            setFocused(true)
          }
          onBlur={() => {
            /*
             * Small delay allows the customer
             * to tap a suggestion before the
             * suggestion list disappears.
             */
            setTimeout(() => {
              setFocused(false);
            }, 150);
          }}
        />

        {suggestionsLoading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          </View>
        ) : hasValue && !disabled ? (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear service address"
            style={({ pressed }) => [
              styles.clearButton,

              pressed &&
                styles.clearPressed,
            ]}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      {/* SUGGESTIONS */}

      {showSuggestions ? (
        <View style={styles.suggestionsCard}>
          {suggestionsLoading ? (
            <View
              style={styles.loadingRow}
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <AppText
                style={styles.loadingText}
              >
                Finding locations...
              </AppText>
            </View>
          ) : (
            suggestions.map(
              (suggestion) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() =>
                    handleSuggestionPress(
                      suggestion,
                    )
                  }
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${suggestion.title}`}
                  style={({ pressed }) => [
                    styles.suggestionRow,

                    pressed &&
                      styles.suggestionPressed,
                  ]}
                >
                  <View
                    style={
                      styles.suggestionIcon
                    }
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#2563EB"
                    />
                  </View>

                  <View
                    style={
                      styles.suggestionContent
                    }
                  >
                    <AppText
                      weight="bold"
                      numberOfLines={1}
                      style={
                        styles.suggestionTitle
                      }
                    >
                      {suggestion.title}
                    </AppText>

                    {suggestion.subtitle ? (
                      <AppText
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

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#94A3B8"
                  />
                </Pressable>
              ),
            )
          )}
        </View>
      ) : null}

      {/* HELPER */}

      <View style={styles.helperRow}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color="#94A3B8"
        />

        <AppText
          style={styles.helperText}
        >
          Select a suggested location for
          accurate directions, or enter the
          address manually.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingManualLocation,
);

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  labelIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  labelContent: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 13.5,
    lineHeight: 19,
    color: "#0F172A",
  },

  labelHint: {
    marginTop: 1,
    fontSize: 10.5,
    lineHeight: 15,
    color: "#64748B",
  },

  inputContainer: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  inputFocused: {
    borderColor: "#2563EB",
  },

  inputDisabled: {
    backgroundColor: "#F8FAFC",
    opacity: 0.6,
  },

  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  inputIconFocused: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    padding: 0,
    marginTop: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: "#0F172A",
  },

  loadingContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  clearPressed: {
    opacity: 0.55,
  },

  /*
   * SUGGESTIONS
   */

  suggestionsCard: {
    marginTop: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  loadingRow: {
    minHeight: 52,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  loadingText: {
    marginLeft: 9,
    fontSize: 11.5,
    color: "#64748B",
  },

  suggestionRow: {
    minHeight: 62,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  suggestionPressed: {
    backgroundColor: "#F8FAFC",
  },

  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  suggestionContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 7,
  },

  suggestionTitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: "#0F172A",
  },

  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    color: "#64748B",
  },

  /*
   * HELPER
   */

  helperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
    paddingHorizontal: 2,
  },

  helperText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#94A3B8",
  },
});