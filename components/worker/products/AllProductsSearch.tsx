import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
  value: string;

  onChangeText: (
    text: string,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function AllProductsSearch({
  value,
  onChangeText,
}: Props) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  const handleFocus =
    useCallback(() => {
      setFocused(true);
    }, []);

  const handleBlur =
    useCallback(() => {
      setFocused(false);
    }, []);

  return (
    <View
      style={[
        styles.container,

        focused
          ? styles.containerFocused
          : null,
      ]}
    >
      {/* ======================================================
          MATERIAL COMMUNITY ICON PRESERVED
      ====================================================== */}

      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={
          focused
            ? WorkerColors.primary
            : Colors.textMuted
        }
      />

      {/* ======================================================
          INPUT
      ====================================================== */}

      <TextInput
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        onFocus={
          handleFocus
        }
        onBlur={
          handleBlur
        }
        placeholder="Search products..."
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
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
        underlineColorAndroid="transparent"
        accessibilityLabel="Search products"
        accessibilityHint="Search your products by name"
        style={
          styles.input
        }
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

AllProductsSearch.displayName =
  "AllProductsSearch";

export default memo(
  AllProductsSearch,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

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

    containerFocused: {
      borderColor:
        WorkerColors.primary,
    },

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },
  });