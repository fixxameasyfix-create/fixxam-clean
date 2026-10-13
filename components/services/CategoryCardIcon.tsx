import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  FixxamTokens,
} from "@/theme";

type IoniconName =
  React.ComponentProps<
    typeof Ionicons
  >["name"];

type Props = {
  icon?: string | null;

  iconColor: string;

  backgroundColor: string;

  size?: number;

  iconSize?: number;
};

const FALLBACK_ICON: IoniconName =
  "construct-outline";

function CategoryCardIcon({
  icon,
  iconColor,
  backgroundColor,
  size =
    FixxamTokens.size.iconBox,
  iconSize =
    FixxamTokens.size.iconMd,
}: Props) {
  const cleanIcon =
    typeof icon === "string"
      ? icon.trim()
      : "";

  const validIcon =
    cleanIcon &&
    Object.prototype.hasOwnProperty.call(
      Ionicons.glyphMap,
      cleanIcon,
    );

  const resolvedIcon =
    validIcon
      ? (cleanIcon as IoniconName)
      : FALLBACK_ICON;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
        },
      ]}
    >
      <Ionicons
        name={resolvedIcon}
        size={iconSize}
        color={iconColor}
      />
    </View>
  );
}

export default memo(
  CategoryCardIcon,
);

const styles =
  StyleSheet.create({
    container: {
      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },
  });