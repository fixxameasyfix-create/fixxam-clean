import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

type Props = {
  loading: boolean;
  children?: React.ReactNode;
};

export default function AppSkeleton({
  loading,
  children,
}: Props) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card} />
      <View style={styles.card} />
      <View style={styles.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  card: {
    width: "100%",
    height: 90,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#E2E8F0",
  },
});