import React, {
  memo,
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

function PopularMaterialsSearch({
  value,
  onChangeText,
}: Props) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  return (
    <View
      style={[
        styles.container,

        focused
          ? styles.containerFocused
          : null,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={22}
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
        placeholder="Search materials, tools..."
        placeholderTextColor={
          Colors.textMuted
        }
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Search materials and tools"
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      height:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

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
  PopularMaterialsSearch,
);