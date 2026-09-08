import React, {
  memo,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
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

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function SearchBar({
  value,
  onChangeText,
}: Props) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={[
          styles.searchBox,

          focused
            ? styles.searchBoxFocused
            : null,
        ]}
      >
        <AppIcon
          name="search"
          role="customer"
          size="sm"
          color={
            focused
              ? CustomerColors.primary
              : Colors.textMuted
          }
        />

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          onFocus={() =>
            setFocused(true)
          }
          onBlur={() =>
            setFocused(false)
          }
          placeholder="Search materials, tools and more..."
          placeholderTextColor={
            Colors.textMuted
          }
          style={
            styles.input
          }
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search market products"
        />
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
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    searchBox: {
      width: "100%",

      height:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,
    },

    searchBoxFocused: {
      borderColor:
        CustomerColors.primary,
    },

    input: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },
  });

export default memo(
  SearchBar,
);