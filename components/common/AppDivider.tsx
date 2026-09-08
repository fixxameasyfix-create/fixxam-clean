import React, { memo } from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type DividerOrientation =
  | "horizontal"
  | "vertical";

export interface AppDividerProps {
  orientation?: DividerOrientation;

  /*
   * Legacy/custom spacing support.
   */
  marginVertical?: number;
  marginHorizontal?: number;

  color?: string;

  thickness?: number;

  style?: StyleProp<ViewStyle>;
}

function AppDivider({
  orientation = "horizontal",

  marginVertical =
    FixxamTokens.spacing.lg,

  marginHorizontal = 0,

  color = Colors.divider,

  thickness = StyleSheet.hairlineWidth,

  style,
}: AppDividerProps) {
  const isHorizontal =
    orientation === "horizontal";

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.base,

        isHorizontal
          ? {
              width: "100%",
              height: thickness,

              marginVertical,
            }
          : {
              width: thickness,
              height: "100%",

              marginHorizontal,
            },

        {
          backgroundColor: color,
        },

        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,

    borderRadius:
      FixxamTokens.radius.full,
  },
});

export default memo(AppDivider);