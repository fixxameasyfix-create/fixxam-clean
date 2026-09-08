import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function ServicesSearch({
  value,
  onChangeText,
}: Props) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  const hasValue =
    value.trim().length >
    0;

  const handleClear =
    useCallback(() => {
      onChangeText("");
    }, [
      onChangeText,
    ]);

  return (
    <View
      style={[
        styles.container,

        focused
          ? styles.focusedContainer
          : null,
      ]}
    >
      {/* ========================================================
          SEARCH ICON
      ======================================================== */}

      <MaterialCommunityIcons
        name="magnify"
        size={
          FixxamTokens.size.iconMd
        }
        color={
          focused
            ? CustomerColors.primary
            : Colors.textMuted
        }
      />

      {/* ========================================================
          INPUT
      ======================================================== */}

      <TextInput
        accessibilityLabel="Search services"
        accessibilityHint="Search available services by name"
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        onFocus={() =>
          setFocused(
            true,
          )
        }
        onBlur={() =>
          setFocused(
            false,
          )
        }
        placeholder="Search services..."
        placeholderTextColor={
          Colors.textMuted
        }
        selectionColor={
          CustomerColors.primary
        }
        autoCorrect={
          false
        }
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        maxLength={80}
        style={
          styles.input
        }
      />

      {/* ========================================================
          CLEAR
      ======================================================== */}

      {hasValue ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear service search"
          hitSlop={4}
          onPress={
            handleClear
          }
          style={({
            pressed,
          }) => [
            styles.clearButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={
              FixxamTokens.size.iconSm
            }
            color={
              Colors.textMuted
            }
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export default memo(
  ServicesSearch,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    focusedContainer: {
      borderColor:
        CustomerColors.primary,
    },

    input: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize: 15,

      color:
        Colors.textPrimary,
    },

    clearButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

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