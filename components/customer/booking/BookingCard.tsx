import React, {
  ReactNode,
  memo,
} from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function BookingCard({
  children,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default memo(
  BookingCard,
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 14,
    paddingVertical: 14,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});