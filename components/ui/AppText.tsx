import React from "react";
import {
  Text,
  TextProps,
  StyleSheet,
} from "react-native";

import {
  Typography,
  Colors,
} from "@/theme";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  size?: keyof typeof Typography.fontSize;
  weight?: keyof typeof Typography.fontWeight;
  color?: string;
  center?: boolean;
}

export default function AppText({
  children,
  size = "md",
  weight = "regular",
  color = Colors.textPrimary,
  center = false,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles.text,
        {
          fontSize: Typography.fontSize[size],
          fontWeight:
            Typography.fontWeight[weight],
          color,
          textAlign: center ? "center" : "left",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});